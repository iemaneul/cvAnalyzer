from app.services.analyzer import analyze


def test_action_plan_orders_required_before_optional_skills():
    result = analyze(
        "Skills\nReact",
        "Required: React and AWS. Nice to have: Docker.",
    )
    actions = result["actionPlan"]
    assert actions[0]["subject"] == "AWS"
    assert actions[0]["priority"] == "high"
    assert next(item for item in actions if item["subject"] == "Docker")["priority"] == "low"


def test_action_plan_does_not_tell_candidate_to_claim_missing_skill():
    result = analyze("Python", "AWS is required for this position.")
    action = next(item for item in result["actionPlan"] if item["subject"] == "AWS")
    assert "If you genuinely have" in action["description"]
    assert "do not claim it" in action["description"]


def test_weak_skill_evidence_gets_medium_action():
    result = analyze("Skills\nReact", "React is required for this position.")
    action = next(item for item in result["actionPlan"] if item["category"] == "weak_evidence")
    assert action["priority"] == "medium"
