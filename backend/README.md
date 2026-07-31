# AI Coach Backend (FastAPI + Gemini)

## 1. Get a free Gemini API key
Go to https://aistudio.google.com/apikey, sign in with a Google account, and
generate a key. No credit card required.

## 2. Set up the environment
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```
Open `.env` and paste your key into `GEMINI_API_KEY`.

## 3. Run it
```bash
uvicorn app:app --reload --port 8000
```
Visit http://localhost:8000/health — you should see `{"status": "ok"}`.

## Endpoints
- `POST /api/coach/chat` — body: `{ "history": [...], "message": "..." }`,
  returns a streamed plain-text response.
- `POST /api/coach/analyze` — multipart form with a `file` (audio/video) and
  optional `note` text field, returns a streamed plain-text response.

## Rate limits (already wired up)
- `/chat`: 10 requests/minute per IP
- `/analyze`: 5 requests/minute per IP

These exist to protect your Gemini free-tier quota (~15 requests/min,
~1,500/day at time of writing) from being exhausted by one bad actor or a
runaway script. Tune the numbers in `routes/coach.py` as you learn your
real usage pattern.

## Before you deploy this publicly
1. Update `FRONTEND_ORIGIN` in `.env` to your real deployed frontend URL.
2. Never commit `.env` — it's already meant to be gitignored.
3. Consider adding auth (Milestone 2) so abuse can be tied to an account,
   not just an IP, which is easy to rotate.
