import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { useGroq } from "../hooks/useGroq";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// Everything here runs in the browser: the PDF is parsed client-side and
// questions come straight from Groq. Nothing is uploaded or stored server-side,
// so it adds zero load to the serverless backend and zero MongoDB usage.

async function extractPdfText(file) {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it) => it.str).join(" ") + "\n";
    if (text.length > 12000) break; // resumes are short; cap for token safety
  }
  return text.trim();
}

function parseQuestions(text) {
  return text
    .split("\n")
    .map((l) => l.replace(/^\s*\d+[).\].:]?\s*/, "").replace(/^[-*•]\s*/, "").trim())
    .filter((l) => l.length > 10);
}

const INTERVIEW_SYSTEM =
  "You are a senior software engineer conducting a rigorous technical interview. " +
  "Using ONLY the candidate's resume, ask deep, specific questions about THEIR projects — " +
  "probe architecture choices, design trade-offs, why a particular technology was chosen, " +
  "how they would scale, secure, or debug it, failure modes, and edge cases. " +
  "Avoid generic textbook questions. Each question must reference something concrete from the resume. " +
  "Output ONLY the questions, one per line, no numbering, no preamble, no commentary.";

export default function MockInterview() {
  const { chat } = useGroq();
  const [fileName, setFileName] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [questions, setQuestions] = useState([]); // { id, text, followUps: [] }
  const [extracting, setExtracting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [followUpId, setFollowUpId] = useState(null);
  const [error, setError] = useState("");

  const generateQuestions = async (text, { append } = {}) => {
    setGenerating(true);
    setError("");
    try {
      const existing = append ? questions.map((q) => q.text) : [];
      const messages = [
        { role: "system", content: INTERVIEW_SYSTEM },
        {
          role: "user",
          content:
            `RESUME:\n${text.slice(0, 6000)}\n\n` +
            `Generate ${append ? 8 : 10} in-depth interview questions about the candidate's projects.` +
            (existing.length ? `\n\nDo NOT repeat any of these already-asked questions:\n${existing.join("\n")}` : ""),
        },
      ];
      const full = await chat(messages);
      const parsed = parseQuestions(full).map((t) => ({
        id: crypto.randomUUID(),
        text: t,
        followUps: [],
      }));
      if (parsed.length === 0) throw new Error("Couldn't generate questions — try again.");
      setQuestions((prev) => (append ? [...prev, ...parsed] : parsed));
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF resume.");
      return;
    }
    setError("");
    setExtracting(true);
    setQuestions([]);
    try {
      const text = await extractPdfText(file);
      if (text.length < 80) {
        throw new Error("Couldn't read text from this PDF (it may be scanned/image-only).");
      }
      setFileName(file.name);
      setResumeText(text);
      setExtracting(false);
      await generateQuestions(text, { append: false });
    } catch (err) {
      setError(err.message);
      setExtracting(false);
    }
  };

  const addFollowUp = async (item) => {
    setFollowUpId(item.id);
    setError("");
    try {
      const messages = [
        {
          role: "system",
          content:
            "You are a technical interviewer. Ask ONE sharper follow-up question that digs deeper " +
            "into the given question, based on the candidate's resume. Output ONLY the question.",
        },
        {
          role: "user",
          content: `RESUME CONTEXT:\n${resumeText.slice(0, 3000)}\n\nQUESTION: ${item.text}\n\nGive one deeper follow-up question.`,
        },
      ];
      const full = await chat(messages);
      const followUp = parseQuestions(full)[0] || full.trim();
      setQuestions((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, followUps: [...q.followUps, followUp] } : q))
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setFollowUpId(null);
    }
  };

  const reset = () => {
    setFileName("");
    setResumeText("");
    setQuestions([]);
    setError("");
  };

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center shadow-sm">
            <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-zinc-900 text-[15px] tracking-tight">Mock Interview</h2>
            <p className="text-zinc-400 text-[12px]">Upload your resume — get in-depth questions on your projects</p>
          </div>
        </div>
        {resumeText && (
          <button onClick={reset} className="text-[12px] text-zinc-400 hover:text-zinc-700 font-medium">
            New resume
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50/80 border border-red-200/60 rounded-xl text-[12px] text-red-600 flex items-start gap-2">
          <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Upload zone */}
      {!resumeText && (
        <label
          className={`block border-2 border-dashed border-zinc-200 rounded-2xl bg-white p-10 text-center cursor-pointer hover:border-zinc-300 hover:bg-zinc-50/50 transition-colors ${extracting ?"pointer-events-none opacity-70" :""}`}
        >
          <input type="file" accept="application/pdf" onChange={handleFile} className="hidden" disabled={extracting} />
          <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center mx-auto mb-3">
            {extracting ? (
              <span className="w-5 h-5 rounded-full border-2 border-zinc-300 border-t-zinc-800 animate-spin" />
            ) : (
              <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            )}
          </div>
          <p className="text-[13px] font-semibold text-zinc-800">
            {extracting ? "Reading your resume…" : "Upload your resume (PDF)"}
          </p>
          <p className="text-[12px] text-zinc-400 mt-1">
            We read it in your browser — it's never uploaded to a server.
          </p>
        </label>
      )}

      {/* Generating initial */}
      {resumeText && generating && questions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-white border border-zinc-200/60 rounded-xl">
          <div className="w-8 h-8 rounded-full border-2 border-zinc-100 border-t-zinc-800 animate-spin mb-3" />
          <p className="text-[12px] font-semibold text-zinc-700">Analysing your projects…</p>
        </div>
      )}

      {/* Questions */}
      {questions.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-[12px] text-zinc-400">
              <span className="font-semibold text-zinc-700">{fileName}</span> · {questions.length} questions
            </p>
          </div>

          <div className="space-y-2.5">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-zinc-900 text-white text-[11px] font-semibold flex items-center justify-center tabular-nums">
                    {idx + 1}
                  </span>
                  <p className="text-[13px] text-zinc-800 leading-relaxed pt-0.5">{q.text}</p>
                </div>

                {q.followUps.length > 0 && (
                  <div className="mt-3 ml-9 space-y-2 border-l-2 border-zinc-100 pl-3">
                    {q.followUps.map((f, i) => (
                      <p key={i} className="text-[12px] text-zinc-500 leading-relaxed">
                        <span className="text-zinc-300 font-medium">↳ Follow-up:</span> {f}
                      </p>
                    ))}
                  </div>
                )}

                <div className="mt-2.5 ml-9">
                  <button
                    onClick={() => addFollowUp(q)}
                    disabled={followUpId === q.id}
                    className="text-[11px] font-medium text-zinc-500 hover:text-zinc-800 disabled:opacity-50 inline-flex items-center gap-1"
                  >
                    {followUpId === q.id ? (
                      <span className="w-3 h-3 rounded-full border-2 border-zinc-300 border-t-zinc-700 animate-spin" />
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.9}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                    Ask a follow-up
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex justify-center">
            <button
              onClick={() => generateQuestions(resumeText, { append: true })}
              disabled={generating}
              className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 text-white text-[13px] font-medium px-4 py-2.5 rounded-xl transition-all duration-200 active:scale-[0.98] shadow-sm"
            >
              {generating ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Generate more questions
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
