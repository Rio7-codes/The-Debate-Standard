from .manager import (
    add_goal,
    add_strength,
    add_weakness,
    add_format,
)


def process_message(user_id: str, message: str):
    text = message.lower()

    if "bp" in text:
        add_format(user_id, "British Parliamentary")

    if "ap" in text:
        add_format(user_id, "Asian Parliamentary")

    if "rebuttal" in text:
        add_weakness(user_id, "Rebuttal")

    if "confidence" in text:
        add_weakness(user_id, "Confidence")

    if "nationals" in text:
        add_goal(user_id, "Nationals")