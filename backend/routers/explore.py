# from fastapi import APIRouter, Depends, Header, HTTPException
# from sqlalchemy.orm import Session
# from typing import Optional
# import os
# import jwt

# from models.schemas import ExploreData, Progress, Practice, Strengths, WeeklyGoal
# from models.models import User
# from helper import get_db
# from auth import SECRET_KEY, ALGORITHM

# router = APIRouter(prefix="/explore", tags=["explore"])


# def _decode_username_from_auth_header(authorization: Optional[str]) -> Optional[str]:
#     """Return username (sub) from a Bearer token, or None if missing/invalid."""
#     if not authorization:
#         return None
#     token = authorization.split(" ", 1)[1] if " " in authorization else authorization
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         return payload.get("sub")
#     except Exception:
#         return None


# EXPLORE_REQUIRE_AUTH = os.getenv("EXPLORE_REQUIRE_AUTH", "false").lower() == "true"
# EXPLORE_FALLBACK_TO_FIRST_USER = os.getenv("EXPLORE_FALLBACK_TO_FIRST_USER", "true").lower() == "true"


# @router.get("/", response_model=ExploreData)
# def get_explore(
#     authorization: Optional[str] = Header(None), db: Session = Depends(get_db)
# ):
#     """Return explore data for the authenticated user (if token provided), otherwise fall back.

#     Behavior controlled by env vars:
#     - EXPLORE_REQUIRE_AUTH=true will return 401 if no valid token provided.
#     - EXPLORE_FALLBACK_TO_FIRST_USER=true will use the first DB user when no valid token.
#     """

#     # Debug: log header presence and decoded username
#     print(f"/explore called - Authorization header present: {bool(authorization)}", flush=True)
#     username = _decode_username_from_auth_header(authorization)
#     print(f"/explore decoded username: {username}", flush=True)

#     user = None

#     # If an Authorization header was provided but we couldn't decode a username, reject it.
#     if authorization and not username:
#         print("/explore: Authorization header present but token invalid or could not be decoded", flush=True)
#         raise HTTPException(status_code=401, detail="Invalid or expired token")

#     if username:
#         user = db.query(User).filter(User.username == username).first()
#         if not user:
#             print(f"/explore: token had username={username} but no matching user found", flush=True)
#             # If a token was provided which decodes to a username that doesn't exist, treat as unauthorized
#             raise HTTPException(status_code=401, detail="User not found for token")

#     # No token provided -> allow fallback to first user in development (if enabled)
#     if not user:
#         if EXPLORE_REQUIRE_AUTH:
#             raise HTTPException(status_code=401, detail="Not authenticated")
#         if EXPLORE_FALLBACK_TO_FIRST_USER:
#             user = db.query(User).first()
#             if user:
#                 print(f"/explore: falling back to first user id={user.id} username={user.username}", flush=True)

#     # ✅ If user does not exist: return fixed default values
#     if not user:
#         return ExploreData(
#             progress=Progress(percentage=0, mastered=0, total=0),
#             accuracy=0,
#             practice=Practice(problems=0, minutes=0, streak=0),
#             strengths=Strengths(strongest="General Math", focus="Algebra"),
#             weeklyGoal=WeeklyGoal(solved=0, goal=60),
#             badges=["Beginner"],
#         )

#     # Compute fields using available data
#     total = int(user.total_attempts or 0)
#     correct = int(user.correct_attempts or 0)

#     # Compute accuracy from attempts. If no attempts yet, accuracy = 0.
#     accuracy = int((correct / total) * 100) if total > 0 else 0

#     # Progress percentage should be derived from accuracy unless you store an explicit percent.
#     # Use a safe clamp to keep value between 0 and 100.
#     progress_pct = min(max(int(accuracy), 0), 100)
#     mastered = correct
#     progress_total = total

#     # Practice: problems -> total attempts, minutes -> estimate (2 min per problem), streak unknown
#     practice_minutes = int(total * 2)
#     streak = 0

#     # Strengths: use class_level as a hint; fallback to placeholders
#     strongest = user.class_level or "General Math"
#     focus = "Algebra"

#     # Weekly goal: simple heuristic
#     solved = int(min(total, 100))
#     goal = 60

#     # Badges: simple generation based on level and score
#     badges = []
#     if (user.level or 0) >= 5:
#         badges.append("Advanced")
#     elif (user.level or 0) >= 2:
#         badges.append("Intermediate")
#     else:
#         badges.append("Beginner")

#     if progress_pct >= 80:
#         badges.append("Math Ninja")

#     if streak >= 7:
#         badges.append("Consistency Star")

#     return ExploreData(
#         progress=Progress(percentage=progress_pct, mastered=mastered, total=progress_total),
#         accuracy=accuracy,
#         practice=Practice(problems=total, minutes=practice_minutes, streak=streak),
#         strengths=Strengths(strongest=strongest, focus=focus),
#         weeklyGoal=WeeklyGoal(solved=solved, goal=goal),
#         badges=badges,
#     )


from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import jwt

from models.schemas import ExploreData, Progress, Practice, Strengths, WeeklyGoal
from models.models import User
from helper import get_db
from auth import SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/explore", tags=["explore"])


# -------------------------------
# ✅ Token decode helper
# -------------------------------
def decode_username_from_token(authorization: Optional[str]) -> Optional[str]:
    """
    Extracts username (sub) from a Bearer token,,  Returns None if token missing/invalid. """
    if not authorization:
        return None

    # Accept both:  "Bearer <token>"  or "<token>"
    parts = authorization.split(" ", 1)
    token = parts[1] if len(parts) == 2 else parts[0]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except Exception:
        return None


@router.get("/", response_model=ExploreData)
def get_explore(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    """    - Token required,- Invalid token → 401,- Valid token but user missing → 401 """

    # Token required → if missing → 401
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required")

    username = decode_username_from_token(authorization)

    # Token invalid → 401
    if not username:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # Find user
    user = db.query(User).filter(User.username == username).first()

    # Token valid but user missing → 401
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    # -----------------------
    # ✅ Build explore data
    # -----------------------
    total = int(user.total_attempts or 0)
    correct = int(user.correct_attempts or 0)

    accuracy = int((correct / total) * 100) if total > 0 else 0
    progress_pct = min(max(accuracy, 0), 100)

    practice_minutes = user.total_time_taken
    strongest = user.class_level or "General Math"

    badges = []
    level = user.level or 0

    if level >= 5:
        badges.append("Advanced")
    elif level >= 2:
        badges.append("Intermediate")
    else:
        badges.append("Beginner")

    if progress_pct >= 80:
        badges.append("Math Ninja")

    return ExploreData(
        progress=Progress(
            percentage=progress_pct,
            mastered=correct,
            total=total
        ),
        accuracy=accuracy,
        practice=Practice(
            problems=total,
            minutes=practice_minutes,
            streak=0
        ),
        strengths=Strengths(
            strongest=strongest,
            focus="Algebra"
        ),
        weeklyGoal=WeeklyGoal(
            solved=min(total, 100),
            goal=60
        ),
        badges=badges,
    )
