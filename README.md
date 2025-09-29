# 📘 API Documentation

This document provides details of all the NEEDED APIs in the
project.\

------------------------------------------------------------------------

## 🔑 1. User Signup

**Endpoint:**\
`POST /api/signup`

**Description:**\
Creates a new user account. Only **username** and **password** are
mandatory.

**Request Body Example:**

``` json
{
  "username": "alice",
  "password": "123",
  "name": "Alice",
  "level": 2,
  "email": "alice@example.com",
  "avatar": null,
  "classLevel": "Class 4",
  "age": 10,
  "school": "Greenwood School"
}
```

------------------------------------------------------------------------

## 🔐 2. User Login

**Endpoint:**\
`POST /api/login`

**Description:**\
Authenticates the user and returns a JWT token.

**Response Example:**

``` json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5..."
}
```

------------------------------------------------------------------------

## 💬 3. Create New Chat Session

**Endpoint:**\
`POST /api/chat/new`

**Description:**\
Creates a new chat session for the logged-in user.

**Response Example:**

``` json
{
  "sessionId": 101
}
```

------------------------------------------------------------------------

## 💾 4. Get Chat by ID

**Endpoint:**\
`GET /api/chat/{id}`

**Description:**\
Fetches the stored chat history for the given session ID.

**Response Example:**

``` json
{
  "id": 1,
  "title": "Simple algebra",
  "messages": [
    { "sender": "user", "text": "What is 2 + 2?" },
    { "sender": "bot", "text": "It’s 4." }
  ]
}
```

------------------------------------------------------------------------

## 📤 5. Send Message to Chat

**Endpoint:**\
`POST /api/chat`

**Description:**\
Sends a message (text or image) to the active chat session.

**Request Body Example:**

``` json
{
  "sessionId": 101,
  "message": "what i am doing",
  "image": "base64 image",
  "isImage": true
}
```

**Response Example:**

``` json
{
  "sender": "bot",
  "text": "I see you're drawing something!"
}
```

------------------------------------------------------------------------

## 📊 6. Explore Progress

**Endpoint:**\
`GET /api/explore`

**Description:**\
Fetches the user's learning progress, accuracy, practice stats,
strengths, weekly goal, and badges.

**Response Example:**

``` json
{
  "progress": { "percentage": 80, "mastered": 13, "total": 20 },
  "accuracy": 78,
  "practice": { "problems": 120, "minutes": 85, "streak": 4 },
  "strengths": { "strongest": "Addition", "focus": "Fractions" },
  "weeklyGoal": { "goal": 50, "solved": 30 },
  "badges": [
    "Addition Master",
    "Fraction Explorer",
    "Geometry Expert",
    "Multiplication Pro",
    "Division Master",
    "Integation Expert"
  ]
}
```

------------------------------------------------------------------------

## 👤 7. User Profile

**Endpoint:**

-   `GET /api/profile` → Fetch user profile\
-   `PUT /api/profile` → Update user profile

**Request / Response Example:**

``` json
{
  "username": "bob",
  "password": "456",
  "name": "Bob",
  "level": 3,
  "email": "bob@example.com",
  "avatar": null,
  "classLevel": "Class 5",
  "age": 11,
  "school": "Sunrise Academy"
}
```

------------------------------------------------------------------------

## 📑 Summary of Endpoints

  Endpoint         Method   Description
  ---------------- -------- --------------------------------
  /api/signup      POST     Create new user
  /api/login       POST     Authenticate & get JWT token
  /api/chat/new    POST     Create a new chat session
  /api/chat/{id}   GET      Get chat history by session ID
  /api/chat        POST     Send message/image to chat
  /api/explore     GET      Get progress & achievements
  /api/profile     GET      Fetch user profile
  /api/profile     PUT      Update user profile
