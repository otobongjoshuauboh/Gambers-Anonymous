"use client";

import { useState, useRef, useEffect } from "react";
import {
  Radio,
  Users,
  Send,
  CheckCircle2,
  Shield,
} from "lucide-react";
import { useRecovery } from "@/context/RecoveryContext";
import { DAILY_MEETINGS } from "@/data/recoveryData";
import BottomNav from "@/components/BottomNav";
import LiveAudioModal from "@/components/LiveAudioModal";

export default function MeetingsPage() {
  const {
    streakBanner,
    dismissStreakBanner,
    communityMessages,
    sendCommunityMessage,
    openAudioMeeting,
    activeAudioMeeting,
  } = useRecovery();

  const [inputMessage, setInputMessage] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat to bottom when messages update
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [communityMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendCommunityMessage(inputMessage);
    setInputMessage("");
  };

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <main className="flex-1 max-w-md mx-auto w-full px-5 pt-[max(1.75rem,env(safe-area-inset-top))] pb-32 flex flex-col">
        {/* Screen Header */}
        <header className="mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Open Recovery Circles
          </span>
          <h1 className="font-serif text-3xl font-bold italic text-[#FF5A00] tracking-[-0.01em] mt-0.5">
            Group Meetings
          </h1>
          <p className="text-xs font-sans text-neutral-500 mt-0.5">
            Free, anonymous, and judgment-free 24/7.
          </p>
        </header>

        {/* Streak Confirmation Banner */}
        {streakBanner && (
          <div className="mb-5 flex items-start justify-between rounded-2xl border border-[#FF5A00]/30 bg-[#FF5A00]/10 p-4 transition-all">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#FF5A00] shrink-0" />
              <p className="font-serif text-sm font-bold italic text-[#FF5A00]">
                {streakBanner}
              </p>
            </div>
            <button
              type="button"
              onClick={dismissStreakBanner}
              className="text-xs text-neutral-400 hover:text-neutral-700 px-1 py-0.5"
            >
              ✕
            </button>
          </div>
        )}

        {/* Daily Live Meetings Banner (Top Area) */}
        <section
          aria-label="Daily Live Meeting Schedule"
          className="mb-6 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-[#FF5A00] animate-pulse" />
              <h2 className="font-serif text-base font-bold italic text-neutral-900">
                Daily Open Live Calls
              </h2>
            </div>
            <span className="text-[11px] font-medium text-neutral-400">
              3 Sessions Daily
            </span>
          </div>

          {/* 3 Call Slots */}
          <div className="flex flex-col gap-2.5 my-4">
            {DAILY_MEETINGS.map((slot) => {
              const isHighlight = slot.isActiveOrNext;
              return (
                <div
                  key={slot.id}
                  className={`flex items-center justify-between rounded-2xl p-3 border transition-all ${
                    isHighlight
                      ? "border-[#FF5A00]/40 bg-orange-50/40"
                      : "border-neutral-100 bg-neutral-50/50"
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-sm font-bold italic text-neutral-900">
                        {slot.timeLabel}
                      </span>
                      {isHighlight && (
                        <span className="rounded-full bg-[#FF5A00] px-2 py-0.5 text-[9px] font-bold text-white tracking-wide uppercase">
                          Next Up
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-sans text-neutral-500">
                      {slot.timeZone}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>{slot.participantCount}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Join Live Call Primary Button */}
          <div className="pt-1 flex flex-col items-center">
            <button
              type="button"
              onClick={() => openAudioMeeting(DAILY_MEETINGS[0])}
              className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-[#FF5A00] py-3.5 px-6 font-serif text-lg font-bold italic tracking-wide text-white shadow-sm transition-all hover:opacity-90 active:scale-98"
            >
              <Radio className="w-5 h-5 animate-pulse" />
              <span>Join Live Call</span>
            </button>

            <p className="mt-2 text-center text-[11px] text-neutral-400 flex items-center justify-center gap-1">
              <Shield className="w-3 h-3 text-[#FF5A00]" />
              <span>
                Listen anonymously. Attending marks today&apos;s streak as complete.
              </span>
            </p>
          </div>
        </section>

        {/* Open Group Chat Header */}
        <section aria-label="Open Community Chat" className="flex flex-col flex-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg font-bold italic text-neutral-900">
                Community Room
              </h2>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">
                24/7 Support
              </span>
            </div>
            <span className="text-[11px] text-neutral-400">
              {communityMessages.length} Messages
            </span>
          </div>

          {/* Scrollable WhatsApp-style Chat Stream */}
          <div className="flex-1 rounded-2xl border border-neutral-100 bg-neutral-50/40 p-3.5 flex flex-col gap-3 min-h-[300px] max-h-[440px] overflow-y-auto no-scrollbar">
            {communityMessages.map((msg) => {
              const isMe = msg.isSelf;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    isMe ? "items-end" : "items-start"
                  }`}
                >
                  {/* Sender identity */}
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px]">
                    <span
                      className={`font-semibold ${
                        isMe ? "text-[#FF5A00]" : "text-neutral-700"
                      }`}
                    >
                      {msg.sender}
                    </span>
                    <span className="text-neutral-400">•</span>
                    <span className="rounded bg-orange-100/70 px-1 py-0.2 text-[9px] font-bold text-[#FF5A00]">
                      Day {msg.dayCount}
                    </span>
                    <span className="text-[10px] text-neutral-400 ml-1">
                      {msg.time}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs font-sans leading-relaxed max-w-[88%] ${
                      isMe
                        ? "bg-[#FF5A00] text-white rounded-tr-sm"
                        : "bg-white text-neutral-800 border border-neutral-200/80 rounded-tl-sm shadow-xs"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="mt-3 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Share your story or encouragement..."
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
        </section>
      </main>

      {/* Simulated Live Audio Call Modal */}
      {activeAudioMeeting && <LiveAudioModal />}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
