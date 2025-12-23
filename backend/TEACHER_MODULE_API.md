# Teacher Module - API Documentation

## Overview
The Teacher Module enables educators to register, authenticate, upload video lectures, and allows students to discover and view these educational videos.

---

## Authentication Endpoints

### 1. Register Teacher
**POST** `/teachers/register`

Register a new teacher account.

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "secure_password",
  "name": "John Doe",
  "email": "john@example.com",
  "phone_number": "+1234567890",
  "bio": "Experienced Math teacher with 10+ years",
  "avatar": "base64_image_or_url"
}
```

**Response (200):**
```json
{
  "id": 1,
  "username": "john_doe",
  "name": "John Doe",
  "email": "john@example.com",
  "phone_number": "+1234567890",
  "bio": "Experienced Math teacher with 10+ years",
  "avatar": "base64_image_or_url"
}
```

---

### 2. Teacher Login
**POST** `/teachers/login`

Authenticate and get access token.

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "secure_password"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "teacher_id": 1,
  "username": "john_doe"
}
```

---

## Teacher Profile Endpoints

### 3. Get Teacher Profile
**GET** `/teachers/me`

Get current logged-in teacher's profile with all videos.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": 1,
  "username": "john_doe",
  "name": "John Doe",
  "email": "john@example.com",
  "phone_number": "+1234567890",
  "bio": "Experienced Math teacher with 10+ years",
  "avatar": "base64_image_or_url",
  "videos": [
    {
      "id": 101,
      "title": "Algebra Basics",
      "description": "Introduction to Algebra",
      "class_level": "class_6",
      "subject": "Mathematics",
      "duration": 1200,
      "file_size": 524288000,
      "thumbnail": "thumbnail_url",
      "upload_date": "2025-12-23T10:30:00",
      "view_count": 150,
      "file_path": "/path/to/video.mp4"
    }
  ]
}
```

---

### 4. Get Teacher by ID
**GET** `/teachers/{teacher_id}`

Get any teacher's public profile with videos.

**Response (200):**
```json
{
  "id": 1,
  "username": "john_doe",
  "name": "John Doe",
  "email": "john@example.com",
  "phone_number": "+1234567890",
  "bio": "Experienced Math teacher with 10+ years",
  "avatar": "base64_image_or_url",
  "videos": [...]
}
```

---

### 5. Update Teacher Profile
**PUT** `/teachers/me`

Update teacher's profile information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "bio": "Updated bio",
  "email": "newemail@example.com",
  "phone_number": "+9876543210",
  "avatar": "new_avatar_url",
  "password": "new_password"
}
```

**Response (200):** Updated teacher object

---

## Video Management Endpoints

### 6. Upload Video
**POST** `/teachers/videos/upload`

Upload a new video lecture.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Form Parameters:**
- `file`: Video file (required) - Allowed formats: .mp4, .avi, .mov, .webm, .mkv, .flv, .wmv (Max: 500MB)
- `title`: Video title (required) - string
- `class_level`: Target class (required) - string (e.g., "class_6", "class_10")
- `description`: Video description (optional) - string
- `subject`: Subject name (optional) - string (e.g., "Mathematics", "English")

**Response (200):**
```json
{
  "message": "Video uploaded successfully",
  "video_id": 101,
  "title": "Algebra Basics",
  "file_size": 524288000
}
```

---

### 7. Get Video Details
**GET** `/teachers/videos/{video_id}`

Get detailed information about a specific video (increments view count).

**Response (200):**
```json
{
  "id": 101,
  "title": "Algebra Basics",
  "description": "Introduction to Algebra",
  "class_level": "class_6",
  "subject": "Mathematics",
  "duration": 1200,
  "file_size": 524288000,
  "thumbnail": "thumbnail_url",
  "teacher_id": 1,
  "upload_date": "2025-12-23T10:30:00",
  "view_count": 151,
  "file_path": "/path/to/video.mp4",
  "teacher": {
    "id": 1,
    "username": "john_doe",
    "name": "John Doe",
    "email": "john@example.com",
    "phone_number": "+1234567890",
    "bio": "Experienced Math teacher",
    "avatar": "avatar_url"
  }
}
```

---

### 8. Update Video Metadata
**PUT** `/teachers/videos/{video_id}`

Update video information (only teacher who uploaded can update).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "Updated Algebra Basics",
  "description": "Updated description",
  "subject": "Mathematics - Advanced"
}
```

**Response (200):**
```json
{
  "message": "Video updated successfully",
  "video": {...}
}
```

---

### 9. Delete Video
**DELETE** `/teachers/videos/{video_id}`

Delete a video (only teacher who uploaded can delete).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "message": "Video deleted successfully"
}
```

---

## Student Discovery Endpoints

### 10. Get Teachers by Class
**GET** `/teachers/class/{class_level}`

Get all teachers who have videos for a specific class.

**Parameters:**
- `class_level`: Class code (e.g., "class_6", "class_10")

**Response (200):**
```json
[
  {
    "id": 1,
    "username": "john_doe",
    "name": "John Doe",
    "bio": "Experienced Math teacher",
    "avatar": "avatar_url",
    "email": "john@example.com",
    "video_count": 5
  },
  {
    "id": 2,
    "username": "jane_smith",
    "name": "Jane Smith",
    "bio": "Science specialist",
    "avatar": "avatar_url",
    "email": "jane@example.com",
    "video_count": 3
  }
]
```

