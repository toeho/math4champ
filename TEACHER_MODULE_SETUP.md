# Teacher Module - Setup & Database Schema

## Database Schema

### Teacher Table
```sql
CREATE TABLE teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255),
    phone_number VARCHAR(20),
    bio TEXT,
    avatar TEXT
);
```

**Fields:**
- `id`: Unique teacher identifier
- `username`: Unique login username
- `password`: Hashed password (plain text in current demo)
- `name`: Full name
- `email`: Email address
- `phone_number`: Contact number
- `bio`: Professional biography/description
- `avatar`: Profile picture (URL or base64)

---

### Video Table
```sql
CREATE TABLE videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    class_level VARCHAR(50) NOT NULL,
    subject VARCHAR(100),
    duration INTEGER,
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    thumbnail TEXT,
    teacher_id INTEGER NOT NULL,
    upload_date VARCHAR(50) NOT NULL,
    view_count INTEGER DEFAULT 0,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id)
);
```

**Fields:**
- `id`: Unique video identifier
- `title`: Video title
- `description`: Detailed description of content
- `class_level`: Target class (e.g., 'class_6', 'class_10')
- `subject`: Subject name (e.g., 'Mathematics')
- `duration`: Video duration in seconds (optional)
- `file_path`: Full path to video file on server
- `file_size`: File size in bytes
- `thumbnail`: Thumbnail image URL or path
- `teacher_id`: Foreign key to teachers table
- `upload_date`: ISO 8601 timestamp
- `view_count`: Number of times video was viewed

---

## File Storage Structure

Videos are stored in the following directory structure:

```
backend/
├── uploads/
│   ├── videos/
│   │   ├── 1_20251223_143022.mp4
│   │   ├── 1_20251223_153045.mp4
│   │   ├── 2_20251223_160130.mp4
│   │   └── ...
│   └── thumbnails/
│       ├── video_1.jpg
│       ├── video_2.jpg
│       └── ...
```

**File Naming Convention:**
- Videos: `{teacher_id}_{timestamp}.{extension}`
- Example: `1_20251223_143022.mp4`

---

## Setup Instructions

### 1. Backend Setup

#### Step 1: Update Requirements
Add the following to `requirements.txt` if not already present:

```
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
python-multipart==0.0.6
python-jose==3.3.0
PyJWT==2.8.1
pydantic==2.5.0
pydantic[email]==2.5.0
```

Install dependencies:
```bash
pip install -r requirements.txt
```

#### Step 2: Create Upload Directories
The application automatically creates the upload directories on startup:
- `backend/uploads/videos/`
- `backend/uploads/thumbnails/`

If manual creation is needed:
```bash
mkdir -p backend/uploads/videos
mkdir -p backend/uploads/thumbnails
```

#### Step 3: Database Initialization
The SQLite database is automatically initialized on startup by the `Base.metadata.create_all()` call in `main.py`.

First run:
```bash
cd backend
uvicorn main:app --reload
```

This will create:
- `app.db` (SQLite database file)
- All required tables (users, teachers, videos, etc.)

#### Step 4: Verify Installation
Check that tables were created:
```bash
sqlite3 app.db ".tables"
```

Expected output should include: `teachers`, `videos`, `users`, `chats`, `parents`, etc.

---

### 2. Frontend Setup

#### Step 1: Install Dependencies
```bash
npm install react-router-dom
```

#### Step 2: API Configuration
Create `src/utils/teacherApi.js`:

```javascript
const API_BASE_URL = 'http://localhost:8000/api';

export const teacherApi = {
  // Authentication
  registerTeacher: async (data) => {
    const response = await fetch(`${API_BASE_URL}/teachers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  loginTeacher: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/teachers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return response.json();
  },

  // Videos
  uploadVideo: async (token, formData) => {
    const response = await fetch(`${API_BASE_URL}/teachers/videos/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return response.json();
  },

  getVideoDetails: async (videoId) => {
    const response = await fetch(`${API_BASE_URL}/teachers/videos/${videoId}`);
    return response.json();
  },

  // Discovery
  getTeachersByClass: async (classLevel) => {
    const response = await fetch(`${API_BASE_URL}/teachers/class/${classLevel}`);
    return response.json();
  },

  getTeacherVideos: async (teacherId, classLevel) => {
    const response = await fetch(
      `${API_BASE_URL}/teachers/by-teacher/${teacherId}/class/${classLevel}`
    );
    return response.json();
  },

  searchVideos: async (params) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/teachers/search?${queryString}`);
    return response.json();
  },
};
```

#### Step 3: Update CORS in Backend
The CORS is already configured in `main.py` to allow all origins:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

For production, restrict to specific domains:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

---

## Running the Application

### Backend
```bash
cd backend
uvicorn main:app --reload
```

Server runs on: `http://localhost:8000`

API documentation available at: `http://localhost:8000/docs`

### Frontend
```bash
npm run dev
```

Frontend runs on: `http://localhost:5173` (or configured port)

