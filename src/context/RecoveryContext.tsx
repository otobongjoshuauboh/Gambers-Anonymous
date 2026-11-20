"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  DAILY_MEETINGS,
  INITIAL_COMMUNITY_MESSAGES,
  INITIAL_PEER_CHATS,
  type CommunityMessage,
  type MeetingSlot,
  type PeerChat,
} from "@/data/recoveryData";
import {
  supabase,
  isSupabaseConfigured,
  type Profile,
  type GroupMessageRow,
} from "@/lib/supabase";

export interface UserAccount {
  id?: string;
  email: string;
  anonymousAlias: string;
  dailyEncouragementEmail: boolean;
  meetingRemindersEmail: boolean;
  appPushReminders: boolean;
  isAuthenticated: boolean;
  createdAt: string;
  streak_start?: string;
}

interface DayRecord {
  label: string;
  short: string;
  attended: boolean;
  isToday: boolean;
}

interface RecoveryContextType {
  user: UserAccount | null;
  isSupabaseConnected: boolean;
  signUp: (data: {
    email: string;
    password?: string;
    anonymousAlias: string;
    dailyEncouragementEmail: boolean;
    meetingRemindersEmail: boolean;
    appPushReminders?: boolean;
  }) => Promise<UserAccount>;
  login: (email: string, password?: string, alias?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateNotificationPreferences: (
    prefs: Partial<
      Pick<
        UserAccount,
        | "dailyEncouragementEmail"
        | "meetingRemindersEmail"
        | "appPushReminders"
        | "anonymousAlias"
      >
    >
  ) => void;
  streak: number;
  attendedToday: boolean;
  streakBanner: string | null;
  dismissStreakBanner: () => void;
  completeMeeting: (meetingId?: string) => void;
  resetStreak: () => Promise<void>;
  weekRecords: DayRecord[];
  communityMessages: CommunityMessage[];
  sendCommunityMessage: (text: string) => Promise<void>;
  peerChats: PeerChat[];
  sendPersonalMessage: (chatId: string, text: string) => void;
  toggleSponsor: (chatId: string) => void;
  activeAudioMeeting: MeetingSlot | null;
  openAudioMeeting: (slot?: MeetingSlot) => void;
  closeAudioMeeting: () => void;
  activePeerChatId: string | null;
  setActivePeerChatId: (id: string | null) => void;
}

const STORAGE_KEY_USER = "recovery_user_account";
const STORAGE_KEY_STREAK = "recovery_streak_count";
const STORAGE_KEY_ATTENDED_TODAY = "recovery_attended_today";
const STORAGE_KEY_COMMUNITY = "recovery_community_messages";
const STORAGE_KEY_CHATS = "recovery_peer_chats";

const RecoveryContext = createContext<RecoveryContextType | undefined>(
  undefined
);

export function RecoveryProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [streak, setStreak] = useState<number>(4);
  const [attendedToday, setAttendedToday] = useState<boolean>(false);
  const [streakBanner, setStreakBanner] = useState<string | null>(null);
  const [communityMessages, setCommunityMessages] = useState<CommunityMessage[]>(
    INITIAL_COMMUNITY_MESSAGES
  );
  const [peerChats, setPeerChats] = useState<PeerChat[]>(INITIAL_PEER_CHATS);
  const [activeAudioMeeting, setActiveAudioMeeting] =
    useState<MeetingSlot | null>(null);
  const [activePeerChatId, setActivePeerChatId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Helper to compute streak count from a streak_start timestamp
  const calculateStreakFromDate = (streakStart: string): number => {
    try {
      const diffMs = Date.now() - new Date(streakStart).getTime();
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      return Math.max(1, days + 1);
    } catch {
      return 1;
    }
  };

  // 1. Initial Load & Hydration (from Supabase if available, else localStorage)
  useEffect(() => {
    queueMicrotask(async () => {
      try {
        if (isSupabaseConfigured && supabase) {
          // Check real Supabase Auth session
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user) {
            const { data } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .maybeSingle();

            const profile = data as Profile | null;

            if (profile) {
              const streakDays = calculateStreakFromDate(profile.streak_start);
              setStreak(streakDays);
              setUser({
                id: profile.id,
                email: profile.email,
                anonymousAlias: profile.alias,
                dailyEncouragementEmail: true,
                meetingRemindersEmail: true,
                appPushReminders: false,
                isAuthenticated: true,
                createdAt: profile.created_at,
                streak_start: profile.streak_start,
              });
            }
          }

          // Fetch real group messages from Supabase
          const { data: remoteMessages } = await supabase
            .from("group_messages")
            .select("*")
            .order("created_at", { ascending: true })
            .limit(50);

          const rows = remoteMessages as GroupMessageRow[] | null;

          if (rows && rows.length > 0) {
            const formatted: CommunityMessage[] = rows.map((row) => ({
              id: row.id,
              sender: row.alias,
              dayCount: 1,
              avatarColor: "#FF5A00",
              text: row.content,
              time: new Date(row.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              isSelf: session?.user?.id === row.user_id,
            }));
            setCommunityMessages(formatted);
          }
        } else {
          // Supabase not configured yet: load from localStorage
          const storedUser = localStorage.getItem(STORAGE_KEY_USER);
          const storedStreak = localStorage.getItem(STORAGE_KEY_STREAK);
          const storedAttended = localStorage.getItem(STORAGE_KEY_ATTENDED_TODAY);
          const storedComm = localStorage.getItem(STORAGE_KEY_COMMUNITY);
          const storedChats = localStorage.getItem(STORAGE_KEY_CHATS);

          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch {
              // fallback
            }
          }
          if (storedStreak !== null) {
            setStreak(parseInt(storedStreak, 10) || 4);
          }
          if (storedAttended !== null) {
            setAttendedToday(storedAttended === "true");
          }
          if (storedComm) {
            try {
              setCommunityMessages(JSON.parse(storedComm));
            } catch {
              // fallback
            }
          }
          if (storedChats) {
            try {
              setPeerChats(JSON.parse(storedChats));
            } catch {
              // fallback
            }
          }
        }
      } catch {
        // storage disabled or offline
      } finally {
        setIsHydrated(true);
      }
    });
  }, []);

