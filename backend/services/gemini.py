import os
from typing import AsyncGenerator, Optional

from google import genai
from google.genai import types

from .prompts import SYSTEM_PROMPT, build_analysis_instruction

# Flash-Lite is the right choice here: it's confirmed free-tier as of
# writing, fast enough to feel conversational, and natively understands
# text, audio, and video in the same request — no separate transcription
# step needed. Google's model lineup moves fast (this is already the
# replacement for an earlier model that got retired mid-project) — if this
# one ever 404s too, check https://ai.google.dev/gemini-api/docs/models
# for the current free-tier model name and swap it in here.
MODEL_NAME = "gemini-3.1-flash-lite"

_client: genai.Client | None = None


def get_client() -> genai.Client:
    """Lazily creates the Gemini client so importing this module never
    fails just because the env var isn't loaded yet (e.g. during tests)."""
    global _client
    if _client is None:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError(
                "GEMINI_API_KEY is not set. Copy .env.example to .env and "
                "add your key from https://aistudio.google.com/apikey"
            )
        _client = genai.Client(api_key=api_key)
    return _client


def _history_to_contents(history: list[dict]) -> list[types.Content]:
    """Converts [{role, content}, ...] from the frontend into the SDK's
    Content objects. 'assistant' maps to Gemini's 'model' role."""
    contents = []
    for turn in history:
        role = "model" if turn.get("role") == "assistant" else "user"
        contents.append(
            types.Content(
                role=role,
                parts=[types.Part.from_text(text=turn.get("content", ""))],
            )
        )
    return contents


async def stream_chat(
    history: list[dict], message: str
) -> AsyncGenerator[str, None]:
    """Plain text conversation — the 'Chat' mode of the coach."""
    client = get_client()
    contents = _history_to_contents(history)
    contents.append(
        types.Content(role="user", parts=[types.Part.from_text(text=message)])
    )

    # NOTE: generate_content_stream returns an async generator directly —
    # do NOT `await` it before iterating, only the individual chunks arrive
    # via the async for loop itself.
    async for chunk in client.aio.models.generate_content_stream(
        model=MODEL_NAME,
        contents=contents,
        config=types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT),
    ):
        if chunk.text:
            yield chunk.text


async def stream_analysis(
    file_bytes: bytes, mime_type: str, user_note: Optional[str]
) -> AsyncGenerator[str, None]:
    """Evaluates an uploaded audio or video recording. Small/medium files
    (under ~20MB) can go inline; anything larger should use the Files API
    instead — see the note below if you hit size limits later."""
    client = get_client()

    instruction = build_analysis_instruction(user_note)

    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_bytes(data=file_bytes, mime_type=mime_type),
                types.Part.from_text(text=instruction),
            ],
        )
    ]

    async for chunk in client.aio.models.generate_content_stream(
        model=MODEL_NAME,
        contents=contents,
        config=types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT),
    ):
        if chunk.text:
            yield chunk.text


# NOTE on large files: if you start getting uploads over ~20MB (a several-
# minute video easily will), switch this to client.files.upload(file=...)
# which stores the file with Google temporarily and returns a reference you
# pass into `contents` instead of raw bytes. Inline bytes are simplest to
# start with, so that's what's wired up here.