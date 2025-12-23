from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from models.schemas import (
    TeacherCreate, TeacherLogin, TeacherOut, TeacherUpdate,
    VideoCreate, VideoOut, VideoDetail, TeacherWithVideos,
    TeacherStudentCreate, TeacherStudentOut, StudentInfo, TeacherWithStudents
)
from models.models import Teacher, Video, TeacherStudent, User
from helper import get_db
from auth import create_access_token, verify_token
from datetime import timedelta, datetime
import os
import shutil
from pathlib import Path
from typing import List
router = APIRouter(prefix="/teachers", tags=["teachers"])

# Directory for storing uploaded files
UPLOADS_BASE_DIR = Path(__file__).resolve().parent.parent / "uploads"
VIDEOS_DIR = UPLOADS_BASE_DIR / "videos"
DOCUMENTS_DIR = UPLOADS_BASE_DIR / "documents"
IMAGES_DIR = UPLOADS_BASE_DIR / "images"
THUMBNAILS_DIR = UPLOADS_BASE_DIR / "thumbnails"

# Create directories if they don't exist
VIDEOS_DIR.mkdir(parents=True, exist_ok=True)
DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)
IMAGES_DIR.mkdir(parents=True, exist_ok=True)
THUMBNAILS_DIR.mkdir(parents=True, exist_ok=True)

# Allowed file extensions by type
ALLOWED_VIDEO_EXTENSIONS = {'.mp4', '.avi', '.mov', '.webm', '.mkv', '.flv', '.wmv', '.m4v'}
ALLOWED_DOCUMENT_EXTENSIONS = {'.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.rtf', '.odt'}
ALLOWED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'}

# File size limits
MAX_VIDEO_SIZE = 500 * 1024 * 1024  # 500 MB
MAX_DOCUMENT_SIZE = 50 * 1024 * 1024  # 50 MB
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB

# File type mapping
FILE_TYPE_CONFIG = {
    'video': {
        'extensions': ALLOWED_VIDEO_EXTENSIONS,
        'max_size': MAX_VIDEO_SIZE,
        'directory': VIDEOS_DIR,
        'url_prefix': '/uploads/videos/'
    },
    'document': {
        'extensions': ALLOWED_DOCUMENT_EXTENSIONS,
        'max_size': MAX_DOCUMENT_SIZE,
        'directory': DOCUMENTS_DIR,
        'url_prefix': '/uploads/documents/'
    },
    'image': {
        'extensions': ALLOWED_IMAGE_EXTENSIONS,
        'max_size': MAX_IMAGE_SIZE,
        'directory': IMAGES_DIR,
        'url_prefix': '/uploads/images/'
    }
}


def detect_file_type(filename: str) -> str:
    """Detect file type based on extension"""
    file_ext = os.path.splitext(filename)[1].lower()
    
    for file_type, config in FILE_TYPE_CONFIG.items():
        if file_ext in config['extensions']:
            return file_type
    
    raise HTTPException(
        status_code=400,
        detail=f"Unsupported file type: {file_ext}. Supported types: videos, documents, images"
    )


