import re

EDUCATION = {
    "High school": (1, ["high school", "ensino médio", "ensino medio"]),
    "Technical degree": (2, ["technical degree", "technical course", "curso técnico", "curso tecnico", "tecnólogo", "tecnologo"]),
    "Bachelor's degree": (3, ["bachelor's degree", "bachelor degree", "bachelor", "undergraduate degree", "graduação", "graduacao", "bacharelado"]),
    "Master's degree": (4, ["master's degree", "master degree", "master of", "mestrado"]),
    "Doctorate": (5, ["doctorate", "doctoral", "phd", "doutorado"]),
}
LANGUAGES = {
    "English": ["english", "inglês", "ingles"],
    "Portuguese": ["portuguese", "português", "portugues"],
    "Spanish": ["spanish", "espanhol"],
    "French": ["french", "francês", "frances"],
    "German": ["german", "alemão", "alemao"],
}
PROFICIENCIES = {
    "basic": (1, ["basic", "básico", "basico", "a1", "a2"]),
    "intermediate": (2, ["intermediate", "intermediário", "intermediario", "b1", "b2"]),
    "advanced": (3, ["advanced", "avançado", "avancado", "c1"]),
    "fluent": (4, ["fluent", "fluente", "professional proficiency", "c2"]),
    "native": (5, ["native", "nativo", "nativa", "mother tongue", "língua materna", "lingua materna"]),
}
CERTIFICATIONS = {
    "AWS Certified": ["aws certified", "aws certification", "certificação aws", "certificacao aws"],
    "Microsoft Azure Certified": ["azure certified", "azure certification", "certificação azure", "certificacao azure"],
    "Google Cloud Certified": ["google cloud certified", "gcp certification", "certificação gcp", "certificacao gcp"],
    "PMP": ["pmp", "project management professional"],
    "Scrum": ["certified scrum", "scrum master certification", "psm i", "psm ii", "csm"],
}


def _normalized(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower()).strip()


def _has(text: str, alias: str) -> bool:
    return bool(re.search(rf"(?<![\w]){re.escape(alias)}(?![\w])", text))


def extract_education(text: str) -> dict | None:
    normalized = _normalized(text)
    found = [
        {"level": level, "rank": rank} for level, (rank, aliases) in EDUCATION.items()
        if any(_has(normalized, alias) for alias in aliases)
    ]
    return max(found, key=lambda item: item["rank"]) if found else None


def extract_languages(text: str) -> list[dict]:
    results = []
    for language, aliases in LANGUAGES.items():
        pattern = "|".join(re.escape(alias) for alias in aliases)
        matches = list(re.finditer(rf"(?<![\w])(?:{pattern})(?![\w])", text, re.IGNORECASE))
        if not matches:
            continue
        best = None
        for match in matches:
            context = _normalized(text[max(0, match.start() - 45):match.end() + 45])
            levels = [
                {"level": level, "rank": rank} for level, (rank, markers) in PROFICIENCIES.items()
                if any(_has(context, marker) for marker in markers)
            ]
            candidate = max(levels, key=lambda item: item["rank"]) if levels else None
            if candidate and (best is None or candidate["rank"] > best["rank"]):
                best = candidate
        results.append({"language": language, "level": best["level"] if best else None, "rank": best["rank"] if best else None})
    return results


def extract_certifications(text: str) -> list[str]:
    normalized = _normalized(text)
    return [name for name, aliases in CERTIFICATIONS.items() if any(_has(normalized, alias) for alias in aliases)]


def analyze_qualifications(resume: str, job: str) -> dict:
    resume_education, required_education = extract_education(resume), extract_education(job)
    education_status = None
    if required_education:
        education_status = "missing" if not resume_education else (
            "met" if resume_education["rank"] >= required_education["rank"] else "gap"
        )
    resume_languages = {item["language"]: item for item in extract_languages(resume)}
    required_languages = extract_languages(job)
    language_comparisons = []
    for required in required_languages:
        found = resume_languages.get(required["language"])
        if not found:
            status = "missing"
        elif required["rank"] is None or (found["rank"] is not None and found["rank"] >= required["rank"]):
            status = "met"
        else:
            status = "unknown" if found["rank"] is None else "gap"
        language_comparisons.append({
            "language": required["language"], "requiredLevel": required["level"],
            "resumeLevel": found["level"] if found else None, "status": status,
        })
    resume_certifications = extract_certifications(resume)
    required_certifications = extract_certifications(job)
    certification_comparisons = [
        {"certification": name, "status": "met" if name in resume_certifications else "missing"}
        for name in required_certifications
    ]
    statuses = ([education_status] if education_status else []) + [item["status"] for item in language_comparisons] + [item["status"] for item in certification_comparisons]
    alignment = round(statuses.count("met") / len(statuses) * 100) if statuses else None
    return {
        "alignment": alignment,
        "education": {"required": required_education, "resume": resume_education, "status": education_status},
        "languages": language_comparisons,
        "certifications": certification_comparisons,
        "resumeLanguages": list(resume_languages.values()),
        "resumeCertifications": resume_certifications,
    }

