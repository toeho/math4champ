from fastapi import APIRouter
from models.schemas import ExploreData, Progress, Practice, Strengths, WeeklyGoal

router = APIRouter(prefix="/explore", tags=["explore"])

@router.get("/", response_model=ExploreData)
def get_explore():
    return ExploreData(
        progress=Progress(percentage=75, mastered=15, total=20),
        accuracy=88,
        practice=Practice(problems=120, minutes=300, streak=5),
        strengths=Strengths(strongest="Geometry", focus="Algebra"),
        weeklyGoal=WeeklyGoal(solved=45, goal=60),
        badges=["Beginner", "Math Ninja", "Consistency Star"]
    )
