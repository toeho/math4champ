from fastapi import APIRouter, Depends, HTTPException
from pathlib import Path
import json

from helper import get_user_class_number

router = APIRouter(prefix="/topics", tags=["topics"])

BASE_DIR = Path(__file__).resolve().parents[1]
TOPICS_PATH = BASE_DIR / "syllabus" / "topics.json"


@router.get("/", response_model=list)
def get_topics_for_current_user(class_num: int = Depends(get_user_class_number)):
    """Return the list of topic category names for the current user's class."""
    key = f"class_{class_num}"

    if not TOPICS_PATH.exists():
        raise HTTPException(status_code=500, detail="Topics data file path not found on server")

    try:
        with TOPICS_PATH.open("r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read topics: {e}")

    topics_for_class = data.get(key)
    if topics_for_class is None:
        raise HTTPException(status_code=404, detail=f"No topics found for class {class_num}")

    # Return only the topic category names (keys) as a list of strings
    return list(topics_for_class.keys())


