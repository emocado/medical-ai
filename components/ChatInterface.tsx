"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, Sparkles, Mic } from "lucide-react";
import { VoiceChatModal } from "./VoiceChatModal";
import { useT } from "./LanguageProvider";
import { errorMessageKey, postJson } from "@/lib/api-client";
import { SAMPLE_QUESTIONS } from "@/lib/samples";
import type { Language, ReportRecord, PillRecord } from "@/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  language: Language;
  latestReport?: ReportRecord | null;
  knownPills?: PillRecord[] | null;
}

export function ChatInterface({
  language,
  latestReport,
  knownPills,
}: ChatInterfaceProps) {
  const t = useT();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      role: "assistant",
      // Greeting text is resolved at render time so it follows the current language.
      content: "",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput("");
    setIsLoading(true);

    try {
      const data = await postJson<{ content: string }>("/api/chat", {
        // The greeting and error bubbles are UI only; the model sees the real exchange.
        messages: nextHistory
          .filter((m) => m.id !== "initial" && !m.id.startsWith("err-"))
          .map((m) => ({ role: m.role, content: m.content })),
        language,
        latestReport,
        knownPills,
      });
      setMessages((prev) => [
        ...prev,
        {
          id: `ast-${Date.now()}`,
          role: "assistant",
          content: data.content,
        },
      ]);
    } catch (err: any) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: t(errorMessageKey(err, "chat.error")),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section
      aria-label={t("chat.aria")}
      className="bg-white rounded-2xl border-2 border-slate-300 p-5 shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <Bot className="w-7 h-7 text-blue-800" aria-hidden="true" />
          <h3 className="text-xl font-bold text-slate-900">{t("chat.title")}</h3>
        </div>
        <div className="flex items-center gap-2">
          {latestReport && (
            <span className="text-sm font-semibold bg-blue-100 text-blue-900 px-3 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-blue-700" />
              {t("chat.reportConnected")}
            </span>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        className="space-y-4 max-h-[380px] overflow-y-auto pr-1"
        role="log"
        aria-live="polite"
      >
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                  isUser ? "bg-blue-900 text-white" : "bg-blue-100 text-blue-900"
                }`}
              >
                {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              <div
                className={`max-w-[85%] p-4 rounded-2xl text-lg leading-relaxed whitespace-pre-line ${
                  isUser
                    ? "bg-blue-900 text-white rounded-tr-none font-medium"
                    : "bg-slate-100 text-slate-900 rounded-tl-none border border-slate-300"
                }`}
              >
                {m.id === "initial" ? t("chat.greeting") : m.content}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 w-fit">
            <Loader2 className="w-6 h-6 animate-spin text-blue-700" aria-hidden="true" />
            <span className="text-base font-semibold">{t("chat.thinking")}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && !isLoading && (
        <div className="space-y-2">
          <p className="text-base font-semibold text-slate-700">{t("chat.suggestions")}</p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => sendMessage(t(key))}
                className="px-3 py-2 rounded-xl min-h-[48px] text-base font-semibold border-2 border-blue-200 bg-blue-50 text-blue-950 hover:bg-blue-100 text-left"
              >
                {t(key)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar with Send and Microphone buttons */}
      <form onSubmit={handleSend} className="flex items-center gap-2 pt-2">
        <label htmlFor="chat-input" className="sr-only">
          {t("chat.inputLabel")}
        </label>
        <input
          id="chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            latestReport
              ? t("chat.placeholderReport")
              : t("chat.placeholderGeneral")
          }
          disabled={isLoading}
          className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-xl text-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-800 bg-slate-50 focus:bg-white min-h-[48px]"
        />

        {/* Microphone Button for hands-free voice chat */}
        <button
          type="button"
          onClick={() => setIsVoiceModalOpen(true)}
          aria-label={t("chat.voice.aria")}
          className="px-4 py-3 rounded-xl min-h-[48px] min-w-[48px] flex items-center justify-center font-bold text-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-colors active:bg-emerald-900"
        >
          <Mic className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          aria-label={t("chat.send.aria")}
          className={`px-4 py-3 rounded-xl min-h-[48px] min-w-[48px] flex items-center justify-center font-bold text-lg transition-colors ${
            isLoading || !input.trim()
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-blue-800 hover:bg-blue-900 text-white shadow-sm"
          }`}
        >
          <Send className="w-5 h-5" aria-hidden="true" />
        </button>
      </form>

      {/* Voice Chat Modal: spoken turns are added to this chat thread */}
      <VoiceChatModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        language={language}
        latestReport={latestReport}
        knownPills={knownPills}
        history={messages
          .filter((m) => m.id !== "initial" && !m.id.startsWith("err-"))
          .map((m) => ({ role: m.role, content: m.content }))}
        onTurn={(turn) =>
          setMessages((prev) => [
            ...prev,
            { id: `usr-voice-${Date.now()}`, role: "user", content: turn.transcript },
            { id: `ast-voice-${Date.now()}`, role: "assistant", content: turn.reply },
          ])
        }
      />
    </section>
  );
}
