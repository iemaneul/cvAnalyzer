from io import BytesIO
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def _strings(value: object) -> list[str]:
    return [str(item) for item in value] if isinstance(value, list) else []


def _safe(value: object, fallback: str = "") -> str:
    return escape(str(value)) if value is not None else fallback


def build_report(analysis: dict) -> bytes:
    output = BytesIO()
    document = SimpleDocTemplate(
        output, pagesize=A4, rightMargin=18 * mm, leftMargin=18 * mm,
        topMargin=18 * mm, bottomMargin=18 * mm,
        title=f"Resume analysis - {analysis.get('fileName', 'resume')}",
    )
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="ReportTitle", parent=styles["Title"], textColor=colors.HexColor("#312E81"), alignment=TA_CENTER, spaceAfter=8))
    styles.add(ParagraphStyle(name="Section", parent=styles["Heading2"], textColor=colors.HexColor("#3730A3"), spaceBefore=12, spaceAfter=6))
    styles.add(ParagraphStyle(name="SmallMuted", parent=styles["BodyText"], fontSize=8, textColor=colors.HexColor("#64748B")))
    story = [Paragraph("Resume Analyzer Report", styles["ReportTitle"])]
    if analysis.get("jobTitle"):
        story.append(Paragraph(_safe(analysis["jobTitle"]), styles["Heading2"]))
    if analysis.get("company"):
        story.append(Paragraph(_safe(analysis["company"]), styles["Heading3"]))
    story.extend([
        Paragraph(_safe(analysis.get("fileName"), "Resume"), styles["SmallMuted"]),
        Spacer(1, 6),
    ])
    score = int(analysis.get("score", 0))
    summary = Table([["MATCH SCORE", f"{score}%"], ["Evidence quality", f"{analysis.get('evidenceQuality', 0)}%"], ["Structure", f"{(analysis.get('structure') or {}).get('score', 0)}%"]], colWidths=[65 * mm, 65 * mm])
    summary.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EEF2FF")), ("TEXTCOLOR", (0, 0), (-1, -1), colors.HexColor("#1E293B")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"), ("FONTSIZE", (0, 0), (-1, -1), 11),
        ("ALIGN", (1, 0), (1, -1), "RIGHT"), ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ("PADDING", (0, 0), (-1, -1), 8),
    ]))
    story.extend([summary, Paragraph("Skills", styles["Section"])])
    skill_rows = [["Matched skills", _safe(", ".join(_strings(analysis.get("matchedSkills"))) or "None")], ["Missing skills", _safe(", ".join(_strings(analysis.get("missingSkills"))) or "None")]]
    skills = Table([[Paragraph(cell, styles["BodyText"]) for cell in row] for row in skill_rows], colWidths=[38 * mm, 105 * mm])
    skills.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"), ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")), ("PADDING", (0, 0), (-1, -1), 7)]))
    story.append(skills)
    action_plan = analysis.get("actionPlan") if isinstance(analysis.get("actionPlan"), list) else []
    story.append(Paragraph("Prioritized action plan", styles["Section"]))
    if action_plan:
        for index, item in enumerate(action_plan, 1):
            if not isinstance(item, dict):
                continue
            priority = _safe(str(item.get("priority", "medium")).upper())
            story.append(Paragraph(f"<b>{index}. [{priority}] {_safe(item.get('title'))}</b>", styles["BodyText"]))
            story.append(Paragraph(_safe(item.get("description")), styles["SmallMuted"]))
            story.append(Spacer(1, 5))
    else:
        story.append(Paragraph("No action items were generated.", styles["BodyText"]))
    suggestions = _strings(analysis.get("suggestions"))
    if suggestions:
        story.append(Paragraph("Suggestions", styles["Section"]))
        story.extend(Paragraph(f"- {_safe(item)}", styles["BodyText"]) for item in suggestions)
    story.extend([
        Spacer(1, 12),
        Paragraph("This report measures textual alignment with detected requirements. It does not predict hiring decisions.", styles["SmallMuted"]),
    ])

    def footer(canvas, doc):
        canvas.saveState()
        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(colors.HexColor("#64748B"))
        canvas.drawString(18 * mm, 10 * mm, "Resume Analyzer")
        canvas.drawRightString(A4[0] - 18 * mm, 10 * mm, f"Page {doc.page}")
        canvas.restoreState()

    document.build(story, onFirstPage=footer, onLaterPages=footer)
    return output.getvalue()
