from fastapi import Body, FastAPI, File, Form, HTTPException, UploadFile, Response

from app.schemas.analysis import AnalysisResult
from app.services.analyzer import analyze
from app.services.pdf import extract_pdf_text
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
        text = extract_pdf_text(content)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return analyze(text, jobDescription)


@app.post("/report")
def create_report(analysis: dict = Body(...)) -> Response:
    content = build_report(analysis)
    return Response(content=content, media_type="application/pdf")
