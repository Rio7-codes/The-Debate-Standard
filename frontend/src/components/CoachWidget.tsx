"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, X, Send, Mic, Video, Loader2, Square } from "lucide-react";
import ReactMarkdown from "react-markdown";

const API_BASE = process.env.NEXT_PUBLIC_COACH_API_URL || "http://localhost:8000";

type Role = "user" | "assistant";
interface Message {
  role: Role;
  content: string;
}

const WELCOME: Message = {
  role: "assistant",
  content:
    "Welcome to the Debate Coach. I can help you practice speeches, analyse debates, improve rebuttals, build cases, or explain any format. Ask me something, record your speech live, or upload a recording below.",
};

function CoachMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        strong: ({ children }) => (
          <strong className="font-semibold text-violet-800">{children}</strong>
        ),
        h1: ({ children }) => (
          <p className="mb-1.5 mt-1 text-[13px] font-semibold text-gray-900">{children}</p>
        ),
        h2: ({ children }) => (
          <p className="mb-1.5 mt-1 text-[13px] font-semibold text-gray-900">{children}</p>
        ),
        h3: ({ children }) => (
          <p className="mb-1 mt-1 text-[12.5px] font-semibold text-violet-700">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="mb-2 ml-4 list-disc space-y-1 last:mb-0">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-2 ml-4 list-decimal space-y-1 last:mb-0">{children}</ol>
        ),
        li: ({ children }) => <li>{children}</li>,
        em: ({ children }) => <em className="italic">{children}</em>,
        hr: () => <hr className="my-2 border-[#E8E2D2]" />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Picks a MIME type the browser's MediaRecorder actually supports, since
// support varies (Chrome/Firefox/Safari all differ on codec support).
function pickSupportedMimeType(kind: "audio" | "video"): string {
  const candidates =
    kind === "video"
      ? ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm", "video/mp4"]
      : ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];

  for (const type of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return kind === "video" ? "video/webm" : "audio/webm";
}