---

## Testing the Teacher Module

### 1. Test Teacher Registration
```bash
curl -X POST "http://localhost:8000/api/teachers/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_teacher",
    "password": "secure123",
    "name": "John Doe",
    "email": "john@example.com",
    "bio": "Math specialist"
  }'
```

### 2. Test Teacher Login
```bash
curl -X POST "http://localhost:8000/api/teachers/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_teacher",
    "password": "secure123"
  }'
```

Response will include `access_token` - copy this for authenticated requests.

### 3. Test Video Upload
```bash
curl -X POST "http://localhost:8000/api/teachers/videos/upload" \
  -H "Authorization: Bearer {access_token}" \
  -F "title=Algebra Basics" \
  -F "class_level=class_6" \
  -F "subject=Mathematics" \
  -F "description=Introduction to algebra" \
  -F "file=@video.mp4"
```

### 4. Test Get Teachers by Class
```bash
curl "http://localhost:8000/api/teachers/class/class_6"
```

### 5. Test Get Teacher Videos
```bash
curl "http://localhost:8000/api/teachers/by-teacher/1/class/class_6"
```

### 6. Test Video Details
```bash
curl "http://localhost:8000/api/teachers/videos/1"
```

### 7. Test Search
```bash
curl "http://localhost:8000/api/teachers/search?class_level=class_6&subject=Mathematics"
```

---

## Database Queries

### View All Teachers
```sql
SELECT id, username, name, email FROM teachers;
```

### View All Videos
```sql
SELECT v.id, v.title, v.class_level, t.name as teacher_name, v.view_count
FROM videos v
JOIN teachers t ON v.teacher_id = t.id
ORDER BY v.upload_date DESC;
```

### View Videos by Class
```sql
SELECT v.id, v.title, t.name as teacher, v.view_count
FROM videos v
JOIN teachers t ON v.teacher_id = t.id
WHERE v.class_level = 'class_6'
ORDER BY v.view_count DESC;
```

### View Teacher's Videos
```sql
SELECT id, title, class_level, view_count
FROM videos
WHERE teacher_id = 1
ORDER BY upload_date DESC;
```

### Get Trending Videos
```sql
SELECT v.id, v.title, t.name as teacher, v.view_count
FROM videos v
JOIN teachers t ON v.teacher_id = t.id
ORDER BY v.view_count DESC
LIMIT 10;
```

---

## Environment Variables (Optional)

Create `.env` file in backend directory:

```
DATABASE_URL=sqlite:///./app.db
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
MAX_VIDEO_SIZE=500000000
UPLOAD_DIR=./uploads
```

---

## Performance Considerations

### For Production:

1. **Use a Production Database**
   - Replace SQLite with PostgreSQL or MySQL
   - Update `DATABASE_URL` accordingly

2. **Video Storage**
   - Use cloud storage (AWS S3, Google Cloud Storage, Azure Blob)
   - Implement CDN for video delivery
   - Enable compression for videos

3. **Security**
   - Hash passwords using bcrypt
   - Use HTTPS
   - Implement rate limiting
   - Add JWT token refresh mechanism

4. **Caching**
   - Cache teacher profiles
   - Cache popular videos
   - Use Redis for session management

5. **Indexing**
   - Add indexes on `teacher_id`, `class_level`, `subject` in videos table
   - Add indexes on `username` in teachers table

```sql
CREATE INDEX idx_videos_teacher ON videos(teacher_id);
CREATE INDEX idx_videos_class ON videos(class_level);
CREATE INDEX idx_videos_subject ON videos(subject);
CREATE INDEX idx_teachers_username ON teachers(username);
```

---

## Troubleshooting

### Video Upload Fails
- Check `uploads/videos/` directory permissions
- Verify file size is under 500MB
- Ensure file extension is in allowed list

### Token Expired Errors
- Check that `SECRET_KEY` in `auth.py` is consistent
- Verify token expiration time is reasonable
- Refresh token is needed for long sessions

### File Not Found (404)
- Verify video file exists in `uploads/videos/`
- Check file path in database matches actual file location
- Ensure proper file permissions

### CORS Errors
- Verify CORS middleware is configured in `main.py`
- Check frontend is using correct API URL
- For production, update allowed origins

---

## Next Steps

1. **Implement Real-time Features**
   - WebSocket support for live streaming
   - Real-time comments/feedback

2. **Enhanced Features**
   - Video thumbnails generation
   - Video transcoding for different quality levels
   - Subtitle/caption support
   - Progress tracking for students

3. **Admin Features**
   - Admin dashboard for moderation
   - Video analytics
   - Teacher verification/certification

4. **Mobile App**
   - React Native implementation
   - Offline video download capability

---

## Support & Documentation

For more information:
- FastAPI Docs: `http://localhost:8000/docs` (when running locally)
- SQLAlchemy: https://docs.sqlalchemy.org/
- React Router: https://reactrouter.com/
- Pydantic: https://docs.pydantic.dev/
