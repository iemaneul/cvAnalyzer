from pydantic import BaseModel


class AnalysisResult(BaseModel):
    score: int
    resumeSkills: list[str]
    jobSkills: list[str]
    matchedSkills: list[str]
    missingSkills: list[str]
    suggestions: list[str]
    skillRequirements: list[dict]
    evidence: list[dict]
    evidenceQuality: int
    experienceComparisons: list[dict]
    experienceAlignment: int | None
    qualifications: dict
    actionPlan: list[dict]
    competencies: dict
    structure: dict
    scoreBreakdown: dict[str, int]
    warning: str | None = None
