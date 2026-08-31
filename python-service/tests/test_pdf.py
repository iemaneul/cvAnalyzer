from io import BytesIO

from pypdf import PdfWriter

from app.services import pdf


def blank_pdf() -> bytes:
    output = BytesIO()
    writer = PdfWriter()
    writer.add_blank_page(width=612, height=792)
    writer.write(output)
    return output.getvalue()


def test_uses_native_text_without_ocr(monkeypatch):
    monkeypatch.setattr(pdf, "_native_text", lambda _content: ("Professional Experience with Python and React", 1))
    monkeypatch.setattr(pdf, "_ocr_text", lambda _content: (_ for _ in ()).throw(AssertionError("OCR should not run")))
    result = pdf.extract_pdf(b"pdf")
    assert result.method == "native"


def test_falls_back_to_ocr_for_image_only_pdf(monkeypatch):
    monkeypatch.setattr(pdf, "_native_text", lambda _content: ("", 1))
    monkeypatch.setattr(pdf, "_ocr_text", lambda _content: ("Scanned resume with Python, React, and Docker experience", 1))
    result = pdf.extract_pdf(blank_pdf())
    assert result.method == "ocr"
    assert "Scanned resume" in result.text


def test_rejects_ocr_output_without_meaningful_text(monkeypatch):
    monkeypatch.setattr(pdf, "_native_text", lambda _content: ("", 1))
    monkeypatch.setattr(pdf, "_ocr_text", lambda _content: ("x", 1))
    try:
        pdf.extract_pdf(blank_pdf())
        raise AssertionError("Expected extraction error")
    except ValueError as error:
        assert str(error) == "Unable to extract text from resume"
