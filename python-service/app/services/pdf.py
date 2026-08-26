from io import BytesIO

from pypdf import PdfReader


def extract_pdf_text(content: bytes) -> str:
    try:
        reader = PdfReader(BytesIO(content))
        text = "\n".join(page.extract_text() or "" for page in reader.pages).strip()
    except Exception as exc:
        raise ValueError("Unable to extract text from resume") from exc
    if not text:
        raise ValueError("Unable to extract text from resume")
    return text

