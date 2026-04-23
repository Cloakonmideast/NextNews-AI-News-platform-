// src/pages/AnchorPage.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  Mic, MessageSquare, Volume2, VolumeX,
  Maximize2, Minimize2, ArrowLeft, Send,
  Loader2, Radio, Volume1,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../LanguageContext";
import NewsAnchorAvatar from "../components/NewsAnchorAvatar";

const BASE = "http://localhost:5000";

const SPEECH_LANG_MAP = {
  english: "en-US", hindi: "hi-IN", tamil: "ta-IN", telugu: "te-IN",
  kannada: "kn-IN", malayalam: "ml-IN", bengali: "bn-IN", marathi: "mr-IN",
  punjabi: "pa-IN", gujarati: "gu-IN", odia: "or-IN", urdu: "ur-PK",
};

const AnchorPage = () => {
  const { language } = useLanguage();
  const isRTL = language === "urdu";

  const [isMicActive, setIsMicActive] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [chatMessage, setChatMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { type: "bot", text: "Ping me for live updates." },
  ]);
  const [volume, setVolume] = useState(80);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Audio
  const [audioUrl, setAudioUrl] = useState(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState("");
  const [isAvatarPlaying, setIsAvatarPlaying] = useState(false);
  const audioRef = useRef(null);

  // Summaries
  const [summaries, setSummaries] = useState([]);
  const [loadingSummaries, setLoadingSummaries] = useState(false);

  const videoRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => { fetchSummaries(); }, []);

  const fetchSummaries = async () => {
    setLoadingSummaries(true);
    try {
      const res = await fetch(`${BASE}/summarize_news`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language }),
      });
      const data = await res.json();
      if (data.summaries) setSummaries(data.summaries);
    } catch { /* silently fail */ } finally { setLoadingSummaries(false); }
  };

  // ── Generate audio ──
  const handleGenerateAudio = async () => {
    setLoadingAudio(true); setAudioError(""); setAudioUrl(null); setIsAvatarPlaying(false);
    try {
      const res = await fetch(`${BASE}/generate_voice`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate audio");
      setAudioUrl(`${BASE}${data.audio_url}?t=${Date.now()}`);
    } catch (e) { setAudioError(e.message); } finally { setLoadingAudio(false); }
  };

  // ── Chat ──
  const handleSendMessage = async () => {
    if (!chatMessage.trim() || isSending) return;
    const userMsg = chatMessage.trim();
    setChatHistory((prev) => [...prev, { type: "user", text: userMsg }]);
    setChatMessage(""); setIsSending(true);
    try {
      const response = await fetch(`${BASE}/ask_question`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg, language }),
      });
      const data = await response.json();
      setChatHistory((prev) => [...prev, { type: "bot", text: data.answer || data.error || "No response." }]);
    } catch {
      setChatHistory((prev) => [...prev, { type: "bot", text: "Connection error. Please try again." }]);
    } finally {
      setIsSending(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") handleSendMessage(); };

  const handleMicClick = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported."); return; }
    const recognition = new SR();
    recognition.lang = SPEECH_LANG_MAP[language] || "en-US";
    recognition.start(); setIsMicActive(true);
    recognition.onresult = (e) => { setChatMessage(e.results[0][0].transcript); setIsMicActive(false); };
    recognition.onerror = () => setIsMicActive(false);
    recognition.onend = () => setIsMicActive(false);
  };

  const handleFullScreenToggle = () => {
    if (!document.fullscreenElement) { videoRef.current?.requestFullscreen(); setIsFullScreen(true); }
    else { document.exitFullscreen(); setIsFullScreen(false); }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-white" dir={isRTL ? "rtl" : "ltr"}>

      {/* Sub-nav */}
      <div className="border-b border-white/[0.05] px-6 sm:px-10 py-4 flex items-center justify-between max-w-[1400px] mx-auto">
        <div className="flex items-center gap-3">
          <Link to="/demo" className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors">
            <ArrowLeft className="text-white/40 w-5 h-5" />
          </Link>
          <h1 className="text-base font-semibold text-white/80">AI News Anchor</h1>
        </div>
        {/* Spacer */}
        <div />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-6 flex gap-6 flex-col lg:flex-row anim-fade-up">

        {/* ── Left column ── */}
        <div className="flex-1 min-w-0 space-y-5">

          {/* ═══ Lip-Sync Avatar ═══ */}
          <div ref={videoRef} className="card overflow-hidden relative">
            <NewsAnchorAvatar
              audioUrl={audioUrl}
              isPlaying={isAvatarPlaying}
              onTogglePlay={() => setIsAvatarPlaying((p) => !p)}
              volume={volume}
            />

            {/* Volume slider overlay */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2.5 px-3 py-2 rounded-xl bg-black/50 backdrop-blur-sm">
              <button onClick={() => setVolume(v => v > 0 ? 0 : 80)} className="shrink-0">
                {volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : volume < 50 ? <Volume1 className="w-4 h-4 text-white/70" /> : <Volume2 className="w-4 h-4 text-white/70" />}
              </button>
              <input
                type="range" min="0" max="100" value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-24 h-1 accent-cyan-400 cursor-pointer appearance-none bg-white/20 rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(6,182,212,0.6)]"
              />
              <span className="text-[11px] text-white/40 font-medium w-7 text-right">{volume}%</span>
            </div>
            <div className="absolute bottom-4 right-4">
              <button className="p-2.5 rounded-lg bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-colors" onClick={handleFullScreenToggle}>
                {isFullScreen ? <Minimize2 className="w-5 h-5 text-white/70" /> : <Maximize2 className="w-5 h-5 text-white/70" />}
              </button>
            </div>
          </div>

          {/* ═══ Audio Player ═══ */}
          <div className="card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="icon-circle w-10 h-10 rounded-xl">
                  <Radio className="w-5 h-5 text-cyan-400" />
                </div>
                <h2 className="text-base font-semibold text-white/80">Audio Broadcast</h2>
              </div>
              <button onClick={handleGenerateAudio} disabled={loadingAudio}
                className="btn-accent flex items-center gap-2">
                {loadingAudio
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Generating…</>
                  : <><Radio className="w-4 h-4" />Generate Audio</>
                }
              </button>
            </div>
            {audioError && <p className="text-red-400 text-sm mb-3">⚠ {audioError}</p>}
            {audioUrl ? (
              <div className="flex items-center gap-3">
                <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-4 py-3 rounded-lg text-sm flex-1">
                  ✓ Audio ready — click <strong>Play News</strong> on the anchor above.
                </div>
                <a href={audioUrl} download="news-summary.mp3" className="read-summary text-sm whitespace-nowrap">⬇ Download</a>
              </div>
            ) : !loadingAudio && (
              <p className="text-white/30 text-sm">Click "Generate Audio" to hear the latest summary. Search for news first.</p>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 py-2">
            <button
              className={`p-3.5 rounded-xl transition-all ${isMicActive ? "bg-red-500/80 animate-pulse" : "card hover:bg-[#1a1a20]"}`}
              onClick={handleMicClick} title="Voice input">
              <Mic className="w-6 h-6 text-white/50" />
            </button>
            <button
              className={`p-3.5 rounded-xl transition-all ${isChatOpen ? "bg-cyan-500/10 border border-cyan-500/20" : "card hover:bg-[#1a1a20]"}`}
              onClick={() => setIsChatOpen(!isChatOpen)} title="Toggle chat">
              <MessageSquare className="w-6 h-6 text-white/50" />
            </button>
          </div>
        </div>

        {/* ── Right column: chat ── */}
        {isChatOpen && (
          <div className="w-full lg:max-w-md card p-5 flex flex-col">
            <p className="text-sm text-white/30 text-center mb-4 font-medium">
              Ask anything about the latest news
            </p>

            <div className="flex-1 min-h-[320px] sm:min-h-[400px] max-h-[540px] bg-[#0e0e12] rounded-xl mb-4 p-4 overflow-y-auto flex flex-col gap-3">
              {chatHistory.map((msg, i) => (
                <div key={i}
                  className={`px-4 py-3 rounded-xl max-w-[85%] text-sm leading-relaxed ${msg.type === "user"
                      ? "bg-cyan-500 ml-auto text-black font-medium"
                      : "bg-[#1a1a20] text-white/60"
                    }`}>
                  {msg.text}
                </div>
              ))}
              {isSending && (
                <div className="bg-[#1a1a20] px-4 py-3 rounded-xl max-w-[85%] flex items-center gap-2 text-white/30 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Thinking…
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="flex items-center gap-2.5">
              <input type="text" value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Ask about the news…"
                className="flex-1 bg-[#0e0e12] py-3 px-4 rounded-xl text-sm text-white placeholder-white/20 border border-white/[0.06] focus:outline-none focus:border-cyan-500/40 transition-colors" />
              <button onClick={handleSendMessage} disabled={isSending}
                className="btn-accent p-3 rounded-xl disabled:opacity-50">
                {isSending ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : <Send className="w-5 h-5 text-black" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnchorPage;