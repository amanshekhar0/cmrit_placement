import { useState, useRef, useEffect } from "react";
import { useGroq } from "../hooks/useGroq";
import { renderMarkdown } from "../utils/markdown";

const SYSTEM = `You are PlacementBot, an AI assistant helping CMRIT students prepare for campus placements.
You help with:
- Technical interview questions (DSA, OOPs, DBMS, OS, CN, System Design)
- Explaining concepts clearly with examples
- Coding problems and approaches
- HR/behavioural question tips
- Company-specific preparation advice

Keep answers concise, practical, and interview-focused. Use **bold** for key terms.`;

const SUGGESTIONS = [
  "Explain OOPs concepts",
  "Top DSA topics for placements",
  "SQL vs NoSQL differences",
];

function BotMessage({ text, streaming }) {
  return (
    <div className="flex gap-2 items-start text-left">
      <div className="w-6 h-6 rounded-full bg-zinc-900 flex-shrink-0 flex items-center justify-center mt-0.5">
        <span className="text-white text-[9px] font-semibold">AI</span>
      </div>
      <div className="bg-zinc-50 border border-zinc-200/60 rounded-xl rounded-tl-sm px-3 py-2 text-[12px] text-zinc-600 leading-relaxed max-w-[85%] overflow-hidden prose-clean">
        {renderMarkdown(text)}
        {streaming && <span className="inline-block w-1 h-3 bg-zinc-300 animate-pulse ml-0.5 align-middle rounded-full"/>}
      </div>
    </div>
  );
}

function UserMessage({ text }) {
  return (
    <div className="flex justify-end text-left">
      <div className="bg-zinc-900 text-white rounded-xl rounded-tr-sm px-3 py-2 text-[12px] max-w-[80%] leading-relaxed">{text}</div>
    </div>
  );
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm PlacementBot 👋\n\nAsk me anything about interview prep, tech concepts, or company-specific tips." }
  ]);
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const { chat } = useGroq();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 100); }, [open]);

  const send = async (text) => {
    const userText = text || input.trim();
    if (!userText || streaming) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages([...newMessages, { role: "assistant", content: "" }]);
    setStreaming(true);
    try {
      const apiMessages = [{ role: "system", content: SYSTEM }, ...newMessages.map(m => ({ role: m.role, content: m.content }))];
      await chat(apiMessages, (_, full) => {
        setMessages([...newMessages, { role: "assistant", content: full }]);
      });
    } catch (e) {
      setMessages([...newMessages, { role: "assistant", content: `Sorry, I ran into an error: ${e.message}` }]);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <>
      {/* FAB Button */}
      <button 
        onClick={() => setOpen(v => !v)} 
        aria-label={open ? "Close chat" : "Open chat"} 
        aria-expanded={open}
        className="fixed bottom-5 right-5 w-12 h-12 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full shadow-lg shadow-zinc-900/15 z-50 flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 active:scale-[0.95]"
      >
        {open ? (
          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        ) : (
          <svg className="w-5.5 h-5.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <rect x="4" y="8" width="16" height="12" rx="3" />
            <path d="M12 8V4M12 2.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12h2v4H2zm18 0h2v4h-2z" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="13" r="1.2" fill="currentColor" stroke="none" />
            <circle cx="15" cy="13" r="1.2" fill="currentColor" stroke="none" />
            <path d="M9.5 16.5c1 1 4 1 5 0" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-[72px] right-5 w-[340px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-xl shadow-zinc-200/40 border border-zinc-200/80 flex flex-col z-50 overflow-hidden animate-fadeInScale" style={{height:"460px"}}>
          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-2 border-b border-zinc-100">
            <div className="w-7 h-7 bg-zinc-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <rect x="4" y="8" width="16" height="12" rx="3" />
                <path d="M12 8V4M12 2.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12h2v4H2zm18 0h2v4h-2z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="13" r="1.2" fill="currentColor" stroke="none" />
                <circle cx="15" cy="13" r="1.2" fill="currentColor" stroke="none" />
                <path d="M9.5 16.5c1 1 4 1 5 0" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-zinc-800 text-[13px] leading-none">PlacementBot</p>
              <p className="text-zinc-400 text-[10px] font-medium mt-0.5">AI Interview Coach</p>
            </div>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/40">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"/>
              <span className="text-[9px] text-emerald-600 font-medium">Online</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {messages.map((m, i) => (
              m.role === "user"
                ? <UserMessage key={i} text={m.content}/>
                : <BotMessage key={i} text={m.content} streaming={streaming && i === messages.length - 1}/>
            ))}
            <div ref={bottomRef}/>
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto scrollbar-none">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="flex-shrink-0 text-[11px] bg-zinc-50 border border-zinc-200/60 hover:border-zinc-300 hover:bg-zinc-100/60 rounded-lg px-2.5 py-1.5 text-zinc-500 transition-all duration-200 whitespace-nowrap"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-zinc-100 p-3">
            <div className="flex gap-2 items-end">
              <textarea 
                ref={inputRef} 
                value={input} 
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }}}
                placeholder="Ask a question…" 
                aria-label="Message PlacementBot" 
                rows={1} 
                disabled={streaming}
                className="flex-1 resize-none text-[12px] border border-zinc-200 rounded-lg px-3 py-2 bg-zinc-50 focus:bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-300 placeholder:text-zinc-300 max-h-24 scrollbar-thin disabled:opacity-50 transition-all duration-200"
              />
              <button 
                onClick={() => send()} 
                disabled={!input.trim() || streaming} 
                aria-label="Send message"
                className="w-8 h-8 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 shadow-sm active:scale-[0.95] disabled:opacity-40"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
