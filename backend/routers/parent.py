from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.schemas import (
    ParentCreate,
    ParentLogin,
    ParentOut,
    ParentFeedback,
    ParentStatsOut,
    ParentReportRequest,
    ParentReportOut,
)
from models.models import Parent, User
from helper import get_db
from auth import create_access_token, verify_token
from datetime import timedelta
from sqlalchemy import func
from llm import generate_parent_report
from io import BytesIO
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import LETTER
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.pdfgen import canvas
import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

router = APIRouter(prefix="/parents", tags=["parents"])


def send_email_with_pdf(to_email: str, subject: str, body: str, pdf_buffer: BytesIO, filename: str):
    """Helper function to send email with PDF attachment using SMTP."""
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER")
    smtp_password = os.getenv("SMTP_PASSWORD")
    from_email = os.getenv("SMTP_FROM_EMAIL", smtp_user)
    from_name = os.getenv("SMTP_FROM_NAME", "Toeho Learning Platform")
    
    if not smtp_user or not smtp_password:
        raise ValueError("SMTP credentials not configured in .env file")
    
    # Create message
    msg = MIMEMultipart()
    msg["From"] = f"{from_name} <{from_email}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    
    # Add body
    msg.attach(MIMEText(body, "plain"))
    
    # Add PDF attachment
    pdf_buffer.seek(0)
    pdf_attachment = MIMEApplication(pdf_buffer.read(), _subtype="pdf")
    pdf_attachment.add_header("Content-Disposition", "attachment", filename=filename)
    msg.attach(pdf_attachment)
    
    # Send email
    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(msg)
    
    pdf_buffer.seek(0)


