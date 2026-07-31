import json

from google.genai import types

from .gemini import get_client, MODEL_NAME

MEMORY_PROMPT = """
You are an AI memory extraction system.

Your ONLY task is to identify long-term information about the user that should be remembered across future conversations.

Do NOT answer the user's message.

Do NOT provide advice.

Return ONLY valid JSON.

The schema is:

{
    "debate_formats": [],
    "target_tournaments": [],
    "experience_level": "",
    "strengths": [],
    "weaknesses": [],
    "speaking_style": [],
    "recurring_mistakes": [],
    "learning_goals": [],
    "preferred_feedback_style": "",
    "notes": []
}

Rules:

- Return ONLY JSON.
- No markdown.
- No explanations.
- Never invent information.
- Extract only information useful in future conversations.
- Ignore greetings, temporary questions, and small talk.

Examples

User:
I mainly debate Asian Parliamentary.

Output:
{
    "debate_formats": ["Asian Parliamentary"],
    "target_tournaments": [],
    "experience_level": "",
    "strengths": [],
    "weaknesses": [],
    "speaking_style": [],
    "recurring_mistakes": [],
    "learning_goals": [],
    "preferred_feedback_style": "",
    "notes": []
}

User:
I'm preparing for Oxford IV.

Output:
{
    "debate_formats": [],
    "target_tournaments": ["Oxford IV"],
    "experience_level": "",
    "strengths": [],
    "weaknesses": [],
    "speaking_style": [],
    "recurring_mistakes": [],
    "learning_goals": [],
    "preferred_feedback_style": "",
    "notes": []
}

User:
I panic during POIs.

Output:
{
    "debate_formats": [],
    "target_tournaments": [],
    "experience_level": "",
    "strengths": [],
    "weaknesses": ["POIs"],
    "speaking_style": [],
    "recurring_mistakes": ["Panics under pressure"],
    "learning_goals": [],
    "preferred_feedback_style": "",
    "notes": []
}

User:
I'm usually calm and analytical when speaking.

Output:
{
    "debate_formats": [],
    "target_tournaments": [],
    "experience_level": "",
    "strengths": [],
    "weaknesses": [],
    "speaking_style": [
        "Calm",
        "Analytical"
    ],
    "recurring_mistakes": [],
    "learning_goals": [],
    "preferred_feedback_style": "",
    "notes": []
}

User:
Please be brutally honest.

Output:
{
    "debate_formats": [],
    "target_tournaments": [],
    "experience_level": "",
    "strengths": [],
    "weaknesses": [],
    "speaking_style": [],
    "recurring_mistakes": [],
    "learning_goals": [],
    "preferred_feedback_style": "Direct",
    "notes": []
}

User:
I really want to improve rebuttal and extensions.

Output:
{
    "debate_formats": [],
    "target_tournaments": [],
    "experience_level": "",
    "strengths": [],
    "weaknesses": [],
    "speaking_style": [],
    "recurring_mistakes": [],
    "learning_goals": [
        "Rebuttal",
        "Extensions"
    ],
    "preferred_feedback_style": "",
    "notes": []
}

If the message contains no useful long-term information, return:

{
    "debate_formats": [],
    "target_tournaments": [],
    "experience_level": "",
    "strengths": [],
    "weaknesses": [],
    "speaking_style": [],
    "recurring_mistakes": [],
    "learning_goals": [],
    "preferred_feedback_style": "",
    "notes": []
}
"""


def extract_memory(message: str) -> dict:
    client = get_client()

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=[
            types.Content(
                role="user",
                parts=[
                    types.Part.from_text(
                        text=f"{MEMORY_PROMPT}\n\nUser Message:\n{message}"
                    )
                ],
            )
        ],
    )

    text = (response.text or "").strip()

    # Remove markdown fences if Gemini adds them anyway
    if text.startswith("```"):
        lines = text.splitlines()

        if lines and lines[0].startswith("```"):
            lines = lines[1:]

        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]

        text = "\n".join(lines).strip()

    try:
        data = json.loads(text)

        return {
            "debate_formats": data.get("debate_formats", []),
            "target_tournaments": data.get("target_tournaments", []),
            "experience_level": data.get("experience_level", ""),
            "strengths": data.get("strengths", []),
            "weaknesses": data.get("weaknesses", []),
            "speaking_style": data.get("speaking_style", []),
            "recurring_mistakes": data.get("recurring_mistakes", []),
            "learning_goals": data.get("learning_goals", []),
            "preferred_feedback_style": data.get("preferred_feedback_style", ""),
            "notes": data.get("notes", []),
        }

    except Exception as e:
        print("Memory extraction parse error:", e)
        print("Gemini returned:")
        print(text)

        return {
            "debate_formats": [],
            "target_tournaments": [],
            "experience_level": "",
            "strengths": [],
            "weaknesses": [],
            "speaking_style": [],
            "recurring_mistakes": [],
            "learning_goals": [],
            "preferred_feedback_style": "",
            "notes": [],
        }