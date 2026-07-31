from dataclasses import dataclass, field


@dataclass
class UserMemory:
    # Debate profile
    debate_formats: list[str] = field(default_factory=list)
    target_tournaments: list[str] = field(default_factory=list)
    experience_level: str = ""

    # Skills
    strengths: list[str] = field(default_factory=list)
    weaknesses: list[str] = field(default_factory=list)

    # Habits
    speaking_style: list[str] = field(default_factory=list)
    recurring_mistakes: list[str] = field(default_factory=list)

    # Goals
    learning_goals: list[str] = field(default_factory=list)

    # Personalisation
    preferred_feedback_style: str = ""

    # Future use
    notes: list[str] = field(default_factory=list)