@router.post("/register", response_model=ParentOut)
def register_parent(data: ParentCreate, db: Session = Depends(get_db)):
    existing = db.query(Parent).filter(Parent.username == data.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Parent username already exists")

    # ensure student exists (by username)
    student = db.query(User).filter(User.username == data.student_username).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    p = Parent(
        username=data.username,
        password=data.password,
        name=data.name,
        phone_number=data.phone_number,
        student_username=data.student_username,
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@router.post("/login")
def login_parent(data: ParentLogin, db: Session = Depends(get_db)):
    db_parent = db.query(Parent).filter(Parent.username == data.username).first()
    if not db_parent or db_parent.password != data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(
        data={"sub": db_parent.username},
        expires_delta=timedelta(hours=1),
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/feedback")
def send_feedback(payload: ParentFeedback, username: str = Depends(verify_token), db: Session = Depends(get_db)):
    # username is the subject from JWT; try to find a parent with that username
    parent = db.query(Parent).filter(Parent.username == username).first()
    if not parent:
        raise HTTPException(status_code=403, detail="Parent not found or not authenticated as parent")

    student = db.query(User).filter(User.username == parent.student_username).first()
    if not student:
        raise HTTPException(status_code=404, detail="Linked student not found")

    # Store feedback in the student's Parent_feedback column
    student.Parent_feedback = payload.feedback
    db.commit()
    db.refresh(student)
    return {"status": "ok", "student_username": student.username, "Parent_feedback": student.Parent_feedback}



@router.get("/stats", response_model=ParentStatsOut)
def parent_stats(username: str = Depends(verify_token), db: Session = Depends(get_db)):
    """Return statistics for the parent's linked child and a comparison to same-class students.

    The endpoint authenticates the caller as a parent (JWT sub == parent username),
    looks up the linked student by `student_username` and returns child stats plus
    aggregated comparisons (average score/accuracy, top score, rank, percentile).
    """
    # Verify parent
    parent = db.query(Parent).filter(Parent.username == username).first()
    if not parent:
        raise HTTPException(status_code=403, detail="Parent not found or not authenticated as parent")

    student = db.query(User).filter(User.username == parent.student_username).first()
    if not student:
        raise HTTPException(status_code=404, detail="Linked student not found")

    # Determine class filter: prefer class_level if present, else use numeric level
    if student.class_level:
        class_filter = (User.class_level == student.class_level)
    else:
        class_filter = (User.level == student.level)

    total_students = db.query(func.count(User.id)).filter(class_filter).scalar() or 0

    avg_score = db.query(func.avg(User.score)).filter(class_filter).scalar() or 0.0

    total_correct = db.query(func.sum(User.correct_attempts)).filter(class_filter).scalar() or 0
    total_attempts = db.query(func.sum(User.total_attempts)).filter(class_filter).scalar() or 0
    avg_accuracy = (total_correct / total_attempts) if total_attempts else 0.0

    top_score = db.query(func.max(User.score)).filter(class_filter).scalar() or 0.0

    # Rank by score (1 = highest)
    higher_count = db.query(func.count(User.id)).filter(class_filter & (User.score > student.score)).scalar() or 0
    rank = int(higher_count) + 1
    percentile = 100.0 * (1.0 - (higher_count / total_students)) if total_students else 0.0

    child_stats = {
        "username": student.username,
        "name": student.name,
        "class_level": student.class_level,
        "level": student.level,
        "total_attempts": int(student.total_attempts or 0),
        "correct_attempts": int(student.correct_attempts or 0),
        "accuracy": (float(student.correct_attempts or 0) / float(student.total_attempts)) if student.total_attempts else 0.0,
        "score": float(student.score or 0.0),
        "current_streak": int(student.current_streak or 0),
        "max_streak": int(student.max_streak or 0),
    }

    comparison = {
        "class_count": int(total_students),
        "avg_score": float(avg_score or 0.0),
        "avg_accuracy": float(avg_accuracy or 0.0),
        "top_score": float(top_score or 0.0),
        "rank": int(rank),
        "percentile": float(percentile),
    }

    return {"child": child_stats, "comparison": comparison}


@router.post("/report", response_model=ParentReportOut)
def generate_child_report(payload: ParentReportRequest, username: str = Depends(verify_token), db: Session = Depends(get_db)):
    """Generate a short descriptive report for the parent's child.

    Accepts the child's stats (and optional comparison) and calls the LLM to
    produce a concise, parent-friendly summary. Auth verifies caller is the parent.
    """
    parent = db.query(Parent).filter(Parent.username == username).first()
    if not parent:
        raise HTTPException(status_code=403, detail="Parent not found or not authenticated as parent")

    try:
        text = generate_parent_report(
            child=dict(payload.child),
            comparison=dict(payload.comparison) if payload.comparison is not None else None,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM error: {e}")

    return {"report": text}


@router.post("/report/pdf")
def generate_child_report_pdf(payload: ParentReportRequest, username: str = Depends(verify_token), db: Session = Depends(get_db)):
    """Generate a short descriptive report, render as PDF, and send it.

    Returns an application/pdf response with a suggested filename.
    """
    parent = db.query(Parent).filter(Parent.username == username).first()
    if not parent:
        raise HTTPException(status_code=403, detail="Parent not found or not authenticated as parent")

    # Get report text via LLM
    try:
        report_text = generate_parent_report(
            child=dict(payload.child),
            comparison=dict(payload.comparison) if payload.comparison is not None else None,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM error: {e}")

    # Render PDF in-memory with styled layout
    buffer = BytesIO()
    name = payload.child.name or payload.child.username
    cls = payload.child.class_level or payload.child.level

    doc = SimpleDocTemplate(buffer, pagesize=LETTER, rightMargin=48, leftMargin=48, topMargin=48, bottomMargin=48)
    styles = getSampleStyleSheet()
    # Custom styles
    title_style = ParagraphStyle(
        "TitleStyle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=22,
        textColor=colors.HexColor("#1F4AB8"),
        spaceAfter=12,
    )
    subtitle_style = ParagraphStyle(
        "SubtitleStyle",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        textColor=colors.HexColor("#555555"),
        spaceAfter=16,
    )
    body_style = ParagraphStyle(
        "BodyStyle",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#222222"),
    )

    elements = []

    # Header block with accent bar
    elements.append(Paragraph("Child Progress Report", title_style))
    elements.append(Paragraph(f"Student: <b>{name}</b> &nbsp;&nbsp;|&nbsp;&nbsp; Class: <b>{cls}</b>", subtitle_style))

    # Accent divider
    accent_table = Table([['']], colWidths=[doc.width])
    accent_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#1F4AB8')),
        ('LINEBELOW', (0,0), (-1,-1), 0, colors.white),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 1),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1),
    ]))
    elements.append(accent_table)
    elements.append(Spacer(1, 12))

    # Report text block
    elements.append(Paragraph(report_text.replace('\n', '<br/>'), body_style))
    elements.append(Spacer(1, 16))

    # Stats card grid
    stats_data = [
        ["Score", f"{payload.child.score:.2f}", "Accuracy", f"{payload.child.accuracy:.2f}"],
        ["Attempts", f"{payload.child.total_attempts}", "Correct", f"{payload.child.correct_attempts}"],
        ["Current Streak", f"{payload.child.current_streak}", "Max Streak", f"{payload.child.max_streak}"],
    ]
    stats_table = Table(stats_data, colWidths=[doc.width/4.0]*4)
    stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F0F5FF')),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor('#1A1A1A')),
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#D9E2FF')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#D9E2FF')),
        ('BACKGROUND', (0,1), (-1,-1), colors.white),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#FAFBFF')]),
    ]))
    elements.append(stats_table)

    # Optional comparison section
    if payload.comparison is not None:
        elements.append(Spacer(1, 18))
        elements.append(Paragraph("Class Comparison", ParagraphStyle(
            "CompTitle",
            parent=styles["Heading3"],
            fontName="Helvetica-Bold",
            fontSize=13,
            textColor=colors.HexColor("#1F4AB8"),
        )))

        comp = payload.comparison
        comp_data = [
            ["Class Count", str(comp.class_count), "Avg Score", f"{comp.avg_score:.2f}"],
            ["Avg Accuracy", f"{comp.avg_accuracy:.2f}", "Top Score", f"{comp.top_score:.2f}"],
            ["Rank", str(comp.rank), "Percentile", f"{comp.percentile:.2f}"],
        ]
        comp_table = Table(comp_data, colWidths=[doc.width/4.0]*4)
        comp_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#FFF5E6')),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#FFE0B2')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#FFE0B2')),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        elements.append(comp_table)

    # Footer note
    elements.append(Spacer(1, 20))
    elements.append(Paragraph(
        "This report is auto-generated to support learning. For detailed feedback, connect with your child on recent topics.",
        ParagraphStyle("Footer", parent=styles["BodyText"], fontSize=9, textColor=colors.HexColor('#666666'))
    ))

    doc.build(elements)
    buffer.seek(0)

    filename = f"report_{name}.pdf" if name else "report.pdf"
    headers = {"Content-Disposition": f"attachment; filename=\"{filename}\""}
    return StreamingResponse(buffer, media_type="application/pdf", headers=headers)


