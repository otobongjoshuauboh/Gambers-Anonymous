"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Mail,
  User,
  Bell,
  Lock,
  LogOut,
  Smartphone,
  Eye,
  X,
} from "lucide-react";
import { useRecovery } from "@/context/RecoveryContext";
import BottomNav from "@/components/BottomNav";

export default function AccountPage() {
  const router = useRouter();
  const { user, updateNotificationPreferences, logout, isSupabaseConnected } =
    useRecovery();

  const [alias, setAlias] = useState(user?.anonymousAlias || "Anonymous Peer");
  const [aliasSaved, setAliasSaved] = useState(false);
  const [previewEmailType, setPreviewEmailType] = useState<
    "encouragement" | "meeting" | null
  >(null);

  const handleSaveAlias = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alias.trim()) return;
    updateNotificationPreferences({ anonymousAlias: alias.trim() });
    setAliasSaved(true);
    setTimeout(() => setAliasSaved(false), 2000);
  };

  const handleToggleEncouragement = () => {
    if (!user) return;
    updateNotificationPreferences({
      dailyEncouragementEmail: !user.dailyEncouragementEmail,
    });
  };

  const handleToggleMeetingReminders = () => {
    if (!user) return;
    updateNotificationPreferences({
      meetingRemindersEmail: !user.meetingRemindersEmail,
    });
  };

  const handleToggleAppPush = () => {
    if (!user) return;
    updateNotificationPreferences({
      appPushReminders: !user.appPushReminders,
    });
  };

  const handleLogout = async () => {
    await logout();
    router.push("/signup");
  };

  // Mask email for extra privacy reassurance e.g. a***x@gmail.com
  const maskEmail = (str: string) => {
    if (!str.includes("@")) return str;
    const [name, domain] = str.split("@");
    if (name.length <= 2) return `${name[0]}*@${domain}`;
    return `${name[0]}${"*".repeat(name.length - 2)}${name[name.length - 1]}@${domain}`;
  };

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <main className="flex-1 max-w-md mx-auto w-full px-5 pt-[max(1.75rem,env(safe-area-inset-top))] pb-32 flex flex-col">
        {/* Header */}
        <header className="mb-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Account &amp; Privacy
            </span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[#FF5A00]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Identity Protected</span>
            </div>
          </div>
          <h1 className="font-serif text-3xl font-bold italic text-[#FF5A00] tracking-[-0.01em] mt-0.5">
            Your Account
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`h-2 w-2 rounded-full ${
                isSupabaseConnected
                  ? "bg-emerald-500 animate-pulse"
                  : "bg-neutral-300"
              }`}
            />
            <span className="text-[11px] text-neutral-400">
              {isSupabaseConnected
                ? "Supabase Realtime Cloud Connected"
                : "Local Mode (Connect Supabase for multi-device sync)"}
            </span>
          </div>
          <p className="text-xs font-sans text-neutral-500 mt-1">
            Manage your anonymous identity and recovery notifications.
          </p>
        </header>

        {!user ? (
          /* Unregistered / Guest View */
          <div className="rounded-3xl border border-neutral-200 bg-orange-50/20 p-6 text-center my-4">
            <ShieldCheck className="w-10 h-10 text-[#FF5A00] mx-auto mb-3" />
            <h2 className="font-serif text-xl font-bold italic text-neutral-900">
              You are currently in Guest Mode
            </h2>
            <p className="text-xs font-sans text-neutral-500 mt-2 leading-relaxed">
              Your recovery streak is only stored on this browser. Link a private
              email to protect your account and receive daily encouragement &amp;
              meeting reminders.
            </p>

            <Link
              href="/signup"
              className="mt-5 inline-flex items-center justify-center rounded-full bg-[#FF5A00] py-3 px-8 font-serif text-base font-bold italic text-white shadow-sm hover:opacity-90 active:scale-98 transition-all"
            >
              Sign Up Anonymously
            </Link>
          </div>
        ) : (
          /* Logged In User Account Management */
          <div className="flex flex-col gap-5">
            {/* Anonymous Alias Section */}
            <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-[#FF5A00]" />
                <h2 className="font-serif text-base font-bold italic text-neutral-900">
                  Public Recovery Alias
                </h2>
              </div>
              <p className="text-xs text-neutral-500 mb-3">
                This is the only name shown to peers in open community chats and
                live group calls.
              </p>

              <form onSubmit={handleSaveAlias} className="flex gap-2">
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  className="flex-1 rounded-2xl border border-neutral-200 bg-white px-3.5 py-2 text-xs font-sans text-neutral-800 focus:border-[#FF5A00] focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  {aliasSaved ? "Saved ✓" : "Update"}
                </button>
              </form>
            </section>

            {/* Private Email & Zero-Exposure Guarantee */}
            <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#FF5A00]" />
                  <h2 className="font-serif text-base font-bold italic text-neutral-900">
                    Private Email
                  </h2>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-100 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Hidden from peers</span>
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-neutral-50 p-3 my-2 border border-neutral-100">
                <span className="text-xs font-mono font-medium text-neutral-700">
                  {maskEmail(user.email)}
                </span>
                <span className="text-[10px] text-neutral-400">
                  Registered Account
                </span>
              </div>

              <p className="text-[11px] text-neutral-400 mt-2 leading-relaxed">
                Your email is never shared, never displayed in community feeds,
                and never disclosed to other members.
              </p>
            </section>

            {/* Notification Reminders Preferences */}
            <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#FF5A00]" />
                  <h2 className="font-serif text-base font-bold italic text-neutral-900">
                    Recovery Reminders
                  </h2>
                </div>
                <span className="text-[10px] text-neutral-400">
                  Opt-in Only
                </span>
              </div>

              {/* Toggle 1: Daily Encouragement */}
              <div className="flex items-start justify-between py-3 border-b border-neutral-100">
                <div className="flex flex-col pr-3">
                  <span className="text-xs font-semibold text-neutral-800">
                    Daily Morning Encouragement
                  </span>
                  <span className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                    A short, honest reflection sent each morning to help ground
                    your day.
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewEmailType("encouragement")}
                    className="mt-1 text-left text-[11px] text-[#FF5A00] font-medium hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Preview sample email</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleToggleEncouragement}
                  aria-label="Toggle daily encouragement emails"
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    user.dailyEncouragementEmail
                      ? "bg-[#FF5A00]"
                      : "bg-neutral-200"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                      user.dailyEncouragementEmail
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 2: Meeting Reminders */}
              <div className="flex items-start justify-between py-3 border-b border-neutral-100">
                <div className="flex flex-col pr-3">
                  <span className="text-xs font-semibold text-neutral-800">
                    Live Meeting Reminders
                  </span>
                  <span className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                    Sent 15 minutes before daily live calls (7:00 PM GMT, EST,
                    SGT) so you can join in time.
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewEmailType("meeting")}
                    className="mt-1 text-left text-[11px] text-[#FF5A00] font-medium hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Preview sample reminder</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleToggleMeetingReminders}
                  aria-label="Toggle live meeting reminder emails"
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    user.meetingRemindersEmail
                      ? "bg-[#FF5A00]"
                      : "bg-neutral-200"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                      user.meetingRemindersEmail
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Mobile App Push Toggle / Architecture Note */}
              <div className="flex items-start justify-between pt-3">
                <div className="flex flex-col pr-3">
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-[#FF5A00]" />
                    <span className="text-xs font-semibold text-neutral-800">
                      Mobile App Push Notifications
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                    When using the native mobile app, notifications can be
                    delivered directly to your device screen. Only members who
                    subscribe to email reminders receive emails.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleToggleAppPush}
                  aria-label="Toggle mobile app push notifications"
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    user.appPushReminders ? "bg-[#FF5A00]" : "bg-neutral-200"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                      user.appPushReminders ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </section>

            {/* Logout Action */}
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-sans text-neutral-400 hover:text-red-500 transition-colors py-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log out of {user.anonymousAlias}</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Sample Email Preview Modal */}
      {previewEmailType && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-neutral-100 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF5A00]">
                Email Preview
              </span>
              <button
                type="button"
                onClick={() => setPreviewEmailType(null)}
                className="rounded-full p-1 text-neutral-400 hover:text-neutral-700"
                aria-label="Close preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {previewEmailType === "encouragement" ? (
              <div className="my-4 flex flex-col gap-2.5">
                <div className="text-[11px] text-neutral-400">
                  <span className="font-semibold text-neutral-700">From:</span>{" "}
                  Recovery Support &lt;hello@recovery.app&gt;
                  <br />
                  <span className="font-semibold text-neutral-700">Subject:</span>{" "}
                  Your Daily Recovery Strength: Day by Day
                </div>
                <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 font-sans text-xs text-neutral-800 leading-relaxed">
                  <p className="font-serif text-sm font-bold italic text-[#FF5A00] mb-2">
                    Good morning, {user?.anonymousAlias || "Friend"}
                  </p>
                  <p className="mb-2">
                    Today is an unwritten page. An urge may come, but an urge is
                    only a temporary wave—it is not an instruction.
                  </p>
                  <p className="font-serif italic text-neutral-600 mb-3">
                    &ldquo;Staying truthful to yourself about your progress is the
                    next step.&rdquo;
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    We look forward to seeing you at today&apos;s 7:00 PM circle.
                  </p>
                </div>
              </div>
            ) : (
              <div className="my-4 flex flex-col gap-2.5">
                <div className="text-[11px] text-neutral-400">
                  <span className="font-semibold text-neutral-700">From:</span>{" "}
                  Recovery Support &lt;hello@recovery.app&gt;
                  <br />
                  <span className="font-semibold text-neutral-700">Subject:</span>{" "}
                  Reminder: 7:00 PM GMT Live Circle starts in 15 minutes
                </div>
                <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 font-sans text-xs text-neutral-800 leading-relaxed">
                  <p className="font-serif text-sm font-bold italic text-[#FF5A00] mb-2">
                    Circle starts soon
                  </p>
                  <p className="mb-3">
                    The 7:00 PM GMT Daily Truth &amp; Grounding room will open in
                    15 minutes. Take a quiet breath and join anonymously.
                  </p>
                  <div className="rounded-full bg-[#FF5A00] text-white py-2 px-4 text-center font-serif text-xs font-bold italic">
                    Join Live Call
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setPreviewEmailType(null)}
              className="mt-2 rounded-full border border-neutral-200 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
