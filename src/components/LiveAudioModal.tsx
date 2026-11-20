"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, PhoneOff, Check, Radio } from "lucide-react";
import { useRecovery } from "@/context/RecoveryContext";

interface LiveAudioModalProps {
  onClose?: () => void;
}

export default function LiveAudioModal({ onClose }: LiveAudioModalProps) {
  const { user, activeAudioMeeting, completeMeeting, closeAudioMeeting } =
    useRecovery();
  const [isMuted, setIsMuted] = useState(true);

  if (!activeAudioMeeting) return null;

  const handleCompleteAndLeave = () => {
    completeMeeting(activeAudioMeeting.id);
    if (onClose) onClose();
  };

  const handleSimpleLeave = () => {
    closeAudioMeeting();
    if (onClose) onClose();
  };

  const peers = [
    {
      name: "Circle Host",
      tag: "Facilitator",
      isSpeaking: true,
      color: "#FF5A00",
      days: "Speaking",
    },
    {
      name: "Anonymous #218",
      tag: "Peer",
      isSpeaking: false,
      color: "#EA580C",
      days: "Listening",
    },
    {
      name: "Anonymous #509",
      tag: "Peer",
      isSpeaking: false,
      color: "#C2410C",
      days: "Listening",
    },
    {
      name: "Anonymous #741",
      tag: "Peer",
      isSpeaking: false,
      color: "#F97316",
      days: "Listening",
    },
    {
      name: "Anonymous #312",
      tag: "Peer",
      isSpeaking: false,
      color: "#A3A3A3",
      days: "Listening",
    },
    {
      name: user?.anonymousAlias || "You",
      tag: "Member",
      isSpeaking: !isMuted,
      color: "#FF5A00",
      isSelf: true,
      days: "You",
    },
  ];

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Daily Live Audio Room"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-none p-3 sm:p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="relative flex h-full max-h-[640px] w-full max-w-md flex-col justify-between rounded-3xl bg-white p-6 shadow-2xl border border-neutral-100"
        >
          {/* Top Info Bar */}
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-[#FF5A00] animate-pulse" />
                <span className="text-xs font-semibold tracking-wider uppercase text-[#FF5A00]">
                  Live Circle
                </span>
                <span className="text-xs text-neutral-400">•</span>
                <span className="text-xs font-medium text-neutral-500">
                  {activeAudioMeeting.timeLabel}
                </span>
              </div>
              <h2 className="font-serif text-lg font-bold italic text-neutral-900 mt-0.5">
                {activeAudioMeeting.topic}
              </h2>
            </div>
            <button
              onClick={handleSimpleLeave}
              type="button"
              className="rounded-full p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 transition-colors"
              aria-label="Exit call"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>

          {/* Anonymous Grounding Notice */}
          <div className="my-2 rounded-2xl bg-orange-50/60 p-3 text-center border border-orange-100/60">
            <p className="font-serif text-xs italic text-[#FF5A00]">
              &ldquo;What is shared in this circle stays in this circle. Listen
              with honesty, speak without judgment.&rdquo;
            </p>
          </div>

          {/* Peer Grid */}
          <div className="grid grid-cols-3 gap-3 my-auto py-2">
            {peers.map((peer) => (
              <div
                key={peer.name}
                className="flex flex-col items-center justify-center p-2 rounded-2xl border border-neutral-100 bg-white transition-all"
              >
                <div className="relative mb-2">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full text-white font-serif font-bold text-lg shadow-sm transition-transform duration-300 ${
                      peer.isSpeaking
                        ? "ring-4 ring-[#FF5A00]/40 scale-105"
                        : "ring-1 ring-neutral-200"
                    }`}
                    style={{ backgroundColor: peer.color }}
                  >
                    {peer.name[0]}
                  </div>

                  {peer.isSpeaking ? (
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5A00] text-white">
                      <Radio className="w-3 h-3 animate-spin" />
                    </span>
                  ) : (
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-200 text-neutral-600">
                      <MicOff className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <span className="text-xs font-semibold text-neutral-800 text-center truncate max-w-[85px]">
                  {peer.name}
                </span>
                <span className="text-[10px] text-neutral-400">
                  {peer.days || peer.tag}
                </span>
              </div>
            ))}
          </div>

          {/* Controls Bottom Area */}
          <div className="flex flex-col gap-3 pt-4 border-t border-neutral-100">
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setIsMuted((prev) => !prev)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  isMuted
                    ? "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                    : "bg-[#FF5A00]/10 text-[#FF5A00] border border-[#FF5A00]/40"
                }`}
              >
                {isMuted ? (
                  <>
                    <MicOff className="w-4 h-4 text-neutral-500" />
                    <span>Muted (Tap to speak)</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 text-[#FF5A00]" />
                    <span className="font-bold text-[#FF5A00]">
                      Microphone On
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Complete & Leave button */}
            <button
              type="button"
              onClick={handleCompleteAndLeave}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#FF5A00] py-3.5 px-6 font-serif text-base font-bold italic tracking-wide text-white shadow-sm transition-all hover:opacity-90 active:scale-98"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>Complete &amp; Leave Meeting</span>
            </button>

            <button
              type="button"
              onClick={handleSimpleLeave}
              className="text-center font-sans text-xs text-neutral-400 hover:text-neutral-600 transition-colors py-1 cursor-pointer"
            >
              Leave without claiming streak
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