@router.post("/report/email")
def email_child_report(payload: ParentReportRequest, username: str = Depends(verify_token), db: Session = Depends(get_db)):
    """Generate PDF report and send it to the parent's email address.

    Requires the parent to have an email configured in their account.
    """
    parent = db.query(Parent).filter(Parent.username == username).first()
    if not parent:
        raise HTTPException(status_code=403, detail="Parent not found or not authenticated as parent")

    if not parent.email:
        raise HTTPException(status_code=400, detail="Parent email not configured. Please update your profile with an email address.")

    # Get report text via LLM
    try:
        report_text = generate_parent_report(
            child=dict(payload.child),
            comparison=dict(payload.comparison) if payload.comparison is not None else None,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM error: {e}")

    # Render PDF in-memory (reuse PDF generation logic)
    buffer = BytesIO()
    name = payload.child.name or payload.child.username
    cls = payload.child.class_level or payload.child.level

    doc = SimpleDocTemplate(buffer, pagesize=LETTER, rightMargin=48, leftMargin=48, topMargin=48, bottomMargin=48)
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        "TitleStyle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=22,
        textColor=colors.HexColor("#1F4AB8"),
        spaceAfter=12,
    )
    subtitle_style = ParagraphStyle(
        "SubtitleStyle",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        textColor=colors.HexColor("#555555"),
        spaceAfter=16,
    )
    body_style = ParagraphStyle(
        "BodyStyle",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=11,
        leading=15,
        textColor=colors.HexColor("#222222"),
    )

    elements = []

    # Header block with accent bar
    elements.append(Paragraph("Child Progress Report", title_style))
    elements.append(Paragraph(f"Student: <b>{name}</b> &nbsp;&nbsp;|&nbsp;&nbsp; Class: <b>{cls}</b>", subtitle_style))

    # Accent divider
    accent_table = Table([['']], colWidths=[doc.width])
    accent_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#1F4AB8')),
        ('LINEBELOW', (0,0), (-1,-1), 0, colors.white),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 1),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1),
    ]))
    elements.append(accent_table)
    elements.append(Spacer(1, 12))

    # Report text block
    elements.append(Paragraph(report_text.replace('\n', '<br/>'), body_style))
    elements.append(Spacer(1, 16))

    # Stats card grid
    stats_data = [
        ["Score", f"{payload.child.score:.2f}", "Accuracy", f"{payload.child.accuracy:.2f}"],
        ["Attempts", f"{payload.child.total_attempts}", "Correct", f"{payload.child.correct_attempts}"],
        ["Current Streak", f"{payload.child.current_streak}", "Max Streak", f"{payload.child.max_streak}"],
    ]
    stats_table = Table(stats_data, colWidths=[doc.width/4.0]*4)
    stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F0F5FF')),
        ('TEXTCOLOR', (0,0), (-1,-1), colors.HexColor('#1A1A1A')),
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#D9E2FF')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#D9E2FF')),
        ('BACKGROUND', (0,1), (-1,-1), colors.white),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#FAFBFF')]),
    ]))
    elements.append(stats_table)

    # Optional comparison section
    if payload.comparison is not None:
        elements.append(Spacer(1, 18))
        elements.append(Paragraph("Class Comparison", ParagraphStyle(
            "CompTitle",
            parent=styles["Heading3"],
            fontName="Helvetica-Bold",
            fontSize=13,
            textColor=colors.HexColor("#1F4AB8"),
        )))

        comp = payload.comparison
        comp_data = [
            ["Class Count", str(comp.class_count), "Avg Score", f"{comp.avg_score:.2f}"],
            ["Avg Accuracy", f"{comp.avg_accuracy:.2f}", "Top Score", f"{comp.top_score:.2f}"],
            ["Rank", str(comp.rank), "Percentile", f"{comp.percentile:.2f}"],
        ]
        comp_table = Table(comp_data, colWidths=[doc.width/4.0]*4)
        comp_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#FFF5E6')),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#FFE0B2')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#FFE0B2')),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        elements.append(comp_table)

    # Footer note
    elements.append(Spacer(1, 20))
    elements.append(Paragraph(
        "This report is auto-generated to support learning. For detailed feedback, connect with your child on recent topics.",
        ParagraphStyle("Footer", parent=styles["BodyText"], fontSize=9, textColor=colors.HexColor('#666666'))
    ))

    doc.build(elements)
    buffer.seek(0)

    # Send email
    filename = f"report_{name}.pdf" if name else "report.pdf"
    email_subject = f"Progress Report for {name}"
    email_body = f"""Dear {parent.name or parent.username},

Please find attached the progress report for your child {name}.

{report_text}

Best regards,
Toeho Learning Platform
"""

    try:
        send_email_with_pdf(
            to_email=parent.email,
            subject=email_subject,
            body=email_body,
            pdf_buffer=buffer,
            filename=filename
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email sending failed: {str(e)}")

    return {"status": "success", "message": f"Report sent to {parent.email}"}