  // 2. Realtime Subscription for Group Messages
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const channel = supabase
      .channel("group_messages_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_messages",
        },
        (payload) => {
          const newRow = payload.new as GroupMessageRow;
          const timeStr = new Date(newRow.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          setCommunityMessages((prev) => {
            // Prevent duplicate message if already added locally
            if (prev.some((m) => m.id === newRow.id)) return prev;
            return [
              ...prev,
              {
                id: newRow.id,
                sender: newRow.alias,
                dayCount: 1,
                avatarColor: "#FF5A00",
                text: newRow.content,
                time: timeStr,
                isSelf: user?.id === newRow.user_id,
              },
            ];
          });
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [user?.id]);

  // Sync state to localStorage for offline access
  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
      }
      localStorage.setItem(STORAGE_KEY_STREAK, streak.toString());
      localStorage.setItem(
        STORAGE_KEY_ATTENDED_TODAY,
        attendedToday ? "true" : "false"
      );
      localStorage.setItem(
        STORAGE_KEY_COMMUNITY,
        JSON.stringify(communityMessages)
      );
      localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(peerChats));
    } catch {
      // Ignore storage errors
    }
  }, [user, streak, attendedToday, communityMessages, peerChats, isHydrated]);

  // Auth: Sign Up with Supabase and insert Profile
  const signUp = useCallback(
    async (data: {
      email: string;
      password?: string;
      anonymousAlias: string;
      dailyEncouragementEmail: boolean;
      meetingRemindersEmail: boolean;
      appPushReminders?: boolean;
    }) => {
      const email = data.email.trim().toLowerCase();
      const alias =
        data.anonymousAlias.trim() ||
        `Anonymous #${Math.floor(100 + Math.random() * 900)}`;
      const now = new Date().toISOString();

      if (isSupabaseConfigured && supabase) {
        const password = data.password || "RecoveryPass2026!";
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError && !authData?.user) {
          throw new Error(authError.message);
        }

        const userId = authData?.user?.id;
        if (userId) {
          // Insert profile into public.profiles
          await supabase.from("profiles").upsert({
            id: userId,
            email,
            alias,
            streak_start: now,
          });

          const newUser: UserAccount = {
            id: userId,
            email,
            anonymousAlias: alias,
            dailyEncouragementEmail: data.dailyEncouragementEmail,
            meetingRemindersEmail: data.meetingRemindersEmail,
            appPushReminders: data.appPushReminders ?? false,
            isAuthenticated: true,
            createdAt: now,
            streak_start: now,
          };
          setUser(newUser);
          setStreak(1);
          return newUser;
        }
      }

      // Local storage fallback
      const newUser: UserAccount = {
        email,
        anonymousAlias: alias,
        dailyEncouragementEmail: data.dailyEncouragementEmail,
        meetingRemindersEmail: data.meetingRemindersEmail,
        appPushReminders: data.appPushReminders ?? false,
        isAuthenticated: true,
        createdAt: now,
        streak_start: now,
      };
      setUser(newUser);
      return newUser;
    },
    []
  );

  // Auth: Log In with Supabase
  const login = useCallback(
    async (email: string, password?: string, alias?: string) => {
      const cleanEmail = email.trim().toLowerCase();

      if (isSupabaseConfigured && supabase) {
        const pass = password || "RecoveryPass2026!";
        const { data: authData, error } =
          await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: pass,
          });

        if (error) {
          throw new Error(error.message);
        }

        if (authData.user) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authData.user.id)
            .maybeSingle();

          const profile = data as Profile | null;

          if (profile) {
            const streakDays = calculateStreakFromDate(profile.streak_start);
            setStreak(streakDays);
            setUser({
              id: profile.id,
              email: profile.email,
              anonymousAlias: profile.alias,
              dailyEncouragementEmail: true,
              meetingRemindersEmail: true,
              appPushReminders: false,
              isAuthenticated: true,
              createdAt: profile.created_at,
              streak_start: profile.streak_start,
            });
            return;
          }
        }
      }

      // Fallback
      const existing = user || {
        email: cleanEmail,
        anonymousAlias: alias || "Anonymous Peer",
        dailyEncouragementEmail: true,
        meetingRemindersEmail: true,
        appPushReminders: false,
        isAuthenticated: true,
        createdAt: new Date().toISOString(),
      };
      setUser({ ...existing, email: cleanEmail, isAuthenticated: true });
    },
    [user]
  );

  // Auth: Sign Out
  const logout = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  }, []);

  const updateNotificationPreferences = useCallback(
    async (
      prefs: Partial<
        Pick<
          UserAccount,
          | "dailyEncouragementEmail"
          | "meetingRemindersEmail"
          | "appPushReminders"
          | "anonymousAlias"
        >
      >
    ) => {
      setUser((prev) => (prev ? { ...prev, ...prefs } : null));

      if (isSupabaseConfigured && supabase && user?.id && prefs.anonymousAlias) {
        await supabase
          .from("profiles")
          .update({ alias: prefs.anonymousAlias })
          .eq("id", user.id);
      }
    },
    [user]
  );

  const dismissStreakBanner = useCallback(() => {
    setStreakBanner(null);
  }, []);

  const completeMeeting = useCallback(() => {
    setAttendedToday(true);
    setStreak((prev) => {
      if (attendedToday) return prev;
      return prev + 1;
    });
    setStreakBanner("Meeting completed. Today's streak is locked in.");
    setActiveAudioMeeting(null);
  }, [attendedToday]);

  const resetStreak = useCallback(async () => {
    const now = new Date().toISOString();
    setStreak(1);
    setAttendedToday(false);
    setStreakBanner("Streak reset with honesty. Recovery begins again today.");

    if (isSupabaseConfigured && supabase && user?.id) {
      await supabase
        .from("profiles")
        .update({ streak_start: now })
        .eq("id", user.id);
    }
  }, [user]);

  // Send Community Message with Supabase Database Insert
  const sendCommunityMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      const cleanText = text.trim();
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const senderName = user?.anonymousAlias || "You";

      if (isSupabaseConfigured && supabase && user?.id) {
        const { data, error } = await supabase
          .from("group_messages")
          .insert({
            user_id: user.id,
            alias: senderName,
            content: cleanText,
          })
          .select()
          .single();

        const inserted = data as GroupMessageRow | null;

        if (!error && inserted) {
          const newMsg: CommunityMessage = {
            id: inserted.id,
            sender: senderName,
            dayCount: streak,
            avatarColor: "#FF5A00",
            text: cleanText,
            time: timeStr,
            isSelf: true,
          };
          setCommunityMessages((prev) => [...prev, newMsg]);
          return;
        }
      }

      // Local fallback
      const newMessage: CommunityMessage = {
        id: `comm-user-${Date.now()}`,
        sender: senderName,
        dayCount: streak,
        avatarColor: "#FF5A00",
        text: cleanText,
        time: timeStr,
        isSelf: true,
      };

      setCommunityMessages((prev) => [...prev, newMessage]);
    },
    [streak, user]
  );

  const sendPersonalMessage = useCallback(
    (chatId: string, text: string) => {
      if (!text.trim()) return;
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const userMsg = {
        id: `msg-me-${Date.now()}`,
        sender: "me" as const,
        text: text.trim(),
        time: timeStr,
      };

      setPeerChats((prev) =>
        prev.map((c) => {
          if (c.id === chatId) {
            return {
              ...c,
              status: "Active now",
              messages: [...c.messages, userMsg],
            };
          }
          return c;
        })
      );

      // Simulate a calm peer response after 1.8 seconds
      setTimeout(() => {
        const replyTime = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        const peerReplies: Record<string, string[]> = {
          "marcus-t": [
            "Proud of you for reaching out. Staying in touch is key. Keep your head up today.",
            "I hear you. Remember why you started this journey. We are in this together.",
            "Good check in. Make sure to attend the 7 PM call tonight to ground yourself.",
          ],
          "sarah-k": [
            "Thanks for checking in! That helps me stay accountable too.",
            "We've got this! One craving at a time. It will pass.",
            "I'm keeping my phone away from betting notifications today. Let's do this together.",
          ],
          "liam-m": [
            "Appreciate the message man. Together we're much stronger than alone.",
            "Glad you messaged. Staying honest today with every single choice.",
          ],
        };

        const replies = peerReplies[chatId] || [
          "Thank you for sharing with me. Stay strong today!",
        ];
        const randomReply =
          replies[Math.floor(Math.random() * replies.length)];

        setPeerChats((currentChats) =>
          currentChats.map((c) => {
            if (c.id === chatId) {
              return {
                ...c,
                messages: [
                  ...c.messages,
                  {
                    id: `msg-peer-${Date.now()}`,
                    sender: "them" as const,
                    text: randomReply,
                    time: replyTime,
                  },
                ],
              };
            }
            return c;
          })
        );
      }, 1800);
    },
    []
  );

  const toggleSponsor = useCallback((chatId: string) => {
    setPeerChats((prev) =>
      prev.map((c) => {
        if (c.id === chatId) {
          return {
            ...c,
            isSponsor: !c.isSponsor,
          };
        }
        return c;
      })
    );
  }, []);

  const openAudioMeeting = useCallback((slot?: MeetingSlot) => {
    const target = slot || DAILY_MEETINGS[0];
    setActiveAudioMeeting(target);
  }, []);

  const closeAudioMeeting = useCallback(() => {
    setActiveAudioMeeting(null);
  }, []);

  const weekRecords: DayRecord[] = [
    { label: "Monday", short: "M", attended: true, isToday: false },
    { label: "Tuesday", short: "T", attended: true, isToday: false },
    { label: "Wednesday", short: "W", attended: true, isToday: false },
    { label: "Thursday", short: "T", attended: true, isToday: false },
    { label: "Friday", short: "F", attended: attendedToday, isToday: true },
    { label: "Saturday", short: "S", attended: false, isToday: false },
    { label: "Sunday", short: "S", attended: false, isToday: false },
  ];

  return (
    <RecoveryContext.Provider
      value={{
        user,
        isSupabaseConnected: isSupabaseConfigured,
        signUp,
        login,
        logout,
        updateNotificationPreferences,
        streak,
        attendedToday,
        streakBanner,
        dismissStreakBanner,
        completeMeeting,
        resetStreak,
        weekRecords,
        communityMessages,
        sendCommunityMessage,
        peerChats,
        sendPersonalMessage,
        toggleSponsor,
        activeAudioMeeting,
        openAudioMeeting,
        closeAudioMeeting,
        activePeerChatId,
        setActivePeerChatId,
      }}
    >
      {children}
    </RecoveryContext.Provider>
  );
}

export function useRecovery() {
  const context = useContext(RecoveryContext);
  if (!context) {
    throw new Error("useRecovery must be used within a RecoveryProvider");
  }
  return context;
}
