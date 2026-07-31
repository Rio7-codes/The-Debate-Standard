from .models import UserMemory

memory_db: dict[str, UserMemory] = {}


def get_memory(user_id: str) -> UserMemory:
    if user_id not in memory_db:
        memory_db[user_id] = UserMemory()

    return memory_db[user_id]