### Authentication
- Register: `POST /students/register`
  - Body: { name, email, grade, password }
- Login: `POST /students/login` (form-data or x-www-form-urlencoded with fields `username` and `password`)
  - Returns: `{ "access_token": "...", "token_type": "bearer" }`
- Use the token in Authorization header for protected endpoints:
  - `Authorization: Bearer <token>`

### Protected endpoints
- `POST /chat/new` — create chat for logged-in student
- `GET /chat/{chat_id}` — view chat (owner or admin)
- `POST /questions/{chat_id}` — ask question (returns a hint from AI)
- `POST /questions/{chat_id}/answer` — submit an answer attempt (updates hidden score)
- `GET /students/{id}/report` — Admin-only: returns hidden score and accuracy

### Scoring logic (internal)
- On each answer submission:
  - `total_attempts` increments by 1
  - If judged correct by LLM:
    - `correct_attempts` increments by 1
    - `score += 1.0`
  - If judged incorrect:
    - `score -= 0.25` but never below 0
- Students DO NOT see `score` in normal UI. Teachers/admins can fetch report.
