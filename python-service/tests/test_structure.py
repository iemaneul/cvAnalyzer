from app.services.structure import analyze_structure


COMPLETE_RESUME = """Professional Summary
Full-stack developer focused on reliable products.
Professional Experience
• Improved conversion by 25% through a redesigned checkout.
Projects
Built an open-source analytics dashboard.
Skills
React, Python, PostgreSQL
Education
Bachelor's degree in Computer Science
Languages
English C1
email@example.com
https://linkedin.com/in/example
https://github.com/example
"""


def test_detects_sections_contacts_and_metrics():
    result = analyze_structure(COMPLETE_RESUME)
    assert {item["key"] for item in result["sections"] if item["detected"]} >= {
        "summary", "experience", "projects", "skills", "education", "languages"
    }
    assert result["contacts"] == {"email": True, "linkedin": True, "github": True}
    assert result["quantifiedAchievements"] == 1
    assert result["bulletCount"] == 1


def test_reports_important_missing_sections_without_inventing_content():
    result = analyze_structure("Skills\nPython and React\nemail@example.com")
    codes = {item["code"] for item in result["issues"]}
    assert {"missing_summary", "missing_experience", "missing_education"} <= codes
    assert "missing_metrics" not in codes


def test_flags_excessive_length():
    result = analyze_structure("Professional Experience\n" + "delivered product value " * 400)
    assert "resume_too_long" in {item["code"] for item in result["issues"]}

