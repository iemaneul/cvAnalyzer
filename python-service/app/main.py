from fastapi import Body, FastAPI, File, Form, HTTPException, UploadFile, Response

from app.schemas.analysis import AnalysisResult
from app.services.analyzer import analyze
from app.services.pdf import extract_pdf
from app.services.report import build_report

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
        extraction = extract_pdf(content)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    result = analyze(extraction.text, jobDescription)
    result["extractionMethod"] = extraction.method
    return result


@app.post("/extract")
async def extract_resume_text(resume: UploadFile = File(...)) -> dict:
    if resume.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="The selected file must be a PDF.")
    try:
        extraction = extract_pdf(await resume.read())
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return {"text": extraction.text, "characters": len(extraction.text), "method": extraction.method, "pages": extraction.pages}


@app.post("/report")
def create_report(analysis: dict = Body(...)) -> Response:
    content = build_report(analysis)
    return Response(content=content, media_type="application/pdf")
