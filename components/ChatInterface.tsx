"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, Sparkles, Mic } from "lucide-react";
import { VoiceChatModal } from "./VoiceChatModal";
import { useT } from "./LanguageProvider";
import { errorMessageKey, postJson } from "@/lib/api-client";
import { SAMPLE_QUESTIONS } from "@/lib/samples";
import type { Language, ReportRecord, PillRecord, MedicationEntry } from "@/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  language: Language;
  latestReport?: ReportRecord | null;
  knownPills?: PillRecord[] | null;
  medications?: MedicationEntry[] | null;
}

export function ChatInterface({
  language,
  latestReport,
  knownPills,
  medications,
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
        medications,
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
      id="chat"
      aria-label={t("chat.aria")}
      className="card p-5 sm:p-6 space-y-4 scroll-mt-28 lg:scroll-mt-36"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.08] pb-4">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-[13px] bg-accent-soft flex items-center justify-center flex-shrink-0">
            <Bot className="w-6 h-6 text-accent" aria-hidden="true" />
          </span>
          <h3 className="text-xl font-bold text-ink">{t("chat.title")}</h3>
        </div>
        <div className="flex items-center gap-2">
          {latestReport && (
            <span className="chip !text-sm bg-accent-soft text-accent-ink">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              {t("chat.reportConnected")}
            </span>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        className="space-y-4 max-h-[380px] lg:max-h-[520px] overflow-y-auto overscroll-contain pr-1"
        role="log"
        aria-live="polite"
      >
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={`flex items-end gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isUser ? "bg-accent text-white" : "bg-accent-soft text-accent"
                }`}
              >
                {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              <div
                className={`max-w-[85%] lg:max-w-[75%] px-4 py-3 rounded-[22px] text-lg leading-relaxed whitespace-pre-line ${
                  isUser
                    ? "bg-accent text-white rounded-br-md"
                    : "bg-canvas text-ink rounded-bl-md"
                }`}
              >
                {m.id === "initial" ? t("chat.greeting") : m.content}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3 text-ink-tertiary bg-canvas px-4 py-3 rounded-[22px] w-fit">
            <Loader2 className="w-6 h-6 animate-spin text-accent" aria-hidden="true" />
            <span className="text-base font-semibold">{t("chat.thinking")}</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && !isLoading && (
        <div className="space-y-2">
          <p className="eyebrow">{t("chat.suggestions")}</p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => sendMessage(t(key))}
                className="press px-4 py-2 rounded-2xl min-h-[48px] text-base font-medium bg-accent-soft text-accent-ink hover:bg-[#dceafa] text-left"
              >
                {t(key)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar with Send and Microphone buttons */}
      <form onSubmit={handleSend} className="flex items-center gap-2 pt-2 border-t border-black/[0.08] mt-2">
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
          className="field flex-1 min-w-0 !rounded-full !px-5 min-h-[52px]"
        />

        {/* Microphone Button for hands-free voice chat */}
        <button
          type="button"
          onClick={() => setIsVoiceModalOpen(true)}
          aria-label={t("chat.voice.aria")}
          className="press w-[52px] h-[52px] flex-shrink-0 rounded-full flex items-center justify-center bg-emerald-700 hover:bg-emerald-800 text-white shadow-button"
        >
          <Mic className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Send Button */}
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          aria-label={t("chat.send.aria")}
          className="btn btn-primary !px-0 w-[52px] h-[52px] flex-shrink-0"
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
        medications={medications}
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
