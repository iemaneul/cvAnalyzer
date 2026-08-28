import re

COMPETENCIES = {
    "Technical leadership": ("leadership", ["technical leadership", "tech lead", "liderança técnica", "lideranca tecnica"]),
    "Team leadership": ("leadership", ["team leadership", "led a team", "leading teams", "liderança de equipe", "lideranca de equipe", "liderei a equipe", "gestão de equipe", "gestao de equipe"]),
    "Mentoring": ("leadership", ["mentoring", "mentorship", "mentored", "mentor", "mentoria", "mentorei", "orientação técnica", "orientacao tecnica"]),
    "Communication": ("interpersonal", ["communication skills", "clear communication", "stakeholder communication", "comunicação", "comunicacao"]),
    "Problem solving": ("interpersonal", ["problem solving", "troubleshooting", "resolução de problemas", "resolucao de problemas"]),
    "Teamwork": ("interpersonal", ["teamwork", "team player", "cross-functional collaboration", "collaborative team", "trabalho em equipe", "colaboração entre equipes", "colaboracao entre equipes"]),
    "Software architecture": ("engineering", ["software architecture", "system architecture", "solution architecture", "arquitetura de software", "arquitetura de sistemas", "arquitetura da solução", "arquitetura da solucao"]),
    "Agile methodologies": ("process", ["agile methodologies", "agile development", "metodologias ágeis", "metodologias ageis", "desenvolvimento ágil", "desenvolvimento agil"]),
    "Scrum": ("process", ["scrum"]),
    "Stakeholder management": ("product", ["stakeholder management", "stakeholder engagement", "gestão de stakeholders", "gestao de stakeholders"]),
    "Product discovery": ("product", ["product discovery", "requirements discovery", "descoberta de produto", "levantamento de requisitos"]),
    "Remote collaboration": ("interpersonal", ["remote collaboration", "distributed team", "remote team", "colaboração remota", "colaboracao remota", "equipe distribuída", "equipe distribuida"]),
}
WEIGHTS = {"required": 3, "standard": 2, "preferred": 1}
REQUIRED = ("required", "must have", "mandatory", "essential", "obrigatório", "obrigatorio", "essencial", "requisito")
PREFERRED = ("nice to have", "preferred", "desirable", "bonus", "desejável", "desejavel", "diferencial")
NEGATED = (r"\bnot required\b", r"\bnão (?:é )?(?:necessário|obrigatório)\b", r"\bnao (?:e )?(?:necessario|obrigatorio)\b")


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower()).strip()


def _has(text: str, phrase: str) -> bool:
    return bool(re.search(rf"(?<![\w]){re.escape(phrase)}(?![\w])", text))


def _segments(text: str) -> list[str]:
    return [part.strip() for part in re.split(r"[\n\r]+|(?<=[.!?;])\s+", text) if part.strip()]


def extract_competencies(text: str) -> list[str]:
    normalized = _normalize(text)
    return [name for name, (_, aliases) in COMPETENCIES.items() if any(_has(normalized, alias) for alias in aliases)]


def analyze_competencies(resume: str, job: str) -> dict:
    resume_competencies = extract_competencies(resume)
    resume_set = set(resume_competencies)
    requirements: dict[str, str] = {}
    for segment in _segments(job):
        normalized = _normalize(segment)
        found = extract_competencies(segment)
        if any(re.search(pattern, normalized) for pattern in NEGATED):
            continue
        importance = "preferred" if any(marker in normalized for marker in PREFERRED) else (
            "required" if any(marker in normalized for marker in REQUIRED) else "standard"
        )
        for competency in found:
            previous = requirements.get(competency)
            if previous is None or WEIGHTS[importance] > WEIGHTS[previous]:
                requirements[competency] = importance
    items = [{
        "competency": name, "category": COMPETENCIES[name][0], "importance": importance,
        "matched": name in resume_set,
    } for name, importance in requirements.items()]
    total = sum(WEIGHTS[item["importance"]] for item in items)
    matched_weight = sum(WEIGHTS[item["importance"]] for item in items if item["matched"])
    evidence = []
    for competency in resume_competencies:
        excerpts = [
            re.sub(r"\s+", " ", segment)[:220]
            for segment in _segments(resume)
            if competency in extract_competencies(segment)
        ]
        evidence.append({"competency": competency, "category": COMPETENCIES[competency][0], "excerpts": excerpts[:2]})
    return {
        "alignment": round(matched_weight / total * 100) if total else None,
        "resumeCompetencies": resume_competencies,
        "requirements": items,
        "matched": [item["competency"] for item in items if item["matched"]],
        "missing": [item["competency"] for item in items if not item["matched"]],
        "evidence": evidence,
    }

