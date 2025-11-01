from fastapi import APIRouter, Depends, Header
from typing import Optional
import jwt

from models.schemas import ExploreData, Progress, Practice, Strengths, WeeklyGoal
from models.models import User
from helper import get_db
from sqlalchemy.orm import Session
from auth import SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/explore", tags=["explore"])


def _decode_username_from_auth_header(authorization: Optional[str]) -> Optional[str]:
    """Try to extract username (sub) from a Bearer token in Authorization header.
    Returns None if header missing or invalid.
    """
    if not authorization:
        return None
    
    token = authorization.split(" ", 1)[1] if " " in authorization else authorization
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except Exception:
        return None


@router.get("/", response_model=ExploreData)
def get_explore(
    authorization: Optional[str] = Header(None), db: Session = Depends(get_db)
):
    """Return explore data for the authenticated user (if token provided),
    otherwise fall back to the first user in the database or sensible defaults.
    """
    username = _decode_username_from_auth_header(authorization)

    user = None
    if username:
        user = db.query(User).filter(User.username == username).first()

    # if not user:
    #     # Fallback: use the first user in DB if exists
    #     user = db.query(User).first()

    # If still no user, return safe default sample data
    if not user:
        return ExploreData(
            progress=Progress(percentage=10, mastered=0, total=0),
            accuracy=0,
            practice=Practice(problems=0, minutes=0, streak=0),
            strengths=Strengths(strongest="None", focus="None"),
            weeklyGoal=WeeklyGoal(solved=0, goal=10),
            badges=[],
        )

    # Compute fields using available data
    total = int(user.total_attempts or 0)
    correct = int(user.correct_attempts or 0)

    accuracy = int((correct / total) * 100) if total > 0 else int(user.score or 0)

    # Progress -- use stored score (0-100) if present else use accuracy
    progress_pct = int(user.score) if (user.score and user.score > 0) else accuracy
    mastered = correct
    progress_total = total

    # Practice: problems -> total attempts, minutes -> estimate (2 min per problem), streak unknown
    practice_minutes = int(total * 2)
    streak = 0

    # Strengths: use class_level as a hint; fallback to placeholders
    strongest = user.class_level or "General Math"
    focus = "Algebra"

    # Weekly goal: simple heuristic
    solved = int(min(total, 100))
    goal = 60

    # Badges: simple generation based on level and score
    badges = []
    if (user.level or 0) >= 5:
        badges.append("Advanced")
    elif (user.level or 0) >= 2:
        badges.append("Intermediate")
    else:
        badges.append("Beginner")

    if progress_pct >= 80:
        badges.append("Math Ninja")

    if streak >= 7:
        badges.append("Consistency Star")

    return ExploreData(
        progress=Progress(percentage=progress_pct, mastered=mastered, total=progress_total),
        accuracy=accuracy,
        practice=Practice(problems=total, minutes=practice_minutes, streak=streak),
        strengths=Strengths(strongest=strongest, focus=focus),
        weeklyGoal=WeeklyGoal(solved=solved, goal=goal),
        badges=badges,
    )
