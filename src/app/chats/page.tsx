"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Award,
  ShieldCheck,
  ChevronRight,
  UserPlus,
  Share2,
  Check,
  Copy,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { useRecovery } from "@/context/RecoveryContext";
import BottomNav from "@/components/BottomNav";

function ChatsContent() {
  const searchParams = useSearchParams();
  const connectParam = searchParams.get("connect");

  const {
    user,
    connections,
    addConnection,
    addDemoBuddy,
    sendDirectMessage,
    toggleSponsor,
    activePeerChatId,
    setActivePeerChatId,
  } = useRecovery();

  const [inputMessage, setInputMessage] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetAlias, setTargetAlias] = useState("");
  const [addFeedback, setAddFeedback] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-connect if query param ?connect=alias exists
  useEffect(() => {
    if (connectParam && connectParam.trim()) {
      addConnection(connectParam.trim()).then((res) => {
        if (res.connectionId) {
          setActivePeerChatId(res.connectionId);
        }
      });
    }
  }, [connectParam, addConnection, setActivePeerChatId]);

  const selectedConnection = connections.find(
    (c) => c.peerId === activePeerChatId || c.id === activePeerChatId
  );

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConnection?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedConnection) return;
    const text = inputMessage.trim();
    setInputMessage("");
    await sendDirectMessage(selectedConnection.peerId, text);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAlias.trim()) return;
    setIsSubmitting(true);
    setAddFeedback(null);

    const result = await addConnection(targetAlias.trim());
    setIsSubmitting(false);

    if (result.success) {
      setTargetAlias("");
      setShowAddModal(false);
      if (result.connectionId) {
        setActivePeerChatId(result.connectionId);
      }
    } else {
      setAddFeedback(result.message);
    }
  };

  const handleCopyInviteLink = () => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://recovery-pwa-lovat.vercel.app";
    const myCode = user?.anonymousAlias || "RecoveryBuddy";
    const link = `${origin}/chats?connect=${encodeURIComponent(myCode)}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <main className="flex-1 max-w-md mx-auto w-full px-5 pt-[max(1.75rem,env(safe-area-inset-top))] pb-28 flex flex-col">
        {selectedConnection ? (
          /* Dedicated 1-on-1 Chat Thread View */
          <div className="flex flex-1 flex-col h-full">
            {/* Thread Header */}
            <header className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActivePeerChatId(null)}
                  className="rounded-full p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors cursor-pointer"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="relative">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-white font-serif font-bold text-sm"
                    style={{ backgroundColor: selectedConnection.avatarColor }}
                  >
                    {selectedConnection.name[0]}
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <h2 className="font-serif text-base font-bold italic text-neutral-900">
                      {selectedConnection.name}
                    </h2>
                    <span className="rounded bg-orange-100/80 px-1.5 py-0.2 text-[10px] font-bold text-[#FF5A00]">
                      Day {selectedConnection.cleanDays}
                    </span>
                  </div>
                  <span className="text-[11px] font-sans text-neutral-400">
                    {selectedConnection.status}
                  </span>
                </div>
              </div>

              {/* Sponsor Toggle Button */}
              <button
                type="button"
                onClick={() => toggleSponsor(selectedConnection.id)}
                className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  selectedConnection.isSponsor
                    ? "bg-[#FF5A00] text-white shadow-xs"
                    : "border border-neutral-200 text-neutral-600 hover:border-[#FF5A00] hover:text-[#FF5A00]"
                }`}
                title="Toggle Sponsor status for this peer"
              >
                <Award className="w-3.5 h-3.5" />
                <span>
                  {selectedConnection.isSponsor ? "Sponsor ✓" : "Make Sponsor"}
                </span>
              </button>
            </header>

            {/* Direct Message Reminders */}
            <div className="mb-3 rounded-xl bg-orange-50/40 p-2.5 text-center border border-orange-100/60">
              <p className="text-[11px] text-[#FF5A00] font-sans font-medium">
                Encrypted 1-on-1 private check-in. What you say here is confidential.
              </p>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-3 min-h-[320px] max-h-[500px] p-1">
              {selectedConnection.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center text-neutral-400">
                  <MessageCircle className="w-8 h-8 text-neutral-300 mb-2" />
                  <p className="font-serif text-sm italic text-neutral-600">
                    No messages yet with {selectedConnection.name}.
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Send a check-in to break the ice and start keeping each other accountable.
                  </p>
                </div>
              ) : (
                selectedConnection.messages.map((msg) => {
                  const isMe = msg.isSelf;
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
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-neutral-400 mt-1 px-1">
                        {msg.time}
                      </span>
                    </div>
                  );
                })
              )}
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
                placeholder={`Message ${selectedConnection.name}...`}
                className="flex-1 rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-xs font-sans text-neutral-800 placeholder-neutral-400 focus:border-[#FF5A00] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#FF5A00] text-white transition-opacity disabled:opacity-40 hover:opacity-90"
                aria-label="Send direct message"
              >
                <Send className="w-4 h-4 stroke-[2.2]" />
              </button>
            </form>
          </div>
        ) : (
          /* Main 1-on-1 Chats List View */
          <div className="flex flex-col flex-1">
            {/* Screen Header */}
            <header className="flex items-start justify-between mb-5">
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Accountability Network
                </span>
                <h1 className="font-serif text-3xl font-bold italic text-[#FF5A00] tracking-[-0.01em] mt-0.5">
                  Personal Chats
                </h1>
                <p className="text-xs font-sans text-neutral-500 mt-0.5">
                  1-on-1 check-ins with your recovery partners.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1 rounded-full bg-[#FF5A00] text-white px-3.5 py-1.5 text-xs font-serif font-bold italic shadow-xs hover:opacity-90 active:scale-95 transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add Buddy</span>
              </button>
            </header>

            {/* If user has no connections yet: Empty state with quick connect tools */}
            {connections.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border border-neutral-200 bg-orange-50/20 p-6 text-center my-auto">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#FF5A00] border border-orange-100 shadow-xs mb-3">
                  <UserPlus className="w-6 h-6 stroke-[2]" />
                </div>
                <h2 className="font-serif text-lg font-bold italic text-neutral-900">
                  No recovery buddies yet
                </h2>
                <p className="text-xs font-sans text-neutral-500 mt-1 leading-relaxed max-w-xs">
                  Having an accountability partner reduces relapse by over 60%.
                  Connect with a friend or add someone from group meetings.
                </p>

                <div className="mt-5 flex flex-col w-full gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#FF5A00] py-3 px-6 font-serif text-sm font-bold italic text-white shadow-xs hover:opacity-90 active:scale-98 transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Connect by Anonymous Alias</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyInviteLink}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white py-2.5 px-6 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-all"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">
                          Invite Link Copied!
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy My Anonymous Invite Link</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Instant Demo Buddy for live testing */}
                <div className="mt-5 pt-4 border-t border-orange-100/80 w-full">
                  <button
                    type="button"
                    onClick={addDemoBuddy}
                    className="text-xs font-sans text-[#FF5A00] font-medium hover:underline flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Want to test right now? Connect with a Test Buddy</span>
                  </button>
                </div>
              </div>
            ) : (
              /* List of Real Connections */
              <div className="flex flex-col gap-2.5">
                {connections.map((chat) => (
                  <button
                    key={chat.id}
                    type="button"
                    onClick={() => setActivePeerChatId(chat.peerId)}
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
                            {chat.lastTime}
                          </span>
                        </div>

                        <p className="truncate text-xs font-sans text-neutral-500">
                          {chat.lastMessage || "Connected on Recovery"}
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-neutral-300 shrink-0" />
                  </button>
                ))}

                {/* Share Link Reminder */}
                <div className="mt-4 rounded-2xl border border-neutral-100 bg-neutral-50/60 p-3 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-neutral-800">
                      Invite a Friend
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      Share your anonymous recovery link
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyInviteLink}
                    className="flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:border-[#FF5A00] transition-colors cursor-pointer"
                  >
                    {copiedLink ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5 text-[#FF5A00]" />
                    )}
                    <span>{copiedLink ? "Copied" : "Share"}</span>
                  </button>
                </div>
              </div>
            )}

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

      {/* Add Buddy Modal */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-neutral-100 flex flex-col">
            <h2 className="font-serif text-lg font-bold italic text-[#FF5A00]">
              Add Recovery Buddy
            </h2>
            <p className="text-xs font-sans text-neutral-500 mt-1">
              Enter your peer&apos;s public Anonymous Alias to connect directly.
            </p>

            {addFeedback && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-600">
                {addFeedback}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="mt-4 flex flex-col gap-3">
              <input
                type="text"
                required
                value={targetAlias}
                onChange={(e) => setTargetAlias(e.target.value)}
                placeholder="e.g. QuietCourage or User ID"
                className="rounded-2xl border border-neutral-200 bg-white px-4 py-2.5 text-xs font-sans text-neutral-800 placeholder-neutral-400 focus:border-[#FF5A00] focus:outline-none"
              />

              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setAddFeedback(null);
                  }}
                  className="flex-1 rounded-full border border-neutral-200 py-2.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !targetAlias.trim()}
                  className="flex-1 rounded-full bg-[#FF5A00] py-2.5 text-xs font-serif font-bold italic text-white hover:opacity-90 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Searching..." : "Connect"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

export default function ChatsPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-white" />}>
      <ChatsContent />
    </Suspense>
  );
}
