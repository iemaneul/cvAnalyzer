import math
import re

SECTIONS = {
    "summary": ("Professional summary", ["professional summary", "summary", "profile", "resumo profissional", "perfil profissional"]),
    "experience": ("Professional experience", ["professional experience", "work experience", "experience", "experiência profissional", "experiencia profissional"]),
    "projects": ("Projects", ["projects", "personal projects", "projetos", "projetos pessoais"]),
    "skills": ("Skills", ["skills", "technical skills", "technologies", "competências", "competencias", "habilidades"]),
    "education": ("Education", ["education", "academic background", "formação acadêmica", "formacao academica", "formação", "formacao"]),
    "languages": ("Languages", ["languages", "idiomas"]),
    "certifications": ("Certifications", ["certifications", "certificados", "certificações", "certificacoes"]),
}
SECTION_WEIGHTS = {"summary": 15, "experience": 25, "projects": 10, "skills": 20, "education": 15, "languages": 10, "certifications": 5}


def _normalize(value: str) -> str:
    return re.sub(r"\s+", " ", value.lower()).strip(" :-–—")


def _detected_sections(text: str) -> list[dict]:
    normalized_lines = {_normalize(line) for line in re.split(r"[\r\n]+", text) if line.strip()}
    return [{
        "key": key, "label": label,
        "detected": any(alias in normalized_lines for alias in aliases),
    } for key, (label, aliases) in SECTIONS.items()]


def analyze_structure(text: str) -> dict:
    sections = _detected_sections(text)
    present = {item["key"] for item in sections if item["detected"]}
    words = re.findall(r"\b[\wÀ-ÿ+#.]+\b", text)
    word_count = len(words)
    estimated_pages = max(1, math.ceil(word_count / 500))
    contacts = {
        "email": bool(re.search(r"\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b", text)),
        "linkedin": bool(re.search(r"(?:https?://)?(?:www\.)?linkedin\.com/in/[\w-]+", text, re.IGNORECASE)),
        "github": bool(re.search(r"(?:https?://)?(?:www\.)?github\.com/[\w-]+", text, re.IGNORECASE)),
    }
    lines = [line.strip() for line in re.split(r"[\r\n]+", text) if line.strip()]
    bullet_count = sum(bool(re.match(r"^[-*•●▪‣]", line)) for line in lines)
    quantified = [line for line in lines if re.search(
        r"\d+(?:[.,]\d+)?\s*%|(?:R\$|US\$|[$€£])\s*\d+|"
        r"(?:increased|reduced|improved|grew|saved|aumentou|reduziu|melhorou|elevou|economizou)\D{0,50}\d+",
        line, re.IGNORECASE,
    )]
    issues = []
    for key in ("summary", "experience", "skills", "education"):
        if key not in present:
            issues.append({"severity": "high", "code": f"missing_{key}", "message": f"Add a clearly labeled {SECTIONS[key][0]} section."})
    if "projects" not in present:
        issues.append({"severity": "medium", "code": "missing_projects", "message": "Add selected projects when they provide evidence not covered by professional experience."})
    if not contacts["linkedin"]:
        issues.append({"severity": "medium", "code": "missing_linkedin", "message": "Add a complete LinkedIn profile URL."})
    if not contacts["github"]:
        issues.append({"severity": "medium", "code": "missing_github", "message": "Add a GitHub profile URL when relevant to the role."})
    if word_count > 1100:
        issues.append({"severity": "medium", "code": "resume_too_long", "message": "The resume may be too long; prioritize recent and role-relevant evidence."})
    elif word_count < 180:
        issues.append({"severity": "medium", "code": "resume_too_short", "message": "The resume may be too short to demonstrate relevant experience."})
    if "experience" in present and not quantified:
        issues.append({"severity": "medium", "code": "missing_metrics", "message": "Add measurable outcomes to professional experience where they can be supported."})
    section_score = sum(SECTION_WEIGHTS[key] for key in present)
    contact_score = round(sum(contacts.values()) / len(contacts) * 10)
    score = min(100, round(section_score * 0.9 + contact_score))
    return {
        "score": score, "sections": sections,
        "missingSections": [item["key"] for item in sections if not item["detected"]],
        "contacts": contacts, "wordCount": word_count, "estimatedPages": estimated_pages,
        "bulletCount": bullet_count, "quantifiedAchievements": len(quantified), "issues": issues,
    }