---

### 11. Get Teacher Videos by Class
**GET** `/teachers/by-teacher/{teacher_id}/class/{class_level}`

Get all videos of a specific teacher for a specific class.

**Parameters:**
- `teacher_id`: Teacher ID
- `class_level`: Class code

**Response (200):**
```json
{
  "teacher": {
    "id": 1,
    "name": "John Doe",
    "bio": "Experienced Math teacher",
    "email": "john@example.com",
    "avatar": "avatar_url"
  },
  "videos": [
    {
      "id": 101,
      "title": "Algebra Basics",
      "description": "Introduction to Algebra",
      "class_level": "class_6",
      "subject": "Mathematics",
      "duration": 1200,
      "file_size": 524288000,
      "thumbnail": "thumbnail_url",
      "teacher_id": 1,
      "upload_date": "2025-12-23T10:30:00",
      "view_count": 150,
      "file_path": "/path/to/video.mp4"
    }
  ]
}
```

---

### 12. Stream Video
**GET** `/teachers/videos/stream/{video_id}`

Get video file path for streaming.

**Response (200):**
```json
{
  "video_id": 101,
  "title": "Algebra Basics",
  "file_path": "/path/to/video.mp4",
  "duration": 1200,
  "teacher": {
    "id": 1,
    "name": "John Doe"
  }
}
```

---

### 13. Search Videos
**GET** `/teachers/search`

Search videos by class, subject, teacher, or title.

**Query Parameters:**
- `class_level` (optional): Class code
- `subject` (optional): Subject name
- `teacher_id` (optional): Teacher ID
- `query` (optional): Search term for title/description

**Example:**
```
GET /teachers/search?class_level=class_6&subject=Mathematics
```

**Response (200):**
```json
[
  {
    "teacher": {
      "id": 1,
      "name": "John Doe",
      "bio": "Experienced Math teacher",
      "email": "john@example.com"
    },
    "videos": [
      {
        "id": 101,
        "title": "Algebra Basics",
        "description": "Introduction to Algebra",
        "class_level": "class_6",
        "subject": "Mathematics",
        "duration": 1200,
        "file_size": 524288000,
        "thumbnail": "thumbnail_url",
        "teacher_id": 1,
        "upload_date": "2025-12-23T10:30:00",
        "view_count": 150,
        "file_path": "/path/to/video.mp4"
      }
    ]
  }
]
```

---

### 14. Get Trending Videos
**GET** `/teachers/videos/trending`

Get trending videos sorted by view count.

**Query Parameters:**
- `limit` (optional): Number of videos to return (default: 10)

**Response (200):**
```json
[
  {
    "teacher": {
      "id": 1,
      "name": "John Doe",
      "bio": "Experienced Math teacher"
    },
    "videos": [
      {
        "id": 101,
        "title": "Algebra Basics",
        "description": "Introduction to Algebra",
        "class_level": "class_6",
        "subject": "Mathematics",
        "duration": 1200,
        "file_size": 524288000,
        "thumbnail": "thumbnail_url",
        "teacher_id": 1,
        "upload_date": "2025-12-23T10:30:00",
        "view_count": 500,
        "file_path": "/path/to/video.mp4"
      }
    ]
  }
]
```

---

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request:**
```json
{
  "detail": "Username already exists" / "Invalid video format" / "File too large"
}
```

**401 Unauthorized:**
```json
{
  "detail": "Invalid credentials" / "Invalid token" / "Token expired"
}
```

**403 Forbidden:**
```json
{
  "detail": "Not authorized to delete/update this video"
}
```

**404 Not Found:**
```json
{
  "detail": "Teacher not found" / "Video not found" / "No videos found"
}
```

**500 Internal Server Error:**
```json
{
  "detail": "Failed to save video"
}
```

---

## File Storage

Videos are stored in: `/backend/uploads/videos/`
Thumbnails are stored in: `/backend/uploads/thumbnails/`

Files are organized by teacher ID and upload timestamp for uniqueness.

---

## Usage Flow - Students

1. **Browse Teachers by Class:**
   ```
   GET /teachers/class/class_6
   ```

2. **View Teacher's Videos:**
   ```
   GET /teachers/by-teacher/{teacher_id}/class/class_6
   ```

3. **Select and View Video:**
   ```
   GET /teachers/videos/{video_id}  // Increments view count
   GET /teachers/videos/stream/{video_id}  // Get file path for streaming
   ```

4. **Search Videos:**
   ```
   GET /teachers/search?class_level=class_6&subject=Mathematics
   ```

---

## Usage Flow - Teachers

1. **Register:**
   ```
   POST /teachers/register
   ```

2. **Login:**
   ```
   POST /teachers/login
   ```

3. **Upload Videos:**
   ```
   POST /teachers/videos/upload
   ```

4. **Manage Videos:**
   ```
   PUT /teachers/videos/{video_id}  // Update
   DELETE /teachers/videos/{video_id}  // Delete
   ```

5. **View Profile:**
   ```
   GET /teachers/me
   ```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- File paths are relative to the backend directory
- Video view count is incremented each time details are fetched
- Maximum video file size: 500MB
- Allowed video formats: .mp4, .avi, .mov, .webm, .mkv, .flv, .wmv
