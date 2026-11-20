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

export interface UserAccount {
  email: string;
  anonymousAlias: string;
  dailyEncouragementEmail: boolean;
  meetingRemindersEmail: boolean;
  appPushReminders: boolean;
  isAuthenticated: boolean;
  createdAt: string;
}

interface DayRecord {
  label: string;
  short: string;
  attended: boolean;
  isToday: boolean;
}

interface RecoveryContextType {
  user: UserAccount | null;
  signUp: (data: {
    email: string;
    anonymousAlias: string;
    dailyEncouragementEmail: boolean;
    meetingRemindersEmail: boolean;
    appPushReminders?: boolean;
  }) => UserAccount;
  login: (email: string, alias?: string) => void;
  logout: () => void;
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
  resetStreak: () => void;
  weekRecords: DayRecord[];
  communityMessages: CommunityMessage[];
  sendCommunityMessage: (text: string) => void;
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

  // Load from localStorage asynchronously to avoid synchronous effect cascading render
  useEffect(() => {
    queueMicrotask(() => {
      try {
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
      } catch {
        // storage disabled or restricted
      } finally {
        setIsHydrated(true);
      }
    });
  }, []);

  // Sync to localStorage
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

  const signUp = useCallback(
    (data: {
      email: string;
      anonymousAlias: string;
      dailyEncouragementEmail: boolean;
      meetingRemindersEmail: boolean;
      appPushReminders?: boolean;
    }) => {
      const newUser: UserAccount = {
        email: data.email.trim().toLowerCase(),
        anonymousAlias:
          data.anonymousAlias.trim() ||
          `Anonymous #${Math.floor(100 + Math.random() * 900)}`,
        dailyEncouragementEmail: data.dailyEncouragementEmail,
        meetingRemindersEmail: data.meetingRemindersEmail,
        appPushReminders: data.appPushReminders ?? false,
        isAuthenticated: true,
        createdAt: new Date().toISOString(),
      };
      setUser(newUser);
      return newUser;
    },
    []
  );

  const login = useCallback(
    (email: string, alias?: string) => {
      const existing = user || {
        email: email.trim().toLowerCase(),
        anonymousAlias: alias || "Anonymous Peer",
        dailyEncouragementEmail: true,
        meetingRemindersEmail: true,
        appPushReminders: false,
        isAuthenticated: true,
        createdAt: new Date().toISOString(),
      };
      const updated: UserAccount = {
        ...existing,
        email: email.trim().toLowerCase(),
        isAuthenticated: true,
      };
      setUser(updated);
    },
    [user]
  );

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const updateNotificationPreferences = useCallback(
    (
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
    },
    []
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

  const resetStreak = useCallback(() => {
    setStreak(1);
    setAttendedToday(false);
    setStreakBanner("Streak reset with honesty. Recovery begins again today.");
  }, []);

  const sendCommunityMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const senderName = user?.anonymousAlias || "You";

      const newMessage: CommunityMessage = {
        id: `comm-user-${Date.now()}`,
        sender: senderName,
        dayCount: streak,
        avatarColor: "#FF5A00",
        text: text.trim(),
        time: timeStr,
        isSelf: true,
      };

      setCommunityMessages((prev) => [...prev, newMessage]);
    },
    [streak, user?.anonymousAlias]
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

      // Simulate a calm, realistic peer response after 1.8 seconds
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
