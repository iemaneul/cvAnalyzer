import re

from app.services.qualifications import analyze_qualifications
from app.services.action_plan import build_action_plan
from app.services.competencies import analyze_competencies
from app.services.structure import analyze_structure

SKILLS = {
    "React": ["react", "react.js", "reactjs"], "TypeScript": ["typescript"],
    "JavaScript": ["javascript"], "Node.js": ["node.js", "nodejs", "node"],
    "Express": ["express", "express.js"], "Python": ["python"], "FastAPI": ["fastapi"],
    "Django": ["django"], "Java": ["java"], "Spring Boot": ["spring boot", "springboot"],
    "C#": ["c#", "c sharp"], ".NET": [".net", "dotnet"], "PHP": ["php"],
    "Laravel": ["laravel"], "PostgreSQL": ["postgresql", "postgres"], "MySQL": ["mysql"],
    "SQL": ["sql"], "MongoDB": ["mongodb", "mongo db"], "Docker": ["docker"],
    "Kubernetes": ["kubernetes", "k8s"], "AWS": ["aws", "amazon web services"],
    "Azure": ["azure"], "GCP": ["gcp", "google cloud platform", "google cloud"],
    "Git": ["git"], "GitHub": ["github"], "GitLab": ["gitlab"],
    "REST API": ["rest api", "restful api", "restful"], "GraphQL": ["graphql"],
    "HTML": ["html", "html5"], "CSS": ["css", "css3"],
    "Tailwind CSS": ["tailwind css", "tailwind"], "Bootstrap": ["bootstrap"],
    "Jest": ["jest"], "Vitest": ["vitest"], "Cypress": ["cypress"], "Redis": ["redis"],
    "RabbitMQ": ["rabbitmq"], "Kafka": ["kafka"],
    "CI/CD": ["ci/cd", "continuous integration", "continuous delivery"],
}
IMPORTANCE = {"required": 3, "standard": 2, "preferred": 1}
PREFERRED_MARKERS = (
    "nice to have", "preferred", "desirable", "bonus", "differential",
    "desejável", "desejavel", "diferencial", "será um plus", "sera um plus",
)
REQUIRED_MARKERS = (
    "required", "must have", "mandatory", "essential", "requirement",
    "obrigatório", "obrigatorio", "essencial", "requisito", "necessário", "necessario",
)
NEGATION_PATTERNS = (
    r"\bnot required\b", r"\bno .{0,30} required\b",
    r"\bnão (?:é )?(?:necessário|obrigatório)\b",
    r"\bnao (?:e )?(?:necessario|obrigatorio)\b",
)


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower()).strip()


def _contains_alias(text: str, alias: str) -> bool:
    return bool(re.search(rf"(?<![\w]){re.escape(alias)}(?![\w])", text))


def extract_skills(text: str) -> list[str]:
    normalized = normalize_text(text)
    return [
        display for display, aliases in SKILLS.items()
        if any(_contains_alias(normalized, alias) for alias in aliases)
    ]


def _segments(text: str) -> list[str]:
    return [part.strip() for part in re.split(r"[\n\r]+|(?<=[.!?;])\s+", text) if part.strip()]


SECTION_NAMES = {
    "experience": ("experience", "work experience", "professional experience", "experiência", "experiencia profissional"),
    "projects": ("projects", "personal projects", "projetos", "projetos pessoais"),
    "skills": ("skills", "technical skills", "technologies", "competências", "competencias", "habilidades"),
    "education": ("education", "academic background", "formação", "formacao acadêmica", "formacao academica"),
    "courses": ("courses", "certifications", "cursos", "certificações", "certificacoes"),
}
SECTION_STRENGTH = {"experience": 100, "projects": 85, "skills": 55, "education": 45, "courses": 40, "other": 60}


def _sectioned_segments(text: str) -> list[tuple[str, str]]:
    current = "other"
    result = []
    for line in re.split(r"[\n\r]+", text):
        line = line.strip()
        if not line:
            continue
        heading = normalize_text(line).strip(":-–— ")
        detected = next(
            (name for name, aliases in SECTION_NAMES.items() if heading in aliases), None
        )
        if detected:
            current = detected
            continue
        result.extend((current, part) for part in _segments(line))
    return result


def _years_in(segment: str) -> int | None:
    matches = re.findall(r"\b(\d{1,2})\+?\s*(?:years?|anos?)\b", normalize_text(segment))
    return max(map(int, matches)) if matches else None


def _years_for_skill(segment: str, skill: str) -> int | None:
    clauses = re.split(r"\s+(?:and|e)\s+|[,;]", segment, flags=re.IGNORECASE)
    for clause in clauses:
        normalized = normalize_text(clause)
        if any(_contains_alias(normalized, alias) for alias in SKILLS[skill]):
            return _years_in(clause)
    return None


def extract_evidence(text: str, skills: list[str]) -> list[dict]:
    segments = _sectioned_segments(text)
    evidence = []
    for skill in skills:
        occurrences = []
        for section, segment in segments:
            if any(_contains_alias(normalize_text(segment), alias) for alias in SKILLS[skill]):
                excerpt = re.sub(r"\s+", " ", segment).strip()
                years = _years_for_skill(segment, skill)
                strength = min(100, SECTION_STRENGTH[section] + (10 if years else 0))
                occurrences.append({
                    "excerpt": excerpt[:220] + ("…" if len(excerpt) > 220 else ""),
                    "section": section, "years": years, "strength": strength,
                })
        occurrences.sort(key=lambda item: item["strength"], reverse=True)
        best = occurrences[0] if occurrences else {"section": "other", "years": None, "strength": 0}
        evidence.append({
            "skill": skill, "excerpts": [item["excerpt"] for item in occurrences[:2]],
            "section": best["section"], "years": best["years"], "strength": best["strength"],
        })
    return evidence


