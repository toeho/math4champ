import os
import json, re
from dotenv import load_dotenv
from litellm import completion


load_dotenv()

MODEL_NAME = "gemini/gemini-2.5-flash"  # format for LiteLLM Gemini
API_KEY = os.getenv("GEMINI_API_KEY")




def load_prompt_for_class(class_number: int) -> dict:
    # Map class_number to a prompt file. Default to class_5 style prompt if not found.
    mapping = {
        1: "prompts/one.json",
        2: "prompts/two.json",
        3: "prompts/three.json",
        4: "prompts/four.json",
        5: "prompts/five.json",
    }
    # We will load the base prompt from `prompts/two.json` and then
    # load the syllabus for the requested class and add it into the
    # system prompt content before returning.
    # Resolve paths relative to this file so imports work from any CWD
    base_dir = os.path.dirname(__file__)
    base_prompt_path = os.path.join(base_dir, "prompts", "two.json")

    # Fallback behavior if base prompt missing: try class-specific prompt
    if not os.path.exists(base_prompt_path):
        file_path = mapping.get(class_number, "prompts/five.json")
        if not os.path.exists(file_path):
            return {"role": "system", "content": {"type": "text", "text": "You are a helpful math tutor."}}
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)

    # Load base prompt (two.json)
    try:
        with open(base_prompt_path, "r", encoding="utf-8") as f:
            prompt = json.load(f)
    except Exception:
        return {"role": "system", "content": {"type": "text", "text": "You are a helpful math tutor."}}

    # Normalize class number
    try:
        cls_num = int(class_number)
    except Exception:
        cls_num = 5

    # Load appropriate syllabus file and extract class entry
    syllabus_text = ""
    try:
        if 1 <= cls_num <= 5:
            syllabus_file = os.path.join(base_dir, "syllabus", "topics.json")
            syllabus_key = f"class_{cls_num}"
        else:
            syllabus_file = os.path.join(base_dir, "syllabus", "class6-12.json")
            syllabus_key = f"Class_{cls_num}"

        if os.path.exists(syllabus_file):
            with open(syllabus_file, "r", encoding="utf-8") as sf:
                syl = json.load(sf)
            class_syl = syl.get(syllabus_key)
            # Some syllabus files (e.g. class6-12.json) wrap classes under
            # a top-level key like "Mathematics_Syllabus" — handle that.
            if class_syl is None and type(syl) is dict and "Mathematics_Syllabus" in syl:
                wrapped = syl.get("Mathematics_Syllabus")
                if type(wrapped) is dict:
                    class_syl = wrapped.get(syllabus_key)
            if class_syl:
                parts = []
                # limits to keep prompt size reasonable
                MAX_ITEMS_PER_SECTION = 6
                MAX_TOTAL_CHARS = 1000
                # class_syl is usually a mapping of section -> list
                for section, items in class_syl.items():
                    # Prefer explicit type checks without using isinstance
                    if type(items) is list:
                        # items may be list of dicts (topics.json) or list of strings
                        if items and type(items[0]) is dict:
                            # extract chapter names, limit length
                            names = [str(x.get("chapter", "")) for x in items[:MAX_ITEMS_PER_SECTION]]
                            chapter_list = ", ".join(names)
                            if len(items) > MAX_ITEMS_PER_SECTION:
                                chapter_list += ", ..."
                            parts.append(f"{section}: {chapter_list}")
                        else:
                            vals = [str(x) for x in items[:MAX_ITEMS_PER_SECTION]]
                            svals = ", ".join(vals)
                            if len(items) > MAX_ITEMS_PER_SECTION:
                                svals += ", ..."
                            parts.append(f"{section}: {svals}")
                    elif type(items) is dict:
                        vals = [str(v) for v in items.values()]
                        parts.append(f"{section}: {', '.join(vals[:MAX_ITEMS_PER_SECTION])}")
                    else:
                        parts.append(f"{section}: {str(items)}")

                if parts:
                    syllabus_text = f"Syllabus for class_{cls_num}:\n" + "\n".join(parts)
                    # Ensure syllabus_text stays within a reasonable size
                    if len(syllabus_text) > MAX_TOTAL_CHARS:
                        syllabus_text = syllabus_text[:MAX_TOTAL_CHARS].rsplit('\n', 1)[0] + "\n..."
    except Exception:
        syllabus_text = ""

    # If the prompt 'content' is a string, prepend the syllabus text.
    if syllabus_text:
        if type(prompt.get("content")) is str:
            prompt["content"] = syllabus_text + "\n\n" + prompt["content"]
        else:
            # If content is structured, add a text field or convert to a string
            try:
                # try to keep structure but include a leading text field
                if type(prompt["content"]) is dict:
                    # embed syllabus under a new key if possible
                    prompt["content"] = {**prompt["content"], "syllabus": syllabus_text}
                else:
                    prompt["content"] = {"type": "text", "text": syllabus_text + "\n\n" + json.dumps(prompt["content"])}
            except Exception:
                prompt["content"] = {"type": "text", "text": syllabus_text}

    return prompt



