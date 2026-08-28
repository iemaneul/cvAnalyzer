PRIORITY_ORDER = {"high": 0, "medium": 1, "low": 2}


def build_action_plan(
    requirements: list[dict],
    resume_skills: set[str],
    evidence_by_skill: dict[str, dict],
    experience_comparisons: list[dict],
    qualifications: dict,
    competencies: dict,
) -> list[dict]:
    actions = []

    def add(priority: str, category: str, subject: str, title: str, description: str) -> None:
        actions.append({
            "id": f"{category}:{subject}".lower().replace(" ", "-"),
            "priority": priority, "category": category, "subject": subject,
            "title": title, "description": description,
        })

    for item in requirements:
        skill, importance = item["skill"], item["importance"]
        if skill not in resume_skills:
            priority = "high" if importance == "required" else ("medium" if importance == "standard" else "low")
            add(
                priority, "missing_skill", skill,
                f"Address the {importance} {skill} requirement",
                f"If you genuinely have {skill} experience, add a concrete achievement or project that demonstrates it. Otherwise, do not claim it; consider a focused learning project.",
            )
        elif evidence_by_skill.get(skill, {}).get("strength", 0) <= 55:
            add(
                "medium", "weak_evidence", skill, f"Strengthen the evidence for {skill}",
                f"Move beyond listing {skill}: describe where you used it, what you built, and the measurable outcome.",
            )

    for item in experience_comparisons:
        if item["skill"] not in resume_skills:
            continue
        if item["status"] == "gap":
            add(
                "high", "experience_gap", item["skill"], f"Clarify your {item['skill']} experience",
                f"The role requests {item['requiredYears']} years, while the resume explicitly documents {item['resumeYears']}. Keep the duration accurate and emphasize the depth and results of that experience.",
            )
        elif item["status"] == "unknown":
            add(
                "medium", "experience_duration", item["skill"], f"Add the duration of your {item['skill']} experience",
                f"The role requests {item['requiredYears']} years. State your real duration near the relevant role or project if it can be supported.",
            )

    education = qualifications["education"]
    if education["status"] in ("missing", "gap"):
        required = education["required"]["level"]
        add(
            "high", "education", required, f"Review the {required} requirement",
            "Add your completed education clearly if it is missing. If you do not meet this requirement, do not imply otherwise; emphasize equivalent practical experience when appropriate.",
        )
    for item in qualifications["languages"]:
        if item["status"] in ("missing", "gap", "unknown"):
            priority = "high" if item["status"] in ("missing", "gap") else "medium"
            add(
                priority, "language", item["language"], f"Clarify your {item['language']} proficiency",
                f"The role asks for {item['requiredLevel'] or 'documented'} {item['language']}. State your truthful level and include a recognized scale such as CEFR when possible.",
            )
    for item in qualifications["certifications"]:
        if item["status"] == "missing":
            add(
                "high", "certification", item["certification"], f"Review the {item['certification']} requirement",
                "Add this certification only if you hold it. Otherwise, verify whether it is mandatory and consider it as a future development goal.",
            )

    for item in competencies["requirements"]:
        if item["matched"]:
            continue
        priority = "high" if item["importance"] == "required" else (
            "medium" if item["importance"] == "standard" else "low"
        )
        add(
            priority, "competency", item["competency"],
            f"Address the {item['competency']} requirement",
            f"If your experience demonstrates {item['competency']}, add a specific situation, action, and outcome. Do not include generic claims without supporting evidence.",
        )

    actions.sort(key=lambda item: PRIORITY_ORDER[item["priority"]])
    return actions[:10]