def extract_job_requirements(text: str) -> list[dict]:
    requirements: dict[str, dict] = {}
    for segment in _segments(text):
        normalized = normalize_text(segment)
        skills = extract_skills(segment)
        if not skills or any(re.search(pattern, normalized) for pattern in NEGATION_PATTERNS):
            continue
        if any(marker in normalized for marker in PREFERRED_MARKERS):
            importance = "preferred"
        elif any(marker in normalized for marker in REQUIRED_MARKERS):
            importance = "required"
        else:
            importance = "standard"
        for skill in skills:
            years_required = _years_for_skill(segment, skill)
            previous = requirements.get(skill)
            if previous is None:
                requirements[skill] = {"importance": importance, "yearsRequired": years_required}
            else:
                if IMPORTANCE[importance] > IMPORTANCE[previous["importance"]]:
                    previous["importance"] = importance
                if years_required is not None:
                    previous["yearsRequired"] = max(previous["yearsRequired"] or 0, years_required)
    return [
        {"skill": skill, **details, "weight": IMPORTANCE[details["importance"]]}
        for skill, details in requirements.items()
    ]


def _group_score(requirements: list[dict], resume: set[str], importance: str) -> int:
    group = [item for item in requirements if item["importance"] == importance]
    return round(sum(item["skill"] in resume for item in group) / len(group) * 100) if group else 0


def analyze(resume_text: str, job_description: str) -> dict:
    resume_skills = extract_skills(resume_text)
    requirements = extract_job_requirements(job_description)
    job_skills = [item["skill"] for item in requirements]
    resume_set = set(resume_skills)
    matched = [skill for skill in job_skills if skill in resume_set]
    missing = [skill for skill in job_skills if skill not in resume_set]
    total_weight = sum(item["weight"] for item in requirements)
    matched_weight = sum(item["weight"] for item in requirements if item["skill"] in resume_set)
    score = round(matched_weight / total_weight * 100) if total_weight else 0
    skill_requirements = [{**item, "matched": item["skill"] in resume_set} for item in requirements]
    evidence = extract_evidence(resume_text, resume_skills)
    evidence_by_skill = {item["skill"]: item for item in evidence}
    matched_evidence = [evidence_by_skill[skill]["strength"] for skill in matched]
    evidence_quality = round(sum(matched_evidence) / len(matched_evidence)) if matched_evidence else 0
    experience_comparisons = []
    for item in requirements:
        if item["yearsRequired"] is None:
            continue
        resume_years = evidence_by_skill.get(item["skill"], {}).get("years")
        status = "unknown" if resume_years is None else ("met" if resume_years >= item["yearsRequired"] else "gap")
        experience_comparisons.append({
            "skill": item["skill"], "requiredYears": item["yearsRequired"],
            "resumeYears": resume_years, "status": status,
        })
    known_experience = [item for item in experience_comparisons if item["status"] != "unknown"]
    experience_alignment = round(
        sum(item["status"] == "met" for item in known_experience) / len(known_experience) * 100
    ) if known_experience else None
    qualifications = analyze_qualifications(resume_text, job_description)
    competencies = analyze_competencies(resume_text, job_description)
    structure = analyze_structure(resume_text)
    action_plan = build_action_plan(
        requirements, resume_set, evidence_by_skill, experience_comparisons, qualifications,
        competencies, structure,
    )
    suggestions = []
    if not job_skills:
        suggestions.append("No known skills were detected in the job description.")
    elif score > 80:
        suggestions.append("Your resume has a strong match with this role.")
    elif score >= 50:
        suggestions.append("Your profile matches many requirements, but some key skills are missing.")
    else:
        suggestions.append("This role requires several skills that are not currently highlighted in your resume.")
    missing_ordered = sorted(
        (item for item in requirements if item["skill"] not in resume_set),
        key=lambda item: item["weight"], reverse=True,
    )
    suggestions.extend(
        f"Consider highlighting {item['skill']} experience if you genuinely have it."
        for item in missing_ordered
    )
    weak_matches = [skill for skill in matched if evidence_by_skill[skill]["strength"] <= 55]
    suggestions.extend(
        f"Show how you used {skill} in a professional experience or project."
        for skill in weak_matches
    )
    suggestions.extend(
        f"The role asks for {item['requiredYears']} years of {item['skill']}; clarify your experience duration if applicable."
        for item in experience_comparisons if item["status"] in ("unknown", "gap")
    )
    return {
        "score": score, "resumeSkills": resume_skills, "jobSkills": job_skills,
        "matchedSkills": matched, "missingSkills": missing, "suggestions": suggestions[:5],
        "skillRequirements": skill_requirements,
        "evidence": evidence, "evidenceQuality": evidence_quality,
        "experienceComparisons": experience_comparisons,
        "experienceAlignment": experience_alignment,
        "qualifications": qualifications,
        "actionPlan": action_plan,
        "competencies": competencies,
        "structure": structure,
        "scoreBreakdown": {
            "required": _group_score(requirements, resume_set, "required"),
            "standard": _group_score(requirements, resume_set, "standard"),
            "preferred": _group_score(requirements, resume_set, "preferred"),
        },
        "warning": None if job_skills else "No known skills were detected in the job description.",
    }
