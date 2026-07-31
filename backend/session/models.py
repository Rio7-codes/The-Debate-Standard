from dataclasses import dataclass, field


@dataclass
class SessionMemory:
    current_motion: str = ""
    current_side: str = ""

    previous_feedback: list[str] = field(default_factory=list)

    key_points: list[str] = field(default_factory=list)

    current_focus: list[str] = field(default_factory=list)