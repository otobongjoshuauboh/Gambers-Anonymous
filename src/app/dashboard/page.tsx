"use client";

import Link from "next/link";
import {
  Users,
  MessageSquare,
  Flame,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
  HeartHandshake,
  User,
  Bell,
  Mail,
} from "lucide-react";
import { useRecovery } from "@/context/RecoveryContext";
import BottomNav from "@/components/BottomNav";

export default function DashboardPage() {
  const { user, streak, attendedToday, streakBanner, dismissStreakBanner } =
    useRecovery();

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <main className="flex-1 max-w-md mx-auto w-full px-5 pt-[max(1.75rem,env(safe-area-inset-top))] pb-28 flex flex-col">
        {/* Top Header */}
        <header className="flex items-start justify-between mb-5">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Anonymous Recovery Space
            </span>
            <h1 className="font-serif text-3xl font-bold italic text-[#FF5A00] tracking-[-0.01em] mt-0.5">
              {user ? `Welcome, ${user.anonymousAlias}` : "Welcome back"}
            </h1>
            <p className="text-sm font-sans text-neutral-500 mt-0.5">
              One honest day at a time.
            </p>
          </div>

          {/* Top Right Actions: Streak Badge + Account Icon */}
          <div className="flex items-center gap-2">
            <Link
              href="/streak"
              className="group flex items-center gap-1.5 rounded-full border border-[#FF5A00]/30 bg-[#FF5A00]/5 px-3 py-1.5 transition-all hover:bg-[#FF5A00]/10"
              aria-label={`View your ${streak} day recovery streak`}
            >
              <Flame className="w-4 h-4 text-[#FF5A00] fill-[#FF5A00]" />
              <span className="font-serif text-sm font-bold italic text-[#FF5A00]">
                {streak}d
              </span>
            </Link>

            <Link
              href="/account"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 hover:border-[#FF5A00] hover:text-[#FF5A00] transition-colors"
              aria-label="Account and notification settings"
              title="Account & Notifications"
            >
              <User className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Streak Completion Banner (if active) */}
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

        {/* Unregistered Guest Notice or Active Notification Status */}
        {!user ? (
          <div className="mb-6 rounded-2xl border border-orange-200/80 bg-orange-50/40 p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#FF5A00]" />
                <h2 className="font-serif text-sm font-bold italic text-neutral-900">
                  Protect Your Streak &amp; Get Reminders
                </h2>
              </div>
              <span className="rounded-full bg-orange-100 px-2 py-0.2 text-[9px] font-bold text-[#FF5A00]">
                100% Private
              </span>
            </div>
            <p className="text-[11px] font-sans text-neutral-500 leading-snug">
              Sign up with your email to receive daily morning encouragement and
              reminders 15 minutes before 7:00 PM calls start. Never shown to
              peers.
            </p>
            <Link
              href="/signup"
              className="mt-1 inline-flex items-center gap-1 text-xs font-serif font-bold italic text-[#FF5A00] hover:underline"
            >
              <span>Set up private reminders</span>
              <span>→</span>
            </Link>
          </div>
        ) : (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-neutral-100 bg-neutral-50/60 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#FF5A00]" />
              <span className="text-xs font-sans text-neutral-600">
                Reminders active:{" "}
                <span className="font-medium text-neutral-900">
                  {user.dailyEncouragementEmail && user.meetingRemindersEmail
                    ? "Daily reflections & 7 PM calls"
                    : user.dailyEncouragementEmail
                    ? "Daily morning reflections"
                    : user.meetingRemindersEmail
                    ? "7:00 PM call reminders"
                    : "Notifications paused"}
                </span>
              </span>
            </div>
            <Link
              href="/account"
              className="text-[11px] font-serif font-bold italic text-[#FF5A00] hover:underline"
            >
              Edit
            </Link>
          </div>
        )}

        {/* Today's Quick Status Pill */}
        <div className="mb-7 flex items-center justify-between rounded-2xl border border-neutral-100 bg-neutral-50/70 p-3.5">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                attendedToday
                  ? "bg-[#FF5A00] text-white"
                  : "bg-neutral-200 text-neutral-600"
              }`}
            >
              {attendedToday ? (
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <Flame className="w-4 h-4 text-neutral-500" />
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-800">
                {attendedToday
                  ? "Today's check-in locked in"
                  : "Today's meeting pending"}
              </p>
              <p className="text-[11px] text-neutral-500">
                {attendedToday
                  ? "Your streak is protected until tomorrow."
                  : "Join a 7:00 PM circle to keep streak alive."}
              </p>
            </div>
          </div>
          <Link
            href={attendedToday ? "/streak" : "/meetings"}
            className="text-xs font-serif font-bold italic text-[#FF5A00] hover:underline"
          >
            {attendedToday ? "View" : "Join"} →
          </Link>
        </div>

        {/* Main Navigation Hub: 3 Large Minimalist Action Tiles */}
        <section
          aria-label="Core Recovery Hub"
          className="flex flex-col gap-3.5 mb-8"
        >
          {/* Tile 1: Group Meetings */}
          <Link
            href="/meetings"
            className="group relative flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5 transition-all duration-200 hover:border-[#FF5A00]/50 hover:bg-orange-50/20 active:scale-[0.99]"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF5A00] border border-orange-100 transition-colors group-hover:bg-[#FF5A00] group-hover:text-white">
                <Users className="w-6 h-6 stroke-[2]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-lg font-bold italic text-neutral-900 group-hover:text-[#FF5A00] transition-colors">
                    Group Meetings
                  </h2>
                  <span className="rounded-full bg-orange-100/70 px-2 py-0.5 text-[10px] font-semibold text-[#FF5A00]">
                    Live Calls
                  </span>
                </div>
                <p className="text-xs font-sans text-neutral-500 mt-1 leading-relaxed">
                  Open community chat &amp; daily live calls
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#FF5A00] shrink-0" />
          </Link>

          {/* Tile 2: Personal Chats */}
          <Link
            href="/chats"
            className="group relative flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5 transition-all duration-200 hover:border-[#FF5A00]/50 hover:bg-orange-50/20 active:scale-[0.99]"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF5A00] border border-orange-100 transition-colors group-hover:bg-[#FF5A00] group-hover:text-white">
                <MessageSquare className="w-6 h-6 stroke-[2]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-lg font-bold italic text-neutral-900 group-hover:text-[#FF5A00] transition-colors">
                    Personal Chats
                  </h2>
                  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-600">
                    3 Peers
                  </span>
                </div>
                <p className="text-xs font-sans text-neutral-500 mt-1 leading-relaxed">
                  1-on-1 check-ins and sponsors
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#FF5A00] shrink-0" />
          </Link>

          {/* Tile 3: Your Streak */}
          <Link
            href="/streak"
            className="group relative flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5 transition-all duration-200 hover:border-[#FF5A00]/50 hover:bg-orange-50/20 active:scale-[0.99]"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF5A00] border border-orange-100 transition-colors group-hover:bg-[#FF5A00] group-hover:text-white">
                <Flame className="w-6 h-6 stroke-[2]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-lg font-bold italic text-neutral-900 group-hover:text-[#FF5A00] transition-colors">
                    Your Streak
                  </h2>
                  <span className="rounded-full bg-[#FF5A00]/10 px-2 py-0.5 text-[10px] font-bold text-[#FF5A00]">
                    {streak} Days Clean
                  </span>
                </div>
                <p className="text-xs font-sans text-neutral-500 mt-1 leading-relaxed">
                  Attend a daily meeting to keep your streak alive
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#FF5A00] shrink-0" />
          </Link>
        </section>

        {/* Daily Emotional Reflection */}
        <section className="mt-auto mb-6 rounded-2xl border border-orange-100 bg-orange-50/40 p-5 text-center">
          <HeartHandshake className="w-5 h-5 text-[#FF5A00] mx-auto mb-2 opacity-80" />
          <p className="font-serif text-[1.05rem] leading-snug font-bold italic text-[#FF5A00]">
            &ldquo;We are humans and we all fail at some point, but coming back
            and working harder is better than quitting on yourself.&rdquo;
          </p>
          <span className="block mt-2 font-sans text-[11px] text-neutral-400">
            Daily Grounding Thought
          </span>
        </section>

        {/* Discrete Anonymous Assurance & Account Link */}
        <footer className="flex items-center justify-between pt-2 text-xs text-neutral-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF5A00]" />
            <span>100% Anonymous Recovery Space</span>
          </div>
          <Link
            href="/account"
            className="hover:text-neutral-600 transition-colors font-serif italic"
          >
            Account Settings
          </Link>
        </footer>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
