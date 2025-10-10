# app/gemini_client.py
import os
import re
from dotenv import load_dotenv
from litellm import completion

load_dotenv()

MODEL_NAME = "gemini/gemini-2.0-flash"  # format for LiteLLM Gemini
API_KEY = os.getenv("GEMINI_API_KEY")


def generate_hint(question: str, last_context: str = "") -> str:
    prompt = f"""
You are a friendly math tutor for students in Class 1-5.
DO NOT give the full final answer outright. Provide 1 short hint or one small step to guide the student.
Student question: {question}
Previous context: {last_context}
Respond concisely.
"""
    response = completion(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
        api_key=API_KEY,
    )
    return response["choices"][0]["message"]["content"].strip()


def generate_similar_questions(question: str) -> list:
    prompt = f"Generate 2 short, simple, similar practice questions (one per line) for: {question}"

    response = completion(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
        api_key=API_KEY,
    )

    text = response["choices"][0]["message"]["content"].strip()
    items = [line.strip() for line in text.splitlines() if line.strip()]
    return items[:3]


def check_answer(question: str, student_answer: str, last_context: str = "") -> dict:
    """
    Ask Gemini (via LiteLLM) to judge whether the student's answer is correct.
    Returns dict: {"correct": bool, "feedback": str, "correct_answer": Optional[str]}
    """
    prompt = f"""
You are an expert grader for Class 1-5 math. Evaluate the student's answer.

Question: {question}
Student's answer: {student_answer}
Previous context: {last_context}

Instructions:
- If the student's answer is correct, reply starting with "RESULT: CORRECT" then a short EXPLANATION.
- If incorrect, reply starting with "RESULT: INCORRECT" then give the correct final answer and a short explanation of mistake (2-3 sentences).
- Output in plain text. Start the first line explicitly with RESULT: CORRECT or RESULT: INCORRECT.
"""

    response = completion(
        model=MODEL_NAME,
        messages=[{"role": "user", "content": prompt}],
        api_key=API_KEY,
    )

    text = response["choices"][0]["message"]["content"].strip()

    # Parse result
    correct = text.upper().startswith("RESULT: CORRECT")
    parts = text.split("\n", 1)
    feedback = parts[1].strip() if len(parts) > 1 else ""
    correct_answer = None
    if not correct:
        m = re.search(r'(-?\d+(\.\d+)?)', text)
        if m:
            correct_answer = m.group(1)

    return {"correct": correct, "feedback": feedback, "correct_answer": correct_answer}