def generate_hint(question: str,  last_context: str = "", image_b64 :str | None = None, user_class: int | str | None = None, parent_feedback: str | None = None, **kwargs) -> str:
    """Generate a concise hint using a class-specific prompt.
    Args:
        question: The student's question text.
        last_context: Recent chat context to include.
        image_b64: Optional base64 PNG image string.
        user_class: Class level (int like 5 or string like 'class_5' or '5').

    Returns:
        The LLM's reply string.    """

    # Normalize/parse user_class into an integer class number used by prompt loader
    def _class_to_number(c):
        if c is None:
            return 5
        try:
            if isinstance(c, int):
                return int(c)
            s = str(c).strip()
            if s.startswith("class_"):
                s = s.split("_", 1)[1]
            return int(s)
        except Exception:
            return 5

    class_number = _class_to_number(user_class)
    system_prompt = load_prompt_for_class(class_number)

    # Build message content and include the student class in the prompt
    # Include parent feedback in the prompt if present to give the LLM extra context
    feedback_section = f"\nParent feedback: {parent_feedback}" if parent_feedback else ""

    content = [
        {
            "type": "text",
            "text": f"Student class: class_{class_number}\nStudent question: {question}\nPrevious context: {last_context}{feedback_section}\nRespond concisely."
        }
    ]

    # If an image is provided, attach it
    if image_b64:
        # Wrap in data URL format required by Gemini
        image_data_url = f"data:image/png;base64,{image_b64}"
        content.append({"type": "image_url", "image_url": image_data_url})

    # Build final messages
    messages = [
        system_prompt,
        {"role": "user", "content": content}
    ]
    response = completion(
        model=MODEL_NAME,
        messages=messages,
        api_key=API_KEY,
    )

    return response["choices"][0]["message"]["content"].strip()



def get_chat_title(text: str) -> str:
    
    try:
        messages = [
            {"role": "system", "content": "Generate an appropriate title for this message to be saved as chat title in the database, it will have more messages from user and llm, give most appropriate title in very short 3 or 4 words"},
            {"role": "user", "content": text}
        ]
        response = completion(
            model=MODEL_NAME,
            messages=messages,
            api_key=API_KEY,
        )
        return response["choices"][0]["message"]["content"].strip()
    except Exception as e:
        return f"Error: {str(e)}"
    
