# app/routers/questions.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import llm, models, schemas, database
from ..auth import get_db, get_current_student

router = APIRouter(prefix="/questions", tags=["questions"])

@router.post("/{chat_id}", response_model=schemas.MessageResponse)
def ask_question(chat_id: int, msg: schemas.MessageCreate, db: Session = Depends(get_db), current: models.Student = Depends(get_current_student)):
    # ensure chat belongs to current student
    chat = db.query(models.ChatSession).filter(models.ChatSession.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    if chat.student_id != current.id and not current.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized for this chat")

    student_msg = models.Message(chat_id=chat_id, sender="student", content=msg.content)
    db.add(student_msg)
    db.commit()
    db.refresh(student_msg)

    # past_msgs = db.query(models.Message).filter(models.Message.chat_id == chat_id).order_by(models.Message.id.desc()).limit(6).all()
    past_msgs = db.query(models.Message).filter(models.Message.chat_id == chat_id).order_by(models.Message.id.desc()).all()
    context = " ".join([m.content for m in past_msgs[::-1]])

    ai_reply = llm.generate_hint(msg.content, context)
    ai_msg = models.Message(chat_id=chat_id, sender="ai", content=ai_reply)
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)

    return ai_msg

@router.post("/{chat_id}/answer", response_model=schemas.AnswerResult)
def submit_answer(chat_id: int, attempt: schemas.AnswerSubmission, db: Session = Depends(get_db), current: models.Student = Depends(get_current_student)):
    # validate chat ownership
    chat = db.query(models.ChatSession).filter(models.ChatSession.id == chat_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    if chat.student_id != current.id and not current.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized for this chat")

    # store student's attempt as a message
    student_msg = models.Message(chat_id=chat_id, sender="student", content=f"Q: {attempt.question} | A: {attempt.answer}")
    db.add(student_msg)
    db.commit()
    db.refresh(student_msg)

    # build context of last few messages
    past_msgs = db.query(models.Message).filter(models.Message.chat_id == chat_id).order_by(models.Message.id.desc()).limit(6).all()
    context = " ".join([m.content for m in past_msgs[::-1]])

    # Ask LLM to check the answer
    judge = llm.check_answer(attempt.question, attempt.answer, context)
    correct = judge.get("correct", False)
    feedback = judge.get("feedback", "")
    correct_answer = judge.get("correct_answer", None)

    # Update student's hidden scoring and counters
    student = db.query(models.Student).filter(models.Student.id == current.id).first()
    student.total_attempts = (student.total_attempts or 0) + 1
    if correct:
        student.correct_attempts = (student.correct_attempts or 0) + 1
        student.score = (student.score or 0.0) + 1.0
    else:
        # penalize slightly but don't allow negative score
        student.score = max(0.0, (student.score or 0.0) - 0.25)

    db.add(student)
    db.commit()
    db.refresh(student)

    # Save AI feedback message
    ai_msg_text = f"RESULT: {'CORRECT' if correct else 'INCORRECT'}\n{feedback}"
    ai_msg = models.Message(chat_id=chat_id, sender="ai", content=ai_msg_text)
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)

    return schemas.AnswerResult(correct=correct, feedback=feedback, correct_answer=correct_answer)

@router.get("/{chat_id}/similar")
def similar_questions(chat_id: int, db: Session = Depends(get_db), current: models.Student = Depends(get_current_student)):
    last_q = db.query(models.Message).filter(models.Message.chat_id == chat_id, models.Message.sender == "student").order_by(models.Message.id.desc()).first()
    if not last_q:
        return {"similar": []}
    sims = llm.generate_similar_questions(last_q.content)
    return {"similar": sims}
