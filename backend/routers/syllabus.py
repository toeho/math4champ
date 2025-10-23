from fastapi import APIRouter, HTTPException
from pathlib import Path
import json

router = APIRouter(prefix="/syllabus", tags=["syllabus"])

BASE_DIR = Path(__file__).resolve().parents[1]
TOPICS_PATH = BASE_DIR / "syllabus" / "topics.json"


@router.get("/{class_num}")
def get_topics_by_class(class_num: int):
    """Return topics for a given class number (e.g. 1 -> class_1).

    Returns 404 if the class is not found or the JSON cannot be read.
    """
    key = f"class_{class_num}"

    if not TOPICS_PATH.exists():
        raise HTTPException(status_code=500, detail="Topics data not found on server")

    try:
        with TOPICS_PATH.open("r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read topics: {e}")

    topics = data.get(key)
    if topics is None:
        raise HTTPException(status_code=404, detail=f"No topics found for class {class_num}")

    return {"class": class_num, "topics": topics}
