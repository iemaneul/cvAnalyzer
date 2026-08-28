from app.services.competencies import analyze_competencies, extract_competencies


def test_extracts_bilingual_competencies_without_generic_noise():
    assert extract_competencies("Liderança técnica, mentoria e resolução de problemas") == [
        "Technical leadership", "Mentoring", "Problem solving"
    ]
    assert extract_competencies("Responsible for daily software delivery") == []


def test_compares_required_and_preferred_competencies():
    result = analyze_competencies(
        "Technical leadership and mentoring in distributed products.",
        "Required: technical leadership and communication skills. Nice to have: mentoring.",
    )
    assert result["alignment"] == 57
    assert result["matched"] == ["Technical leadership", "Mentoring"]
    assert result["missing"] == ["Communication"]


def test_ignores_negated_competency():
    result = analyze_competencies("Mentoring", "Mentoring is not required.")
    assert result["requirements"] == []

