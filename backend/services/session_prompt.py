from session.models import SessionMemory


def build_session_prompt(session: SessionMemory) -> str:
    lines = []

    if session.current_motion:
        lines.append(
            f"Current Motion: {session.current_motion}"
        )

    if session.current_side:
        lines.append(
            f"Current Side: {session.current_side}"
        )

    if session.current_focus:
        lines.append(
            "Current Focus: "
            + ", ".join(session.current_focus)
        )

    if session.previous_feedback:
        lines.append(
            "Recent Feedback: "
            + ", ".join(session.previous_feedback[-5:])
        )

    if session.key_points:
        lines.append(
            "Key Arguments: "
            + ", ".join(session.key_points)
        )

    if not lines:
        return ""

    return (
        "Current Practice Session:\n"
        + "\n".join(lines)
    )