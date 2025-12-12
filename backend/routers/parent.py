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

router = APIRouter(prefix="/parents", tags=["parents"])


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
