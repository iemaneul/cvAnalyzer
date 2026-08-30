from io import BytesIO

from pypdf import PdfReader

from app.services.report import build_report


def test_build_report_creates_readable_multipurpose_pdf():
    content = build_report({
        "fileName": "emanuel-resume.pdf", "score": 82, "evidenceQuality": 75,
        "structure": {"score": 90}, "matchedSkills": ["React", "Python"],
        "missingSkills": ["AWS"], "suggestions": ["Demonstrate AWS only if applicable."],
        "actionPlan": [{"priority": "high", "title": "Address AWS", "description": "Add a supported project or consider a learning project."}],
    })
    assert content.startswith(b"%PDF")
    reader = PdfReader(BytesIO(content))
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    assert "Resume Analyzer Report" in text
    assert "82%" in text
    assert "Address AWS" in text