def check_answer(conversation=None, question=None, answer=None, context=None, class_topics=None):

    """
    Evaluates if the student's last message is a final answer and whether it's correct.
    Uses LiteLLM to call Gemini (or any configured model).
    """

    # --- Build conversation if not provided ---
    if conversation is None:
        conversation = []
        if question:
            conversation.append({"role": "assistant", "content": question})
        if answer:
            conversation.append({"role": "user", "content": answer})
        if context:
            conversation.append({"role": "system", "content": f"Context: {context}"})

   
    system_prompt = """
You are NOT a tutor or assistant. You are a grading engine that outputs only JSON.
Do NOT write explanations, greetings, or questions.
If you cannot determine the answer, still return valid JSON with false values.
Your response MUST be valid JSON — no markdown, text, or code fences.

Output format (must match exactly):
{
  "final": true or false,
  "correct": true or false,
  "feedback": "short reasoning (1–2 lines)",
  "correct_answer": "the correct answer"
}
"""

    try:
        response = completion(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                *conversation
            ],
            api_key=API_KEY,
            temperature=0.0,
            max_tokens=300,
        )

        text = response["choices"][0]["message"]["content"].strip()

        # Debug: log raw output so we can inspect failure cases
        print("🛈 check_answer raw output:", repr(text[:2000]))

        # Remove fenced code blocks (```json ... ``` or ``` ... ```)
        m_code = re.search(r"```(?:json)?\s*(.*?)\s*```", text, re.S | re.I)
        if m_code:
            text = m_code.group(1).strip()

        # If still not obviously JSON, try to extract the first {...} block
        match = re.search(r"\{.*\}", text, re.S)
        if match:
            text = match.group(0)
        else:
            # Fallback: try substring from first '{' to last '}' if present
            first = text.find('{')
            last = text.rfind('}')
            if first != -1 and last != -1 and last > first:
                text = text[first:last+1]

        text = text.strip()

        # Try direct JSON parse first
        try:
            result = json.loads(text)
            return result
        except Exception as e:
            # Attempt common sanitizations and retry
            san = text
            # Replace single quotes with double quotes when appropriate
            if san.count("'") > san.count('"'):
                san = san.replace("'", '"')
            # Replace Python booleans/None to JSON equivalents
            san = re.sub(r"\bTrue\b", "true", san)
            san = re.sub(r"\bFalse\b", "false", san)
            san = re.sub(r"\bNone\b", "null", san)
            # Remove trailing commas before } or ]
            san = re.sub(r",\s*([}\]])", r"\1", san)

            try:
                result = json.loads(san)
                return result
            except Exception as e2:
                print("⚠️ check_answer parse retry failed:", e2)
                print("🛈 final sanitized attempt contents:", repr(san[:2000]))

        # If parsing ultimately failed, return a safe structured response with raw feedback
        return {"final": False, "correct": False, "feedback": "Error or invalid JSON", "raw": text}

    except Exception as e:
        print("⚠️ check_answer error:", e)
        return {"final": False, "correct": False, "feedback": "Error or invalid JSON"}


def generate_parent_report(child: dict, comparison: dict | None = None) -> str:
    """Generate a short descriptive, encouraging report for a parent.

    Args:
        child: Dict of child's stats with keys like name, username, class_level/level,
               score, accuracy, total_attempts, correct_attempts, current_streak, max_streak.
        comparison: Optional dict containing class-wide metrics (avg_score, rank, percentile, etc.).

    Returns:
        The report string.
    """
    # Prepare child summary lines safely
    name = child.get("name") or child.get("username") or "Child"
    cls = child.get("class_level") or child.get("level")
    try:
        cls_str = f"Class {int(cls)}" if isinstance(cls, (int, float, str)) and str(cls).isdigit() else str(cls)
    except Exception:
        cls_str = str(cls)

    def fnum(x, nd=2):
        try:
            return f"{float(x):.{nd}f}"
        except Exception:
            return str(x)

    child_summary = (
        f"Name: {name}\n"
        f"Class: {cls_str}\n"
        f"Score: {fnum(child.get('score', 0.0))}\n"
        f"Accuracy: {fnum(child.get('accuracy', 0.0))}\n"
        f"Attempts: {int(child.get('total_attempts', 0))} (correct: {int(child.get('correct_attempts', 0))})\n"
        f"Streak: current {int(child.get('current_streak', 0))}, max {int(child.get('max_streak', 0))}"
    )

    comparison_summary = ""
    if comparison:
        comparison_summary = (
            f"\nClass count: {int(comparison.get('class_count', 0))}\n"
            f"Avg score: {fnum(comparison.get('avg_score', 0.0))}\n"
            f"Avg accuracy: {fnum(comparison.get('avg_accuracy', 0.0))}\n"
            f"Top score: {fnum(comparison.get('top_score', 0.0))}\n"
            f"Rank: {int(comparison.get('rank', 0))}\n"
            f"Percentile: {fnum(comparison.get('percentile', 0.0))}"
        )

    system_prompt = {
        "role": "system",
        "content": "You are an educational progress summarizer. Write a short, clear, encouraging report (70–120 words) for a parent about their child's math practice, using provided stats. Highlight strengths, practical next steps, and keep tone supportive. Avoid technical jargon."
    }

    user_content = (
        "Child Stats:\n" + child_summary + ("\n\nComparison:\n" + comparison_summary if comparison_summary else "")
    )

    messages = [
        system_prompt,
        {"role": "user", "content": user_content},
    ]

    resp = completion(model=MODEL_NAME, messages=messages, api_key=API_KEY)
    return resp["choices"][0]["message"]["content"].strip()