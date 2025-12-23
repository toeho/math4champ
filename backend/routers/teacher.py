from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from models.schemas import (
    TeacherCreate, TeacherLogin, TeacherOut, TeacherUpdate,
    VideoCreate, VideoOut, VideoDetail, TeacherWithVideos
)
from models.models import Teacher, Video
from helper import get_db
from auth import create_access_token, verify_token
from datetime import timedelta, datetime
import os
import shutil
from pathlib import Path

router = APIRouter(prefix="/teachers", tags=["teachers"])

# Directory for storing uploaded videos
VIDEOS_DIR = Path(__file__).resolve().parent.parent / "uploads" / "videos"
THUMBNAILS_DIR = Path(__file__).resolve().parent.parent / "uploads" / "thumbnails"

# Create directories if they don't exist
VIDEOS_DIR.mkdir(parents=True, exist_ok=True)
THUMBNAILS_DIR.mkdir(parents=True, exist_ok=True)

# Allowed video extensions
ALLOWED_VIDEO_EXTENSIONS = {'.mp4', '.avi', '.mov', '.webm', '.mkv', '.flv', '.wmv'}
MAX_VIDEO_SIZE = 500 * 1024 * 1024  # 500 MB


# ============ TEACHER AUTHENTICATION ============

@router.post("/register", response_model=TeacherOut)
def register_teacher(teacher: TeacherCreate, db: Session = Depends(get_db)):
    """Register a new teacher"""
    existing_teacher = db.query(Teacher).filter(Teacher.username == teacher.username).first()
    if existing_teacher:
        raise HTTPException(status_code=400, detail="Username already exists")

    new_teacher = Teacher(
        username=teacher.username,
        password=teacher.password,  # plain text for demo (use hashing in production)
        name=teacher.name or teacher.username,
        email=teacher.email,
        phone_number=teacher.phone_number,
        bio=teacher.bio,
        avatar=teacher.avatar,
    )

    db.add(new_teacher)
    db.commit()
    db.refresh(new_teacher)
    return new_teacher


@router.post("/login")
def teacher_login(data: TeacherLogin, db: Session = Depends(get_db)):
    """Login teacher and return access token"""
    db_teacher = db.query(Teacher).filter(Teacher.username == data.username).first()
    if not db_teacher or db_teacher.password != data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(
        data={"sub": db_teacher.username},
        expires_delta=timedelta(hours=24),
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "teacher_id": db_teacher.id,
        "username": db_teacher.username,
    }


# ============ TEACHER PROFILE ============

@router.get("/me", response_model=TeacherWithVideos)
def get_teacher_profile(username: str = Depends(verify_token), db: Session = Depends(get_db)):
    """Get current logged-in teacher's profile with videos"""
    db_teacher = db.query(Teacher).filter(Teacher.username == username).first()
    if not db_teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return db_teacher


@router.get("/{teacher_id}", response_model=TeacherWithVideos)
def get_teacher_by_id(teacher_id: int, db: Session = Depends(get_db)):
    """Get teacher profile by ID (public endpoint)"""
    db_teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not db_teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return db_teacher


