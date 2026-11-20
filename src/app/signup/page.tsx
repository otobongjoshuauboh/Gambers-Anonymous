"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Mail,
  User,
  Bell,
  Check,
  Lock,
  ArrowRight,
  Sparkles,
  KeyRound,
} from "lucide-react";
import { useRecovery } from "@/context/RecoveryContext";

export default function SignUpPage() {
  const router = useRouter();
  const { signUp, login, isSupabaseConnected } = useRecovery();

  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alias, setAlias] = useState("");
  const [dailyEncouragement, setDailyEncouragement] = useState(true);
  const [meetingReminders, setMeetingReminders] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Suggestions for anonymous alias
  const aliasSuggestions = [
    "CleanPath",
    "OneDayAtATime",
    "TruthSeeker",
    "QuietCourage",
    "RisingAbove",
  ];

  const handleRandomAlias = () => {
    const random =
      aliasSuggestions[Math.floor(Math.random() * aliasSuggestions.length)] +
      `#${Math.floor(100 + Math.random() * 900)}`;
    setAlias(random);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setAuthError(null);

    try {
      if (mode === "signup") {
        const finalAlias =
          alias.trim() || `Anonymous #${Math.floor(100 + Math.random() * 900)}`;
        await signUp({
          email: email.trim(),
          password: password.trim() || undefined,
          anonymousAlias: finalAlias,
          dailyEncouragementEmail: dailyEncouragement,
          meetingRemindersEmail: meetingReminders,
        });
      } else {
        await login(email.trim(), password.trim() || undefined, alias.trim());
      }

      setSubmitted(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 700);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setAuthError(err.message);
      } else {
        setAuthError("Authentication failed. Please check your credentials.");
      }
    }
  };

  const handleGuestContinue = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-dvh bg-white flex flex-col justify-between max-w-md mx-auto px-6 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] select-none">
      {/* Top Header & Skip */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#FF5A00]">
          <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
          <span>100% Anonymous</span>
        </div>

        <button
          type="button"
          onClick={handleGuestContinue}
          className="text-xs font-sans text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer py-1"
        >
          Skip to Guest Mode →
        </button>
      </div>

      <div className="flex flex-col flex-1 justify-center my-4">
        {/* Title & Reassurance */}
        <header className="mb-6">
          <h1 className="font-serif text-[2.1rem] leading-tight font-bold italic text-[#FF5A00] tracking-[-0.01em]">
            {mode === "signup" ? "Protect Your Recovery" : "Welcome Back"}
          </h1>
          <p className="mt-2 text-xs font-sans text-neutral-500 leading-relaxed">
            {mode === "signup"
              ? "Your email is strictly private and never revealed to peers. Used only to safeguard your streak and send opt-in recovery reminders."
              : "Log into your recovery account to restore your streak, personal check-ins, and meeting access."}
          </p>
        </header>

        {/* Mode Switcher Tabs */}
        <div className="mb-6 flex rounded-xl border border-neutral-200 p-1 bg-neutral-50/70">
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setAuthError(null);
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
              mode === "signup"
                ? "bg-white text-[#FF5A00] shadow-xs"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            Create Anonymous Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setAuthError(null);
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
              mode === "login"
                ? "bg-white text-[#FF5A00] shadow-xs"
                : "text-neutral-500 hover:text-neutral-800"
            }`}
          >
            Log In
          </button>
        </div>

        {/* Error notification */}
        {authError && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
            {authError}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email Input */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email-input"
              className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-[#FF5A00]" />
              <span>Private Email Address</span>
            </label>
            <input
              id="email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-sans text-neutral-800 placeholder-neutral-400 focus:border-[#FF5A00] focus:outline-none transition-colors"
            />
            <p className="text-[11px] text-neutral-400">
              Never displayed anywhere. Kept strictly confidential.
            </p>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password-input"
              className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#FF5A00]" />
              <span>Password</span>
            </label>
            <input
              id="password-input"
              type="password"
              required={isSupabaseConnected}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-sans text-neutral-800 placeholder-neutral-400 focus:border-[#FF5A00] focus:outline-none transition-colors"
            />
          </div>

          {/* Anonymous Alias (Only in Sign Up mode) */}
          {mode === "signup" && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="alias-input"
                  className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-[#FF5A00]" />
                  <span>Public Anonymous Alias</span>
                </label>
                <button
                  type="button"
                  onClick={handleRandomAlias}
                  className="text-[11px] font-sans font-medium text-[#FF5A00] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Random</span>
                </button>
              </div>
              <input
                id="alias-input"
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="e.g. QuietCourage or Alex M."
                className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-sans text-neutral-800 placeholder-neutral-400 focus:border-[#FF5A00] focus:outline-none transition-colors"
              />
              <p className="text-[11px] text-neutral-400">
                This is the only name other members will see in chats &amp;
                meetings.
              </p>
            </div>
          )}

          {/* Email Notification Preferences (Only in Sign Up mode) */}
          {mode === "signup" && (
            <div className="rounded-2xl border border-neutral-200 bg-orange-50/20 p-4 flex flex-col gap-3 my-1">
              <div className="flex items-center gap-1.5 text-neutral-900">
                <Bell className="w-4 h-4 text-[#FF5A00]" />
                <h3 className="font-serif text-sm font-bold italic text-neutral-900">
                  Recovery Reminders &amp; Support
                </h3>
              </div>

              {/* Preference 1: Daily Encouragement */}
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={dailyEncouragement}
                  onChange={(e) => setDailyEncouragement(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-[#FF5A00] accent-[#FF5A00] cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-neutral-800">
                    Daily Morning Encouragement
                  </span>
                  <span className="text-[11px] text-neutral-500 leading-snug">
                    A brief, honest reflection each morning to strengthen your
                    resolve for the next 24 hours.
                  </span>
                </div>
              </label>

              {/* Preference 2: Meeting Reminders */}
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={meetingReminders}
                  onChange={(e) => setMeetingReminders(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-[#FF5A00] accent-[#FF5A00] cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-neutral-800">
                    Live Meeting Reminders
                  </span>
                  <span className="text-[11px] text-neutral-500 leading-snug">
                    Receive an email 15 minutes before 7:00 PM calls start so you
                    never miss a circle.
                  </span>
                </div>
              </label>

              {/* App Notice */}
              <div className="mt-1 pt-2 border-t border-orange-100/70 text-[10.5px] text-neutral-400 leading-snug">
                <span>
                  📱 When using our mobile app, reminders can be delivered
                  directly in-app. Only members who subscribe to email reminders
                  will receive emails.
                </span>
              </div>
            </div>
          )}

          {/* Privacy Box */}
          <div className="rounded-xl border border-neutral-100 bg-neutral-50/70 p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-600 font-medium">
              <Lock className="w-3.5 h-3.5 text-[#FF5A00]" />
              <span>Zero Public Exposure Guarantee</span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-1">
              Your email is encrypted, never sold, and never revealed to any
              other user.
            </p>
          </div>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={submitted}
            className="mt-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#FF5A00] py-3.5 px-6 font-serif text-lg font-bold italic tracking-wide text-white shadow-sm transition-all hover:opacity-90 active:scale-98 disabled:opacity-70"
          >
            {submitted ? (
              <>
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>Account Ready...</span>
              </>
            ) : mode === "signup" ? (
              <>
                <span>Create Account &amp; Protect Streak</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            ) : (
              <>
                <span>Log In &amp; Restore Progress</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer reassurance */}
      <footer className="text-center pt-2">
        <p className="font-serif text-xs italic text-[#FF5A00]/70">
          &ldquo;Admitting you have an addiction is the first step to
          recovery.&rdquo;
        </p>
      </footer>
    </div>
  );
}
