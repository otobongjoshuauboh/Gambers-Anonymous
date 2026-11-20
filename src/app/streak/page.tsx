"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Heart,
} from "lucide-react";
import { useRecovery } from "@/context/RecoveryContext";
import BottomNav from "@/components/BottomNav";

export default function StreakPage() {
  const { streak, attendedToday, weekRecords, resetStreak, streakBanner, dismissStreakBanner } =
    useRecovery();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <main className="flex-1 max-w-md mx-auto w-full px-5 pt-[max(1.75rem,env(safe-area-inset-top))] pb-28 flex flex-col">
        {/* Screen Header */}
        <header className="mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Accountability &amp; Growth
          </span>
          <h1 className="font-serif text-3xl font-bold italic text-[#FF5A00] tracking-[-0.01em] mt-0.5">
            Your Streak
          </h1>
          <p className="text-xs font-sans text-neutral-500 mt-0.5">
            Tracking every single day you stayed truthful to yourself.
          </p>
        </header>

        {/* Streak Completion Banner */}
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

        {/* Big Hero Streak Counter */}
        <section
          aria-label="Current Recovery Streak"
          className="my-3 flex flex-col items-center justify-center rounded-3xl border border-neutral-200 bg-white p-7 text-center shadow-xs"
        >
          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 border border-orange-100 text-[#FF5A00]">
            <Flame className="w-9 h-9 fill-[#FF5A00] text-[#FF5A00] animate-pulse" />
          </div>

          <h2 className="font-serif text-[3.25rem] leading-none font-bold italic text-[#FF5A00] tracking-tight">
            {streak} {streak === 1 ? "Day" : "Days"}
          </h2>

          <p className="mt-2 font-serif text-base italic text-neutral-600">
            Clean, truthful, and in control.
          </p>

          <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-orange-100/70 px-3 py-1 text-xs font-semibold text-[#FF5A00]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next Milestone: 7 Days (1 Week)</span>
          </span>
        </section>

        {/* Today's Status Card */}
        <section
          aria-label="Today's Meeting Status"
          className="my-4 rounded-3xl border border-neutral-200 bg-white p-5 shadow-xs"
        >
          {attendedToday ? (
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FF5A00] text-white">
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-serif text-lg font-bold italic text-[#FF5A00]">
                  Today&apos;s meeting completed ✓
                </h3>
                <p className="text-xs font-sans text-neutral-500 mt-1 leading-relaxed">
                  You showed up for yourself today. Your recovery streak is safe
                  and locked in until tomorrow.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-[#FF5A00] border border-orange-100">
                  <Clock className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-serif text-lg font-bold italic text-neutral-900">
                    Today&apos;s meeting not yet attended
                  </h3>
                  <p className="text-xs font-sans text-neutral-500 mt-1 leading-relaxed">
                    Join any daily live call (7:00 PM GMT, EST, or SGT) to lock
                    in today&apos;s recovery streak.
                  </p>
                </div>
              </div>

              <Link
                href="/meetings"
                className="flex items-center justify-center gap-2 rounded-full bg-[#FF5A00] py-3 px-6 font-serif text-base font-bold italic text-white transition-all hover:opacity-90 active:scale-98"
              >
                <span>Go to Meetings</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>
          )}
        </section>

        {/* 7-Day Horizontal Tracker (Mon–Sun) */}
        <section
          aria-label="Weekly Attendance Tracker"
          className="my-3 rounded-3xl border border-neutral-200 bg-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-base font-bold italic text-neutral-900">
              7-Day Meeting Attendance
            </h3>
            <span className="text-[11px] font-sans text-neutral-400">
              Mon — Sun
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center">
            {weekRecords.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5">
                <span
                  className={`text-[11px] font-semibold ${
                    item.isToday ? "text-[#FF5A00]" : "text-neutral-400"
                  }`}
                >
                  {item.short}
                </span>

                {item.attended ? (
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FF5A00] text-white shadow-xs"
                    title={`${item.label}: Attended`}
                  >
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  </div>
                ) : (
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                      item.isToday
                        ? "border-[#FF5A00] text-[#FF5A00] bg-orange-50/50"
                        : "border-neutral-200 text-neutral-300"
                    }`}
                    title={`${item.label}: ${
                      item.isToday ? "Today (Pending)" : "Not attended"
                    }`}
                  >
                    <span className="text-xs font-bold">•</span>
                  </div>
                )}

                {item.isToday && (
                  <span className="text-[9px] font-bold text-[#FF5A00] uppercase tracking-wide">
                    Today
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Honest Recovery Compassionate Note */}
        <section className="mt-4 mb-6 rounded-2xl border border-orange-100 bg-orange-50/30 p-4 text-center">
          <Heart className="w-4 h-4 text-[#FF5A00] mx-auto mb-1.5 opacity-80" />
          <p className="font-serif text-xs leading-relaxed italic text-[#FF5A00]">
            &ldquo;Every day you don&apos;t place a bet is an immense victory.
            It is not about perfection—it is about staying truthful with
            yourself today.&rdquo;
          </p>
        </section>

        {/* Honest Reset Streak Option */}
        <div className="mt-auto pt-2 flex flex-col items-center">
          {!showResetConfirm ? (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 text-xs font-sans text-neutral-400 hover:text-neutral-600 transition-colors py-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Had a slip? Reset streak with honesty</span>
            </button>
          ) : (
            <div className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-center">
              <p className="font-serif text-xs font-bold italic text-neutral-800">
                Facing a slip with honesty is courage, not failure.
              </p>
              <p className="text-[11px] font-sans text-neutral-500 mt-1">
                Coming back and restarting is always better than quitting on
                yourself.
              </p>
              <div className="mt-3 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetStreak();
                    setShowResetConfirm(false);
                  }}
                  className="rounded-full bg-neutral-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 cursor-pointer"
                >
                  Confirm Reset to Day 1
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="rounded-full border border-neutral-300 px-4 py-1.5 text-xs font-semibold text-neutral-600 hover:bg-white cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
