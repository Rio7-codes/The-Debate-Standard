from memory.models import UserMemory


def _format_list(title: str, items: list[str]) -> str:
    if not items:
        return ""

    return f"{title}: {', '.join(items)}"


def build_memory_prompt(memory: UserMemory) -> str:
    print("PROMPT BUILDER VERSION: NEW")
    print(memory)
    print(vars(memory))
    sections = []

    if memory.debate_formats:
        sections.append(
            _format_list("Debate Formats", memory.debate_formats)
        )

    if memory.target_tournaments:
        sections.append(
            _format_list(
                "Target Tournaments",
                memory.target_tournaments,
            )
        )

    if memory.experience_level:
        sections.append(
            f"Experience Level: {memory.experience_level}"
        )

    if memory.strengths:
        sections.append(
            _format_list("Strengths", memory.strengths)
        )

    if memory.weaknesses:
        sections.append(
            _format_list("Weaknesses", memory.weaknesses)
        )

    if memory.speaking_style:
        sections.append(
            _format_list(
                "Speaking Style",
                memory.speaking_style,
            )
        )

    if memory.recurring_mistakes:
        sections.append(
            _format_list(
                "Recurring Mistakes",
                memory.recurring_mistakes,
            )
        )

    if memory.learning_goals:
        sections.append(
            _format_list(
                "Learning Goals",
                memory.learning_goals,
            )
        )

    if memory.preferred_feedback_style:
        sections.append(
            f"Preferred Feedback Style: {memory.preferred_feedback_style}"
        )

    if memory.notes:
        sections.append(
            _format_list("Additional Notes", memory.notes)
        )

    if not sections:
        return (
            "No long-term user memory is currently available."
        )

    memory_summary = "\n".join(
        f"- {section}" for section in sections
    )

    return f"""
You are an expert debate coach.

The following is long-term memory about the user.

Use it naturally while responding.

Do not mention this memory unless it is relevant.

User Profile:
{memory_summary}
"""