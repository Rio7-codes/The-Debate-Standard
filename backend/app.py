import os

from dotenv import load_dotenv

load_dotenv()  # must run before importing anything that reads env vars

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

from limiter import limiter
from routes import coach

app = FastAPI(title="The Debate Standard — AI Coach API")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)

app.include_router(coach.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