export default function CoachWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [recordingKind, setRecordingKind] = useState<"audio" | "video" | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    // Safety net: release camera/mic if the component unmounts mid-recording.
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  async function streamIntoLastMessage(response: Response) {
    if (!response.ok || !response.body) {
      const detail = await response.text().catch(() => "");
      throw new Error(detail || "Something went wrong reaching the coach.");
    }

    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "assistant",
          content: next[next.length - 1].content + chunk,
        };
        return next;
      });
    }

    if (!fullText.trim()) {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "assistant",
          content: "Sorry, I didn't quite catch that — could you rephrase it?",
        };
        return next;
      });
    }
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || busy) return;

    setError(null);
    const history = messages
      .filter((m) => m !== WELCOME)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch(`${API_BASE}/api/coach/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history, message: text }),
      });
      await streamIntoLastMessage(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function submitRecording(
    blob: Blob,
    kind: "audio" | "video",
    label: string
  ) {
    if (busy) return;
    setError(null);

    setMessages((prev) => [...prev, { role: "user", content: label }]);
    setBusy(true);

    try {
      const form = new FormData();
      const ext =
        blob.type.includes("mp4")
          ? "mp4"
          : blob.type.includes("ogg")
          ? "ogg"
          : blob.type.includes("wav")
          ? "wav"
          : blob.type.includes("mpeg")
          ? "mp3"
          : "webm";
      const file = new File(
        [blob],
        `recording.${ext}`,
        {
          type: blob.type,
          lastModified: Date.now(),
        }
      );

      form.append("file", file);
      const res = await fetch(`${API_BASE}/api/coach/analyze`, {
        method: "POST",
        body: form,
      });
      await streamIntoLastMessage(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadFile(file: File, kind: "audio" | "video") {
    await submitRecording(file, kind, `📎 Uploaded ${kind}: ${file.name}`);
  }

  async function startRecording(kind: "audio" | "video") {
    if (busy || recordingKind) return;
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: kind === "video" ? { width: 320, height: 240 } : false,
      });

      streamRef.current = stream;

      if (kind === "video" && videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }

      const mimeType = pickSupportedMimeType(kind);
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        const duration = formatTime(elapsed);
        submitRecording(
          blob,
          kind,
          kind === "video"
            ? `🎥 Recorded video (${duration})`
            : `🎙️ Recorded audio (${duration})`
        );
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecordingKind(kind);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } catch (err) {
      setError(
        "Couldn't access your microphone/camera. Check your browser's permission settings."
      );
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
    setRecordingKind(null);
  }

  return (
    <div className="fixed bottom-5 right-5 z-[9998] flex flex-col items-end">
      {/* Panel */}
      <div
        className={`mb-3 flex h-[440px] w-[300px] flex-col overflow-hidden rounded-2xl border border-[#E8DCC0] bg-[#FBFAF6] shadow-[0_30px_70px_-20px_rgba(76,29,149,0.35)] transition-all duration-300 ease-out ${
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-95 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="relative shrink-0">
          <div className="h-[3px] w-full bg-gradient-to-r from-violet-600 via-[#D4AF37] to-violet-600" />
          <div className="flex items-center justify-between px-3.5 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-violet-800 text-white">
                <Sparkles size={12} />
              </span>
              <span className="heading-font text-[14px] tracking-wide text-gray-900">
                AI Debate Coach
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close coach"
              className="cursor-pointer rounded-lg p-1 text-gray-500 transition-colors duration-200 hover:bg-violet-50 hover:text-violet-700"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto px-3 py-2.5">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[88%] rounded-xl px-3 py-2 text-[12.5px] leading-relaxed ${
                  m.role === "user"
                    ? "whitespace-pre-wrap bg-gradient-to-r from-violet-600 to-violet-800 text-white"
                    : "bg-white text-gray-800 shadow-sm ring-1 ring-[#E8E2D2]"
                }`}
              >
                {m.role === "assistant" ? (
                  m.content ? (
                    <CoachMarkdown content={m.content} />
                  ) : busy && i === messages.length - 1 ? (
                    "…"
                  ) : (
                    ""
                  )
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex items-center gap-1.5 pl-1 text-[11px] text-gray-400">
              <Loader2 size={12} className="animate-spin" />
              Thinking…
            </div>
          )}
          {error && (
            <div className="rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] text-red-600">
              {error}
            </div>
          )}
        </div>

        {/* Recording state: live preview + timer + stop button */}
        {recordingKind && (
          <div className="shrink-0 border-t border-[#E8E2D2] bg-[#FBFAF6] px-2.5 py-2">
            {recordingKind === "video" && (
              <video
                ref={videoPreviewRef}
                autoPlay
                muted
                playsInline
                className="mb-2 h-20 w-full scale-x-[-1] rounded-lg bg-black object-cover"
              />
            )}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[11.5px] font-medium text-red-600">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                Recording {formatTime(elapsed)}
              </span>
              <button
                type="button"
                onClick={stopRecording}
                className="flex cursor-pointer items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-medium text-white transition-all duration-200 hover:bg-red-700 active:scale-[0.95]"
              >
                <Square size={10} fill="white" /> Stop
              </button>
            </div>
          </div>
        )}

        {/* Upload / record row */}
        {!recordingKind && (
          <div className="grid shrink-0 grid-cols-2 gap-1.5 border-t border-[#E8E2D2] px-2.5 py-2">
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/mpeg,audio/wav,audio/mp4,audio/x-m4a,audio/webm,audio/ogg"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadFile(f, "audio");
                e.target.value = "";
              }}
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) uploadFile(f, "video");
                e.target.value = "";
              }}
            />

            <button
              type="button"
              disabled={busy}
              onClick={() => startRecording("audio")}
              className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-gray-200 py-1 text-[10.5px] font-medium text-gray-600 transition-all duration-200 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Mic size={11} /> Record Audio
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => startRecording("video")}
              className="flex cursor-pointer items-center justify-center gap-1 rounded-lg border border-gray-200 py-1 text-[10.5px] font-medium text-gray-600 transition-all duration-200 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Video size={11} /> Record Video
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => audioInputRef.current?.click()}
              className="flex cursor-pointer items-center justify-center gap-1 rounded-lg py-1 text-[10.5px] font-medium text-gray-400 underline-offset-2 transition-all duration-200 hover:text-violet-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              or upload audio file
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => videoInputRef.current?.click()}
              className="flex cursor-pointer items-center justify-center gap-1 rounded-lg py-1 text-[10.5px] font-medium text-gray-400 underline-offset-2 transition-all duration-200 hover:text-violet-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              or upload video file
            </button>
          </div>
        )}

        {/* Input */}
        <div className="flex shrink-0 items-center gap-1.5 border-t border-[#E8E2D2] p-2.5">
          <input
            value={input}
            disabled={busy || !!recordingKind}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask your coach…"
            className="flex-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[12.5px] text-gray-800 outline-none transition-colors duration-200 focus:border-violet-300 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={busy || !!recordingKind || !input.trim()}
            aria-label="Send message"
            className="flex h-7.5 w-7.5 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-violet-800 text-white transition-all duration-200 hover:shadow-[0_6px_16px_-4px_rgba(109,40,217,0.6)] active:scale-[0.94] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={13} />
          </button>
        </div>
      </div>

      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle AI Debate Coach"
        className="group relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-violet-900 text-white shadow-[0_10px_24px_-6px_rgba(76,29,149,0.55)] transition-all duration-300 ease-out hover:shadow-[0_14px_32px_-6px_rgba(76,29,149,0.7)] active:scale-[0.94]"
      >
        <span className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-violet-500 to-[#D4AF37] opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-50" />
        {open ? (
          <X size={19} className="transition-transform duration-300" />
        ) : (
          <Sparkles size={19} className="transition-transform duration-300 group-hover:scale-110" />
        )}
      </button>
    </div>
  );
}