"use client";

import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Send,
  Award,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { useRecovery } from "@/context/RecoveryContext";
import BottomNav from "@/components/BottomNav";

export default function ChatsPage() {
  const {
    peerChats,
    sendPersonalMessage,
    toggleSponsor,
    activePeerChatId,
    setActivePeerChatId,
  } = useRecovery();

  const [inputMessage, setInputMessage] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const selectedChat = peerChats.find((c) => c.id === activePeerChatId);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activePeerChatId) return;
    sendPersonalMessage(activePeerChatId, inputMessage);
    setInputMessage("");
  };

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <main className="flex-1 max-w-md mx-auto w-full px-5 pt-[max(1.75rem,env(safe-area-inset-top))] pb-28 flex flex-col">
        {selectedChat ? (
          /* Dedicated 1-on-1 Chat Thread View */
          <div className="flex flex-1 flex-col h-full">
            {/* Thread Header */}
            <header className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActivePeerChatId(null)}
                  className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="relative">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-white font-serif font-bold text-sm"
                    style={{ backgroundColor: selectedChat.avatarColor }}
                  >
                    {selectedChat.name[0]}
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-serif text-base font-bold italic text-neutral-900">
                      {selectedChat.name}
                    </h2>
                    <span className="rounded bg-orange-100/80 px-1.5 py-0.2 text-[10px] font-bold text-[#FF5A00]">
                      Day {selectedChat.cleanDays}
                    </span>
                  </div>
                  <span className="text-[11px] font-sans text-neutral-400">
                    {selectedChat.status}
                  </span>
                </div>
              </div>

              {/* Sponsor Toggle Button */}
              <button
                type="button"
                onClick={() => toggleSponsor(selectedChat.id)}
                className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  selectedChat.isSponsor
                    ? "bg-[#FF5A00] text-white shadow-xs"
                    : "border border-neutral-200 text-neutral-600 hover:border-[#FF5A00] hover:text-[#FF5A00]"
                }`}
                title="Toggle Sponsor status for this peer"
              >
                <Award className="w-3.5 h-3.5" />
                <span>{selectedChat.isSponsor ? "Sponsor ✓" : "Make Sponsor"}</span>
              </button>
            </header>

            {/* Grounding Reminder Banner */}
            <div className="mb-3 rounded-xl bg-neutral-50 p-2.5 text-center border border-neutral-100">
              <p className="text-[11px] text-neutral-500 font-sans">
                Direct 1-on-1 private recovery check-in. Zero judgment.
              </p>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 min-h-[320px] max-h-[500px] p-1">
              {selectedChat.messages.map((msg) => {
                const isMe = msg.sender === "me";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isMe ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-xs font-sans leading-relaxed max-w-[85%] ${
                        isMe
                          ? "bg-[#FF5A00] text-white rounded-tr-sm"
                          : "bg-neutral-100 text-neutral-800 rounded-tl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-neutral-400 mt-1 px-1">
                      {msg.time}
                    </span>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="mt-3 flex items-center gap-2 pt-2 border-t border-neutral-100"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Message ${selectedChat.name}...`}
                className="flex-1 rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-xs font-sans text-neutral-800 placeholder-neutral-400 focus:border-[#FF5A00] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#FF5A00] text-white transition-opacity disabled:opacity-40 hover:opacity-90"
                aria-label="Send message"
              >
                <Send className="w-4 h-4 stroke-[2.2]" />
              </button>
            </form>
          </div>
        ) : (
          /* Main 1-on-1 Chats List View */
          <div className="flex flex-col flex-1">
            {/* Screen Header */}
            <header className="mb-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Direct Peer Support
              </span>
              <h1 className="font-serif text-3xl font-bold italic text-[#FF5A00] tracking-[-0.01em] mt-0.5">
                Personal Chats
              </h1>
              <p className="text-xs font-sans text-neutral-500 mt-0.5">
                1-on-1 check-ins and recovery sponsors.
              </p>
            </header>

            {/* List of Conversations */}
            <div className="flex flex-col gap-2.5">
              {peerChats.map((chat) => {
                const lastMsg =
                  chat.messages[chat.messages.length - 1]?.text ||
                  "No messages yet";
                const lastTime =
                  chat.messages[chat.messages.length - 1]?.time || "";

                return (
                  <button
                    key={chat.id}
                    type="button"
                    onClick={() => setActivePeerChatId(chat.id)}
                    className="flex w-full items-center justify-between rounded-2xl border border-neutral-200 bg-white p-4 text-left transition-all duration-200 hover:border-[#FF5A00]/40 hover:bg-orange-50/20 active:scale-[0.99] cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-3">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-full text-white font-serif font-bold text-base shadow-xs"
                          style={{ backgroundColor: chat.avatarColor }}
                        >
                          {chat.name[0]}
                        </div>
                        {chat.isSponsor && (
                          <span
                            className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5A00] text-white"
                            title="Sponsor"
                          >
                            <Award className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      {/* Name & Snippet */}
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <div className="flex items-center gap-1.5 truncate">
                            <h2 className="font-serif text-base font-bold italic text-neutral-900 truncate">
                              {chat.name}
                            </h2>
                            {chat.isSponsor && (
                              <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.2 text-[9px] font-bold text-[#FF5A00]">
                                Sponsor
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-neutral-400 shrink-0">
                            {lastTime.split(", ")[1] || lastTime}
                          </span>
                        </div>

                        <p className="truncate text-xs font-sans text-neutral-500">
                          {lastMsg}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-neutral-300 shrink-0" />
                  </button>
                );
              })}
            </div>

            {/* Privacy & Safety Note */}
            <div className="mt-auto pt-6 text-center">
              <p className="text-[11px] text-neutral-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF5A00]" />
                <span>All 1-on-1 conversations are anonymous and confidential.</span>
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
