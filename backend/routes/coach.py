from fastapi import APIRouter, Request, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from limiter import limiter

from memory.storage import get_memory
from memory.manager import update_memory

from services.gemini import stream_chat, stream_analysis
from services.memory_extractor import extract_memory
from services.prompt_builder import build_memory_prompt

from session.storage import get_session
from session.manager import update_session

from services.session_prompt import build_session_prompt

router = APIRouter(prefix="/api/coach", tags=["coach"])

MAX_UPLOAD_BYTES = 15 * 1024 * 1024  # 15MB

ALLOWED_AUDIO_TYPES = {
    "audio/mpeg",
    "audio/wav",
    "audio/mp4",
    "audio/x-m4a",
    "audio/webm",
    "audio/ogg",
}

ALLOWED_VIDEO_TYPES = {
    "video/mp4",
    "video/webm",
    "video/quicktime",
}


class ChatTurn(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    history: list[ChatTurn] = []
    message: str


@router.post("/chat")
@limiter.limit("10/minute")
async def chat(request: Request, body: ChatRequest):

    if not body.message.strip():
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty.",
        )

    history = [turn.model_dump() for turn in body.history]

    # Temporary until authentication exists.
    user_id = "demo-user"

    # ------------------------------------
    # Long-Term Memory Extraction
    # ------------------------------------
    try:
        extracted = extract_memory(body.message)

        print("\n========== LONG-TERM MEMORY ==========")
        print(extracted)
        print("======================================\n")

        update_memory(user_id, extracted)

    except Exception as e:
        print("Memory extraction failed:", e)

    # ------------------------------------
    # Session Memory
    # ------------------------------------
    try:
        session = update_session(user_id)

        print("\n========== SESSION ==========")
        print(vars(session))
        print("=============================\n")

    except Exception as e:
        print("Session update failed:", e)

    # ------------------------------------
    # Build Prompts
    # ------------------------------------
    memory = get_memory(user_id)
    session = get_session(user_id)

    memory_context = build_memory_prompt(memory)
    session_context = build_session_prompt(session)

    # User profile (long-term)
    history.insert(
        0,
        {
            "role": "system",
            "content": memory_context,
        },
    )

    # Current practice session
    if session_context:
        history.insert(
            1,
            {
                "role": "system",
                "content": session_context,
            },
        )

    async def token_stream():
        async for token in stream_chat(history, body.message):
            yield token

    return StreamingResponse(
        token_stream(),
        media_type="text/plain",
    )


@router.post("/analyze")
@limiter.limit("5/minute")
async def analyze(
    request: Request,
    file: UploadFile = File(...),
    note: str | None = Form(default=None),
):

    content_type = (file.content_type or "").lower()
    filename = (file.filename or "").lower()

    print("\n========== UPLOAD ==========")
    print("Filename:", filename)
    print("Content-Type:", content_type)
    print("============================\n")

    is_audio = (
        content_type.startswith("audio/")
        or filename.endswith(
            (
                ".mp3",
                ".wav",
                ".m4a",
                ".webm",
                ".ogg",
            )
        )
    )

    is_video = (
        content_type.startswith("video/")
        or filename.endswith(
            (
                ".mp4",
                ".mov",
                ".webm",
            )
        )
    )

    if not (is_audio or is_video):
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported file type.\n\n"
                f"Received Content-Type: {content_type}\n"
                f"Filename: {filename}"
            ),
        )

    file_bytes = await file.read()

    if len(file_bytes) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=400,
            detail="File too large. Please keep uploads under 15MB.",
        )

    async def token_stream():
        async for token in stream_analysis(
            file_bytes=file_bytes,
            mime_type=content_type,
            user_note=note,
        ):
            yield token

    return StreamingResponse(
        token_stream(),
        media_type="text/plain",
    )