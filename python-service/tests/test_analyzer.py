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

