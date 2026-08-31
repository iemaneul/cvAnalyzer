from dataclasses import dataclass
from io import BytesIO

import pymupdf
import pytesseract
from PIL import Image
from pypdf import PdfReader

MAX_OCR_PAGES = 10
MIN_TEXT_CHARACTERS = 30


@dataclass(frozen=True)
class PDFExtraction:
    text: str
    method: str
    pages: int


def _native_text(content: bytes) -> tuple[str, int]:
    reader = PdfReader(BytesIO(content))
    return "\n".join(page.extract_text() or "" for page in reader.pages).strip(), len(reader.pages)


def _ocr_text(content: bytes) -> tuple[str, int]:
    document = pymupdf.open(stream=content, filetype="pdf")
    if len(document) > MAX_OCR_PAGES:
        raise ValueError(f"OCR supports resumes with up to {MAX_OCR_PAGES} pages")
    pages = []
    try:
        for page in document:
            pixmap = page.get_pixmap(matrix=pymupdf.Matrix(2, 2), alpha=False)
            image = Image.open(BytesIO(pixmap.tobytes("png")))
            try:
                text = pytesseract.image_to_string(image, lang="eng+por")
            except pytesseract.TesseractError:
                text = pytesseract.image_to_string(image, lang="eng")
            pages.append(text.strip())
    finally:
        document.close()
    return "\n".join(part for part in pages if part).strip(), len(pages)


def extract_pdf(content: bytes) -> PDFExtraction:
    try:
        text, pages = _native_text(content)
    except Exception as exc:
        raise ValueError("Unable to read resume PDF") from exc
    if len(text) >= MIN_TEXT_CHARACTERS:
        return PDFExtraction(text=text, method="native", pages=pages)
    try:
        text, pages = _ocr_text(content)
    except (pytesseract.TesseractNotFoundError, ValueError) as exc:
        raise ValueError(str(exc) if isinstance(exc, ValueError) else "OCR service is unavailable") from exc
    except Exception as exc:
        raise ValueError("Unable to extract text from scanned resume") from exc
    if len(text) < MIN_TEXT_CHARACTERS:
        raise ValueError("Unable to extract text from resume")
    return PDFExtraction(text=text, method="ocr", pages=pages)


def extract_pdf_text(content: bytes) -> str:
    return extract_pdf(content).text

