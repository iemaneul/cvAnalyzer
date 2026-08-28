from app.services.analyzer import analyze, extract_skills


def test_extract_skills_normalizes_aliases():
    assert extract_skills("Built APIs using Node and React.js") == ["React", "Node.js"]


def test_score_and_skill_sets():
    result = analyze("React TypeScript Node Docker", "React TypeScript Node Docker AWS")
    assert result["score"] == 80
    assert result["matchedSkills"] == ["React", "TypeScript", "Node.js", "Docker"]
    assert result["missingSkills"] == ["AWS"]


def test_no_job_skills():
    result = analyze("Python", "Excellent communication required")
    assert result["score"] == 0
    assert result["warning"] is not None


def test_required_skills_have_more_weight_than_preferred_skills():
    result = analyze(
        "React and TypeScript in production projects.",
        "Required: React and TypeScript. Nice to have: AWS and Docker.",
    )
    assert result["score"] == 75
    assert result["scoreBreakdown"] == {"required": 100, "standard": 0, "preferred": 0}


def test_negated_requirement_is_ignored():
    result = analyze("React", "React is required. Docker is not required.")
    assert result["jobSkills"] == ["React"]
    assert result["score"] == 100


def test_evidence_contains_resume_context():
    result = analyze("Built customer dashboards using React and TypeScript.", "React required.")
    react = next(item for item in result["evidence"] if item["skill"] == "React")
    assert "customer dashboards" in react["excerpts"][0]


def test_professional_experience_is_stronger_than_skill_list():
    result = analyze(
        "Skills\nDocker\nProfessional Experience\nUsed React for 4 years building production dashboards.",
        "React and Docker are required for this position.",
    )
    evidence = {item["skill"]: item for item in result["evidence"]}
    assert evidence["React"]["section"] == "experience"
    assert evidence["React"]["years"] == 4
    assert evidence["React"]["strength"] == 100
    assert evidence["Docker"]["strength"] == 55
    assert result["evidenceQuality"] == 78


def test_compares_required_and_documented_years_without_guessing():
    result = analyze(
        "Professional Experience\nWorked with React for 4 years and Docker for 2 years in production.",
        "Required: 3+ years of React and 2 years of Docker. Nice to have: 5 years of AWS.",
    )
    comparisons = {item["skill"]: item for item in result["experienceComparisons"]}
    assert comparisons["React"]["status"] == "met"
    assert comparisons["React"]["resumeYears"] == 4
    assert comparisons["Docker"]["status"] == "met"
    assert comparisons["AWS"]["status"] == "unknown"
    assert result["experienceAlignment"] == 100
