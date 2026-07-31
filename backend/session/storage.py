from .models import SessionMemory

session_db: dict[str, SessionMemory] = {}


def get_session(user_id: str) -> SessionMemory:
    if user_id not in session_db:
        session_db[user_id] = SessionMemory()

    return session_db[user_id]