@router.put("/me", response_model=TeacherOut)
def update_teacher_profile(
    updates: TeacherUpdate,
    username: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Update teacher profile"""
    db_teacher = db.query(Teacher).filter(Teacher.username == username).first()
    if not db_teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    update_data = updates.dict(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(db_teacher, key, value)

    db.commit()
    db.refresh(db_teacher)
    return db_teacher


# ============ VIDEO MANAGEMENT ============

@router.post("/videos/upload")
def upload_video(
    title: str,
    class_level: str,
    description: str = None,
    subject: str = None,
    file: UploadFile = File(...),
    username: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Upload a video lecture"""
    # Verify teacher exists
    db_teacher = db.query(Teacher).filter(Teacher.username == username).first()
    if not db_teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    # Validate file extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid video format. Allowed: {', '.join(ALLOWED_VIDEO_EXTENSIONS)}"
        )

    # Read and validate file size
    file_content = file.file.read()
    file_size = len(file_content)
    
    if file_size > MAX_VIDEO_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {MAX_VIDEO_SIZE / (1024*1024):.0f} MB"
        )

    # Create unique filename
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"{db_teacher.id}_{timestamp}{file_ext}"
    file_path = VIDEOS_DIR / filename

    # Save file
    try:
        with open(file_path, "wb") as f:
            f.write(file_content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save video: {str(e)}")

    # Create video record
    # Store URL path so frontend can request via FastAPI static mount
    public_url_path = f"/uploads/videos/{filename}"

    new_video = Video(
        title=title,
        description=description,
        class_level=class_level,
        subject=subject,
        file_path=public_url_path,
        file_size=file_size,
        teacher_id=db_teacher.id,
        upload_date=datetime.utcnow().isoformat(),
    )

    db.add(new_video)
    db.commit()
    db.refresh(new_video)

    return {
        "message": "Video uploaded successfully",
        "video_id": new_video.id,
        "title": new_video.title,
        "file_size": new_video.file_size,
    }


@router.get("/videos/{video_id}", response_model=VideoDetail)
def get_video_details(video_id: int, db: Session = Depends(get_db)):
    """Get video details and increment view count"""
    db_video = db.query(Video).filter(Video.id == video_id).first()
    if not db_video:
        raise HTTPException(status_code=404, detail="Video not found")

    # Increment view count
    db_video.view_count += 1
    db.commit()
    db.refresh(db_video)

    return db_video


@router.delete("/videos/{video_id}")
def delete_video(
    video_id: int,
    username: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Delete a video (only teacher who uploaded can delete)"""
    db_teacher = db.query(Teacher).filter(Teacher.username == username).first()
    if not db_teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    db_video = db.query(Video).filter(Video.id == video_id).first()
    if not db_video:
        raise HTTPException(status_code=404, detail="Video not found")

    # Check authorization
    if db_video.teacher_id != db_teacher.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this video")

    # Delete file from storage
    try:
        # db_video.file_path is a public URL (e.g., /uploads/videos/1_...mp4)
        disk_path = VIDEOS_DIR / Path(db_video.file_path).name
        if os.path.exists(disk_path):
            os.remove(disk_path)
    except Exception as e:
        # Log error but continue with DB deletion
        print(f"Error deleting video file: {e}")

    # Delete from database
    db.delete(db_video)
    db.commit()

    return {"message": "Video deleted successfully"}


@router.put("/videos/{video_id}")
def update_video(
    video_id: int,
    title: str = None,
    description: str = None,
    subject: str = None,
    username: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Update video metadata (only teacher who uploaded can update)"""
    db_teacher = db.query(Teacher).filter(Teacher.username == username).first()
    if not db_teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    db_video = db.query(Video).filter(Video.id == video_id).first()
    if not db_video:
        raise HTTPException(status_code=404, detail="Video not found")

    # Check authorization
    if db_video.teacher_id != db_teacher.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this video")

    if title:
        db_video.title = title
    if description:
        db_video.description = description
    if subject:
        db_video.subject = subject

    db.commit()
    db.refresh(db_video)

    return {"message": "Video updated successfully", "video": db_video}


# ============ STUDENT FEATURES ============

@router.get("/class/{class_level}")
def get_teachers_by_class(class_level: str, db: Session = Depends(get_db)):
    """Get all teachers who have videos for a specific class"""
    # Get all videos for the class
    videos = db.query(Video).filter(Video.class_level == class_level).all()
    
    if not videos:
        raise HTTPException(status_code=404, detail="No teachers found for this class")

    # Get unique teachers
    teacher_ids = list(set([v.teacher_id for v in videos]))
    teachers = db.query(Teacher).filter(Teacher.id.in_(teacher_ids)).all()

    # Create response with teacher info and video count
    response = []
    for teacher in teachers:
        teacher_videos = [v for v in videos if v.teacher_id == teacher.id]
        response.append({
            "id": teacher.id,
            "username": teacher.username,
            "name": teacher.name,
            "bio": teacher.bio,
            "avatar": teacher.avatar,
            "email": teacher.email,
            "video_count": len(teacher_videos),
        })

    return response


@router.get("/by-teacher/{teacher_id}/class/{class_level}")
def get_teacher_videos_by_class(
    teacher_id: int,
    class_level: str,
    db: Session = Depends(get_db),
):
    """Get all videos of a specific teacher for a specific class"""
    db_teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not db_teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    videos = db.query(Video).filter(
        Video.teacher_id == teacher_id,
        Video.class_level == class_level
    ).all()

    return {
        "teacher": {
            "id": db_teacher.id,
            "name": db_teacher.name,
            "bio": db_teacher.bio,
            "email": db_teacher.email,
            "avatar": db_teacher.avatar,
        },
        "videos": videos,
    }


@router.get("/videos/stream/{video_id}")
def stream_video(video_id: int, db: Session = Depends(get_db)):
    """Get video file path for streaming (return URL or stream the file)"""
    db_video = db.query(Video).filter(Video.id == video_id).first()
    if not db_video:
        raise HTTPException(status_code=404, detail="Video not found")

    # Check if file exists on disk (file_path is public URL)
    disk_path = VIDEOS_DIR / Path(db_video.file_path).name
    if not os.path.exists(disk_path):
        raise HTTPException(status_code=404, detail="Video file not found on server")

    # Return video path/URL or stream directly
    # For now, return file path - frontend can handle streaming
    return {
        "video_id": db_video.id,
        "title": db_video.title,
        "file_path": db_video.file_path,
        "duration": db_video.duration,
        "teacher": {
            "id": db_video.teacher.id,
            "name": db_video.teacher.name,
        },
    }


@router.get("/search")
def search_videos(
    class_level: str = None,
    subject: str = None,
    teacher_id: int = None,
    query: str = None,
    db: Session = Depends(get_db),
):
    """Search videos by class, subject, teacher, or title"""
    videos_query = db.query(Video)

    if class_level:
        videos_query = videos_query.filter(Video.class_level == class_level)
    
    if subject:
        videos_query = videos_query.filter(Video.subject == subject)
    
    if teacher_id:
        videos_query = videos_query.filter(Video.teacher_id == teacher_id)
    
    if query:
        videos_query = videos_query.filter(
            (Video.title.ilike(f"%{query}%")) |
            (Video.description.ilike(f"%{query}%"))
        )

    videos = videos_query.all()

    if not videos:
        raise HTTPException(status_code=404, detail="No videos found matching the criteria")

    # Group by teacher
    result = {}
    for video in videos:
        teacher_id = video.teacher_id
        if teacher_id not in result:
            result[teacher_id] = {
                "teacher": {
                    "id": video.teacher.id,
                    "name": video.teacher.name,
                    "bio": video.teacher.bio,
                    "email": video.teacher.email,
                },
                "videos": [],
            }
        result[teacher_id]["videos"].append(video)

    return list(result.values())


@router.get("/videos/trending")
def get_trending_videos(limit: int = 10, db: Session = Depends(get_db)):
    """Get trending videos (by view count)"""
    videos = db.query(Video).order_by(Video.view_count.desc()).limit(limit).all()

    if not videos:
        raise HTTPException(status_code=404, detail="No videos found")

    # Group by teacher
    result = {}
    for video in videos:
        teacher_id = video.teacher_id
        if teacher_id not in result:
            result[teacher_id] = {
                "teacher": {
                    "id": video.teacher.id,
                    "name": video.teacher.name,
                    "bio": video.teacher.bio,
                },
                "videos": [],
            }
        result[teacher_id]["videos"].append(video)

    return list(result.values())
