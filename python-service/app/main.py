from fastapi import FastAPI, File, Form, HTTPException, UploadFile

from app.schemas.analysis import AnalysisResult
from app.services.analyzer import analyze
from app.services.pdf import extract_pdf_text

app = FastAPI(title="cvAnalyzer Service", version="1.0.0")


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalysisResult)
async def analyze_resume(
    resume: UploadFile = File(...), jobDescription: str = Form(...)
) -> dict:
    if resume.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="The selected file must be a PDF.")
    content = await resume.read()
    try:
        text = extract_pdf_text(content)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return analyze(text, jobDescription)