def validate_and_save_file(file: UploadFile, file_type: str, teacher_id: int) -> tuple:
    """Validate file and save to appropriate directory"""
    try:
        print(f"DEBUG: Validating file - type: {file_type}, filename: {file.filename}")
        
        config = FILE_TYPE_CONFIG[file_type]
        
        # Validate file extension
        file_ext = os.path.splitext(file.filename)[1].lower()
        print(f"DEBUG: File extension: {file_ext}")
        
        if file_ext not in config['extensions']:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid {file_type} format. Allowed: {', '.join(config['extensions'])}"
            )

        # Read and validate file size
        file_content = file.file.read()
        file_size = len(file_content)
        print(f"DEBUG: File size: {file_size} bytes")
        
        if file_size > config['max_size']:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size for {file_type}: {config['max_size'] / (1024*1024):.0f} MB"
            )

        # Create unique filename
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        filename = f"{teacher_id}_{timestamp}_{file_type}{file_ext}"
        file_path = config['directory'] / filename
        print(f"DEBUG: Saving to: {file_path}")

        # Save file
        try:
            with open(file_path, "wb") as f:
                f.write(file_content)
            print(f"DEBUG: File saved successfully")
        except Exception as e:
            print(f"DEBUG: Error saving file: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to save {file_type}: {str(e)}")

        # Return public URL path and file size
        public_url_path = f"{config['url_prefix']}{filename}"
        print(f"DEBUG: Public URL: {public_url_path}")
        return public_url_path, file_size
        
    except HTTPException as e:
        print(f"DEBUG: HTTPException in validate_and_save_file: {e.detail}")
        raise e
    except Exception as e:
        print(f"DEBUG: Unexpected error in validate_and_save_file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"File validation failed: {str(e)}")


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


# ============ FILE UPLOAD MANAGEMENT ============

@router.post("/upload")
async def upload_file(
    title: str = Form(...),
    class_level: str = Form(...),
    description: str = Form(None),
    subject: str = Form(None),
    file: UploadFile = File(...),
    username: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Upload any supported file type (video, document, image)"""
    try:
        print(f"DEBUG: Upload request - title: {title}, class_level: {class_level}, file: {file.filename}")
        
        # Verify teacher exists
        db_teacher = db.query(Teacher).filter(Teacher.username == username).first()
        if not db_teacher:
            raise HTTPException(status_code=404, detail="Teacher not found")

        print(f"DEBUG: Teacher found: {db_teacher.id}")

        # Detect file type
        file_type = detect_file_type(file.filename)
        print(f"DEBUG: Detected file type: {file_type}")
        
        # Validate and save file
        public_url_path, file_size = validate_and_save_file(file, file_type, db_teacher.id)
        print(f"DEBUG: File saved - path: {public_url_path}, size: {file_size}")

        # Create appropriate record based on file type
        if file_type == 'video':
            # Create video record
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
                "message": f"{file_type.title()} uploaded successfully",
                "file_type": file_type,
                "video_id": new_video.id,
                "title": new_video.title,
                "file_size": new_video.file_size,
                "file_path": public_url_path,
            }
        
        else:
            # For documents and images, return success with file info
            response = {
                "message": f"{file_type.title()} uploaded successfully",
                "file_type": file_type,
                "title": title,
                "file_size": file_size,
                "file_path": public_url_path,
                "class_level": class_level,
                "subject": subject or "",
                "description": description or "",
            }
            print(f"DEBUG: Returning response: {response}")
            return response
            
    except HTTPException as e:
        print(f"DEBUG: HTTPException: {e.detail}")
        raise e
    except Exception as e:
        print(f"DEBUG: Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.post("/upload/multiple")
def upload_multiple_files(
    title: str,
    class_level: str,
    description: str = None,
    subject: str = None,
    files: List[UploadFile] = File(...),
    username: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Upload multiple files at once"""
    # Verify teacher exists
    db_teacher = db.query(Teacher).filter(Teacher.username == username).first()
    if not db_teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 files allowed per upload")

    uploaded_files = []
    
    for i, file in enumerate(files):
        try:
            # Detect file type
            file_type = detect_file_type(file.filename)
            
            # Validate and save file
            public_url_path, file_size = validate_and_save_file(file, file_type, db_teacher.id)
            
            # Create file record
            file_title = f"{title} - Part {i+1}" if len(files) > 1 else title
            
            if file_type == 'video':
                new_video = Video(
                    title=file_title,
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
                
                uploaded_files.append({
                    "file_type": file_type,
                    "video_id": new_video.id,
                    "title": new_video.title,
                    "file_size": new_video.file_size,
                    "file_path": public_url_path,
                })
            else:
                uploaded_files.append({
                    "file_type": file_type,
                    "title": file_title,
                    "file_size": file_size,
                    "file_path": public_url_path,
                })
                
        except HTTPException as e:
            # Continue with other files if one fails
            uploaded_files.append({
                "error": str(e.detail),
                "filename": file.filename,
            })
    
    return {
        "message": f"Processed {len(files)} files",
        "uploaded_files": uploaded_files,
        "success_count": len([f for f in uploaded_files if "error" not in f]),
        "error_count": len([f for f in uploaded_files if "error" in f]),
    }


@router.post("/upload/test")
def test_upload_endpoint(
    title: str = "Test Upload",
    class_level: str = "class_6",
    description: str = None,
    subject: str = None,
):
    """Test endpoint to verify upload parameters work"""
    return {
        "message": "Upload endpoint is working",
        "received_params": {
            "title": title,
            "class_level": class_level,
            "description": description,
            "subject": subject,
        }
    }


@router.get("/upload/info")
def get_upload_info():
    """Get information about supported file types and limits"""
    return {
        "supported_types": {
            "video": {
                "extensions": list(ALLOWED_VIDEO_EXTENSIONS),
                "max_size_mb": MAX_VIDEO_SIZE / (1024 * 1024),
                "description": "Video lectures and educational content"
            },
            "document": {
                "extensions": list(ALLOWED_DOCUMENT_EXTENSIONS),
                "max_size_mb": MAX_DOCUMENT_SIZE / (1024 * 1024),
                "description": "PDFs, presentations, and text documents"
            },
            "image": {
                "extensions": list(ALLOWED_IMAGE_EXTENSIONS),
                "max_size_mb": MAX_IMAGE_SIZE / (1024 * 1024),
                "description": "Images, diagrams, and visual aids"
            }
        },
        "limits": {
            "max_files_per_upload": 10,
            "total_storage_per_teacher": "5GB (not enforced yet)"
        }
    }


@router.get("/files")
def get_teacher_files(
    file_type: str = None,
    username: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Get all files uploaded by the teacher"""
    # Verify teacher exists
    db_teacher = db.query(Teacher).filter(Teacher.username == username).first()
    if not db_teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    files = []
    
    # Get videos (always available)
    videos = db.query(Video).filter(Video.teacher_id == db_teacher.id).all()
    for video in videos:
        if file_type is None or file_type == 'video':
            files.append({
                "id": video.id,
                "type": "video",
                "title": video.title,
                "description": video.description,
                "class_level": video.class_level,
                "subject": video.subject,
                "file_path": video.file_path,
                "file_size": video.file_size,
                "upload_date": video.upload_date,
                "view_count": video.view_count,
            })
    
    # TODO: Add document and image queries when Content model is implemented
    
    # Filter by type if specified
    if file_type:
        files = [f for f in files if f["type"] == file_type]
    
    return {
        "files": files,
        "count": len(files),
        "filter": file_type or "all"
    }


@router.delete("/files/{file_type}/{file_id}")
def delete_file(
    file_type: str,
    file_id: int,
    username: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Delete a file by type and ID"""
    db_teacher = db.query(Teacher).filter(Teacher.username == username).first()
    if not db_teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    if file_type == "video":
        db_file = db.query(Video).filter(Video.id == file_id).first()
        if not db_file:
            raise HTTPException(status_code=404, detail="Video not found")
        
        # Check authorization
        if db_file.teacher_id != db_teacher.id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this video")
        
        # Delete file from storage
        try:
            disk_path = VIDEOS_DIR / Path(db_file.file_path).name
            if os.path.exists(disk_path):
                os.remove(disk_path)
        except Exception as e:
            print(f"Error deleting video file: {e}")
        
        # Delete from database
        db.delete(db_file)
        db.commit()
        
        return {"message": "Video deleted successfully"}
    
    else:
        # TODO: Handle document and image deletion when Content model is implemented
        raise HTTPException(status_code=400, detail=f"File type '{file_type}' not supported for deletion yet")


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
    """Upload a video lecture (legacy endpoint - use /upload instead)"""
    # Verify teacher exists
    db_teacher = db.query(Teacher).filter(Teacher.username == username).first()
    if not db_teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    # Ensure it's a video file
    file_type = detect_file_type(file.filename)
    if file_type != 'video':
        raise HTTPException(status_code=400, detail="This endpoint only accepts video files")
    
    # Validate and save file
    public_url_path, file_size = validate_and_save_file(file, file_type, db_teacher.id)

    # Create video record
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
        "file_path": public_url_path,
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


# ============ STUDENT MANAGEMENT ============

@router.post("/students/add", response_model=TeacherStudentOut)
def add_student_to_teacher(
    student_data: TeacherStudentCreate,
    username: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Add a student to teacher's list"""
    print(f"DEBUG: Adding student {student_data.student_username} to teacher {username}")
    
    # Verify teacher exists
    db_teacher = db.query(Teacher).filter(Teacher.username == username).first()
    if not db_teacher:
        print(f"DEBUG: Teacher {username} not found")
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    print(f"DEBUG: Teacher found: {db_teacher.id}")
    
    # Verify student exists
    db_student = db.query(User).filter(User.username == student_data.student_username).first()
    if not db_student:
        print(f"DEBUG: Student {student_data.student_username} not found")
        raise HTTPException(status_code=404, detail="Student not found")
    
    print(f"DEBUG: Student found: {db_student.username}")
    
    # Check if relationship already exists
    existing = db.query(TeacherStudent).filter(
        TeacherStudent.teacher_id == db_teacher.id,
        TeacherStudent.student_username == student_data.student_username
    ).first()
    
    if existing:
        print(f"DEBUG: Relationship already exists")
        raise HTTPException(status_code=400, detail="Student already enrolled with this teacher")
    
    # Create relationship
    teacher_student = TeacherStudent(
        teacher_id=db_teacher.id,
        student_username=student_data.student_username,
        class_level=student_data.class_level,
        enrolled_date=datetime.utcnow().isoformat(),
    )
    
    print(f"DEBUG: Creating relationship: teacher_id={db_teacher.id}, student_username={student_data.student_username}, class_level={student_data.class_level}")
    
    db.add(teacher_student)
    db.commit()
    db.refresh(teacher_student)
    
    print(f"DEBUG: Relationship created successfully with id: {teacher_student.id}")
    
    return teacher_student


@router.get("/ping")
def ping():
    """Ultra simple ping endpoint"""
    return "pong"


@router.get("/test-simple")
def test_simple_endpoint():
    """Ultra simple test endpoint"""
    return {"message": "hello", "data": [{"test": "value"}]}


@router.get("/students-raw")
def get_teacher_students_raw(
    teacher_username: str,
    db: Session = Depends(get_db),
):
    """Raw endpoint to get students without any validation"""
    try:
        print(f"DEBUG: Raw endpoint - getting students for {teacher_username}")
        
        # Find teacher
        teacher = db.query(Teacher).filter(Teacher.username == teacher_username).first()
        if not teacher:
            return {"error": "Teacher not found", "students": []}
        
        # Get relationships
        relationships = db.query(TeacherStudent).filter(
            TeacherStudent.teacher_id == teacher.id
        ).all()
        
        print(f"DEBUG: Found {len(relationships)} relationships")
        
        students = []
        for rel in relationships:
            student = db.query(User).filter(User.username == rel.student_username).first()
            if student:
                students.append({
                    "username": rel.student_username,
                    "name": student.name or "No Name",
                    "email": student.email or "",
                    "class_level": rel.class_level,
                    "enrolled_date": rel.enrolled_date,
                })
        
        return {"students": students, "count": len(students)}
        
    except Exception as e:
        print(f"DEBUG: Error in raw endpoint: {e}")
        return {"error": str(e), "students": []}


@router.delete("/students/{student_username}")
def remove_student_from_teacher(
    student_username: str,
    username: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Remove a student from teacher's list"""
    db_teacher = db.query(Teacher).filter(Teacher.username == username).first()
    if not db_teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    # Find the relationship
    relationship = db.query(TeacherStudent).filter(
        TeacherStudent.teacher_id == db_teacher.id,
        TeacherStudent.student_username == student_username
    ).first()
    
    if not relationship:
        raise HTTPException(status_code=404, detail="Student not enrolled with this teacher")
    
    db.delete(relationship)
    db.commit()
    
    return {"message": "Student removed successfully"}


@router.get("/my-teachers")
def get_student_teachers(
    student_username: str,
    db: Session = Depends(get_db),
):
    """Get all teachers that have enrolled this student"""
    # Verify student exists
    db_student = db.query(User).filter(User.username == student_username).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Get all teacher-student relationships for this student
    relationships = db.query(TeacherStudent).filter(
        TeacherStudent.student_username == student_username
    ).all()
    
    teachers = []
    for rel in relationships:
        teacher = db.query(Teacher).filter(Teacher.id == rel.teacher_id).first()
        if teacher:
            # Get teacher's videos for the student's class
            videos = db.query(Video).filter(
                Video.teacher_id == teacher.id,
                Video.class_level == rel.class_level
            ).all()
            
            teachers.append({
                "teacher": {
                    "id": teacher.id,
                    "name": teacher.name,
                    "username": teacher.username,
                    "bio": teacher.bio,
                    "email": teacher.email,
                    "avatar": teacher.avatar,
                },
                "enrolled_date": rel.enrolled_date,
                "class_level": rel.class_level,
                "videos": videos,
                "video_count": len(videos),
            })
    
    return teachers


# Debug endpoint to check raw student data
@router.get("/students/debug")
def debug_teacher_students(
    username: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Debug endpoint to get raw student data without schema validation"""
    print(f"DEBUG: Debug endpoint - Getting students for teacher {username}")
    
    db_teacher = db.query(Teacher).filter(Teacher.username == username).first()
    if not db_teacher:
        return {"error": "Teacher not found"}
    
    # Get all teacher-student relationships
    relationships = db.query(TeacherStudent).filter(
        TeacherStudent.teacher_id == db_teacher.id
    ).all()
    
    result = {
        "teacher_id": db_teacher.id,
        "teacher_username": db_teacher.username,
        "relationships_count": len(relationships),
        "relationships": []
    }
    
    for rel in relationships:
        student = db.query(User).filter(User.username == rel.student_username).first()
        rel_data = {
            "relationship_id": rel.id,
            "teacher_id": rel.teacher_id,
            "student_username": rel.student_username,
            "class_level": rel.class_level,
            "enrolled_date": rel.enrolled_date,
            "student_found": student is not None
        }
        
        if student:
            rel_data["student_data"] = {
                "username": student.username,
                "name": student.name,
                "email": student.email,
                "class_level_from_user": student.class_level
            }
        
        result["relationships"].append(rel_data)
    
    return result


@router.get("/students")
def get_teacher_students(
    username: str = Depends(verify_token),
    db: Session = Depends(get_db),
):
    """Get all students enrolled with the teacher"""
    from fastapi.responses import JSONResponse
    
    try:
        print(f"DEBUG: Getting students for teacher {username}")
        
        # First check if teacher exists
        db_teacher = db.query(Teacher).filter(Teacher.username == username).first()
        if not db_teacher:
            print(f"DEBUG: Teacher {username} not found")
            return JSONResponse(content=[], status_code=200)
        
        print(f"DEBUG: Teacher found: {db_teacher.id}")
        
        # Get relationships
        relationships = db.query(TeacherStudent).filter(
            TeacherStudent.teacher_id == db_teacher.id
        ).all()
        
        print(f"DEBUG: Found {len(relationships)} relationships")
        
        students = []
        for rel in relationships:
            print(f"DEBUG: Processing relationship for student: {rel.student_username}")
            student = db.query(User).filter(User.username == rel.student_username).first()
            if student:
                student_data = {
                    "username": rel.student_username,
                    "name": student.name or "No Name",
                    "email": student.email or "",
                    "class_level": rel.class_level,
                    "enrolled_date": rel.enrolled_date,
                }
                students.append(student_data)
                print(f"DEBUG: Added student data: {student_data}")
        
        print(f"DEBUG: Final students array: {students}")
        return JSONResponse(content=students, status_code=200)
        
    except Exception as e:
        print(f"DEBUG: Exception in get_teacher_students: {str(e)}")
        import traceback
        traceback.print_exc()
        return JSONResponse(content=[], status_code=200)
@router.get("/students-hardcoded")
def get_students_hardcoded():
    """Hardcoded response to test if FastAPI works at all"""
    return {
        "students": [
            {
                "username": "test_student",
                "name": "Test Student",
                "email": "test@example.com",
                "class_level": "class_6",
                "enrolled_date": "2025-01-22"
            }
        ],
        "count": 1,
        "message": "This is hardcoded data"
    }


@router.get("/students-db-direct")
def get_students_db_direct(db: Session = Depends(get_db)):
    """Direct database query without parameters"""
    try:
        # Get all relationships
        relationships = db.query(TeacherStudent).all()
        
        result = []
        for rel in relationships:
            teacher = db.query(Teacher).filter(Teacher.id == rel.teacher_id).first()
            student = db.query(User).filter(User.username == rel.student_username).first()
            
            result.append({
                "teacher_name": teacher.name if teacher else "Unknown",
                "teacher_username": teacher.username if teacher else "Unknown",
                "student_username": rel.student_username,
                "student_name": student.name if student else "Unknown",
                "class_level": rel.class_level,
                "enrolled_date": rel.enrolled_date
            })
        
        return {"relationships": result, "count": len(result)}
        
    except Exception as e:
        return {"error": str(e), "relationships": []}


@router.get("/{teacher_id}", response_model=TeacherWithVideos)
def get_teacher_by_id(teacher_id: int, db: Session = Depends(get_db)):
    """Get teacher profile by ID (public endpoint) - MUST BE LAST ROUTE"""
    db_teacher = db.query(Teacher).filter(Teacher.id == teacher_id).first()
    if not db_teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return db_teacher