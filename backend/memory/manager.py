from memory.storage import get_memory


def _merge_list(existing: list[str], new: list[str]) -> list[str]:
    """
    Merge two lists while preserving order and avoiding duplicates.
    """
    for item in new:
        if item not in existing:
            existing.append(item)

    return existing


def update_memory(user_id: str, extracted: dict):
    memory = get_memory(user_id)

    memory.debate_formats = _merge_list(
        memory.debate_formats,
        extracted.get("debate_formats", []),
    )

    memory.target_tournaments = _merge_list(
        memory.target_tournaments,
        extracted.get("target_tournaments", []),
    )

    memory.strengths = _merge_list(
        memory.strengths,
        extracted.get("strengths", []),
    )

    memory.weaknesses = _merge_list(
        memory.weaknesses,
        extracted.get("weaknesses", []),
    )

    memory.speaking_style = _merge_list(
        memory.speaking_style,
        extracted.get("speaking_style", []),
    )

    memory.recurring_mistakes = _merge_list(
        memory.recurring_mistakes,
        extracted.get("recurring_mistakes", []),
    )

    memory.learning_goals = _merge_list(
        memory.learning_goals,
        extracted.get("learning_goals", []),
    )

    memory.notes = _merge_list(
        memory.notes,
        extracted.get("notes", []),
    )

    if extracted.get("experience_level"):
        memory.experience_level = extracted["experience_level"]

    if extracted.get("preferred_feedback_style"):
        memory.preferred_feedback_style = extracted[
            "preferred_feedback_style"
        ]