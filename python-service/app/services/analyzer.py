import re

SKILLS = {
    "React": ["react", "react.js", "reactjs"],
    "TypeScript": ["typescript"],
    "JavaScript": ["javascript"],
    "Node.js": ["node.js", "nodejs", "node"],
    "Express": ["express", "express.js"],
    "Python": ["python"],
    "FastAPI": ["fastapi"],
    "Django": ["django"],
    "PHP": ["php"],
    "Laravel": ["laravel"],
    "PostgreSQL": ["postgresql", "postgres"],
    "MySQL": ["mysql"],
    "MongoDB": ["mongodb", "mongo db"],
    "Docker": ["docker"],
    "Kubernetes": ["kubernetes", "k8s"],
    "AWS": ["aws", "amazon web services"],
    "Azure": ["azure"],
    "GCP": ["gcp", "google cloud platform"],
    "Git": ["git"],
    "GitHub": ["github"],
    "GitLab": ["gitlab"],
    "REST API": ["rest api", "restful api", "restful"],
    "GraphQL": ["graphql"],
    "HTML": ["html"],
    "CSS": ["css"],
    "Tailwind CSS": ["tailwind css", "tailwind"],
    "Bootstrap": ["bootstrap"],
    "Jest": ["jest"],
    "Cypress": ["cypress"],
    "Redis": ["redis"],
    "RabbitMQ": ["rabbitmq"],
    "Kafka": ["kafka"],
}


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower()).strip()


def extract_skills(text: str) -> list[str]:
    normalized = normalize_text(text)
    found = []
    for display, aliases in SKILLS.items():
        if any(re.search(rf"(?<![\w]){re.escape(alias)}(?![\w])", normalized) for alias in aliases):
            found.append(display)
    return found


def analyze(resume_text: str, job_description: str) -> dict:
    resume_skills = extract_skills(resume_text)
    job_skills = extract_skills(job_description)
    resume_set = set(resume_skills)
    matched = [skill for skill in job_skills if skill in resume_set]
    missing = [skill for skill in job_skills if skill not in resume_set]
    score = round(len(matched) / len(job_skills) * 100) if job_skills else 0
    suggestions = []
    if not job_skills:
        suggestions.append("No known skills were detected in the job description.")
    elif score > 80:
        suggestions.append("Your resume has a strong match with this role.")
    elif score >= 50:
        suggestions.append("Your profile matches many requirements, but some key skills are missing.")
    else:
        suggestions.append("This role requires several skills that are not currently highlighted in your resume.")
    suggestions.extend(
        f"Consider adding {skill} if you have practical experience with it." for skill in missing
    )
    return {
        "score": score,
        "resumeSkills": resume_skills,
        "jobSkills": job_skills,
        "matchedSkills": matched,
        "missingSkills": missing,
        "suggestions": suggestions[:5],
        "warning": None if job_skills else "No known skills were detected in the job description.",
    }

