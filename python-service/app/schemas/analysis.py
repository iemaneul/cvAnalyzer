from pydantic import BaseModel


class AnalysisResult(BaseModel):
    score: int
    resumeSkills: list[str]
    jobSkills: list[str]
    matchedSkills: list[str]
    missingSkills: list[str]
    suggestions: list[str]
    warning: str | None = None

