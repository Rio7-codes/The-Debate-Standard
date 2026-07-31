from slowapi import Limiter
from slowapi.util import get_remote_address

# IP-based rate limiting. This is a real requirement, not polish — without
# it, anyone can hit your Gemini-backed endpoint in a loop. Since Gemini's
# free tier is itself rate-limited (~15 requests/min, ~1,500/day at the time
# of writing), a single script hammering this endpoint could burn your
# entire daily quota in minutes and lock out every real visitor.
limiter = Limiter(key_func=get_remote_address)
