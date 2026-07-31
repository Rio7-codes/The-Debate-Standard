from .storage import get_session


def update_session(
    user_id: str,
    motion: str | None = None,
    side: str | None = None,
):
    session = get_session(user_id)

    if motion:
        session.current_motion = motion

    if side:
        session.current_side = side

    return session