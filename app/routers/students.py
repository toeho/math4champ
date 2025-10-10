# app/routers/students.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas, database
from ..auth import get_db, get_password_hash, verify_password, create_access_token, get_current_student, require_admin

router = APIRouter(prefix="/students", tags=["students"])

@router.post("/register", response_model=schemas.StudentResponse)
def register(student_in: schemas.StudentCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Student).filter(models.Student.email == student_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = get_password_hash(student_in.password)
    new_student = models.Student(
        name=student_in.name,
        email=student_in.email,
        password_hash=hashed,
        grade=student_in.grade
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    return new_student

from fastapi.security import OAuth2PasswordRequestForm

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2PasswordRequestForm has username and password fields
    student = db.query(models.Student).filter(models.Student.email == form_data.username).first()
    if not student or not verify_password(form_data.password, student.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    token = create_access_token({"sub": str(student.id), "is_admin": student.is_admin})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.StudentResponse)
def read_own_profile(current: models.Student = Depends(get_current_student)):
    return current

@router.get("/{student_id}", response_model=schemas.StudentResponse)
def get_student(student_id: int, db: Session = Depends(get_db), current: models.Student = Depends(get_current_student)):
    # allow students to fetch only their own profile unless admin
    if current.id != student_id and not current.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to view other students")
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.get("/{student_id}/report", response_model=schemas.StudentReport)
def get_report(student_id: int, db: Session = Depends(get_db), admin: models.Student = Depends(require_admin)):
    student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    total = student.total_attempts or 0
    correct = student.correct_attempts or 0
    accuracy = (correct / total * 100) if total > 0 else 0.0
    return schemas.StudentReport(
        id=student.id,
        name=student.name,
        grade=student.grade,
        score=student.score,
        total_attempts=total,
        correct_attempts=correct,
        accuracy=accuracy
    )
