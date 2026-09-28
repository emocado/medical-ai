"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, Sparkles } from "lucide-react";
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      role: "assistant",
      content:
        language === "bm"
          ? "Hai, saya HealthMate. Ada apa-apa soalan tentang laporan kesihatan atau ubat anda yang boleh saya bantu?"
          : language === "zh"
          ? "您好，我是 HealthMate。关于您的健康报告或药物，您有什么想问的吗？"
          : language === "ta"
          ? "வணக்கம், நான் ஹெல்த்மேட். உங்கள் உடல்நல அறிக்கை அல்லது மருந்துகள் குறித்து ஏதேனும் கேள்விகள் உள்ளதா?"
          : "Hello, I am HealthMate. Do you have any questions about your report or medications that I can help explain?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
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
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          language,
          latestReport,
          knownPills,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
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
          content:
            language === "bm"
              ? "Maaf, berlaku masalah menyambung ke pembantu. Sila cuba lagi sebentar lagi."
              : language === "zh"
              ? "抱歉，连接助手时出现问题。请稍后重试。"
              : language === "ta"
              ? "மன்னிக்கவும், உதவியாளருடன் இணைப்பதில் சிக்கல் ஏற்பட்டது. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்."
              : "Sorry, I had trouble answering that. Please try asking again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section
      aria-label="Health Assistant Chat"
      className="bg-white rounded-2xl border-2 border-slate-300 p-5 shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <Bot className="w-7 h-7 text-blue-800" aria-hidden="true" />
          <h3 className="text-xl font-bold text-slate-900">Health Assistant Chat</h3>
        </div>
        {latestReport && (
          <span className="text-sm font-semibold bg-blue-100 text-blue-900 px-3 py-1 rounded-full flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-blue-700" />
            Report Connected
          </span>
        )}
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
                {m.content}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 w-fit">
            <Loader2 className="w-6 h-6 animate-spin text-blue-700" aria-hidden="true" />
            <span className="text-base font-semibold">HealthMate is thinking kindly...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={handleSend} className="flex items-center gap-2 pt-2">
        <label htmlFor="chat-input" className="sr-only">
          Ask a health question
        </label>
        <input
          id="chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            latestReport
              ? "Ask anything about this report or test..."
              : "Ask any general health question..."
          }
          disabled={isLoading}
          className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-xl text-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-800 bg-slate-50 focus:bg-white min-h-[48px]"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          aria-label="Send message"
          className={`px-5 py-3 rounded-xl min-h-[48px] min-w-[48px] flex items-center justify-center font-bold text-lg transition-colors ${
            isLoading || !input.trim()
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-blue-800 hover:bg-blue-900 text-white shadow-sm"
          }`}
        >
          <Send className="w-5 h-5" aria-hidden="true" />
        </button>
      </form>
    </section>
  );
}
