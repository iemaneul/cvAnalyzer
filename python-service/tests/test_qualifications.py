from app.services.qualifications import analyze_qualifications, extract_certifications, extract_languages


def test_compares_education_levels():
    result = analyze_qualifications("Master's degree in Computer Science", "Bachelor's degree required")
    assert result["education"]["status"] == "met"
    assert result["alignment"] == 100


def test_compares_language_proficiency_conservatively():
    result = analyze_qualifications("English: advanced", "Fluent English required")
    assert result["languages"][0]["status"] == "gap"
    assert result["alignment"] == 0


def test_language_without_documented_level_is_unknown():
    result = analyze_qualifications("English", "Advanced English required")
    assert result["languages"][0]["status"] == "unknown"


def test_certification_aliases():
    assert extract_certifications("AWS Certified Solutions Architect and PSM I") == ["AWS Certified", "Scrum"]
    assert extract_languages("Inglês avançado")[0]["level"] == "advanced"
