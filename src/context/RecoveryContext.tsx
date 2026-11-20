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
  type CommunityMessage,
  type MeetingSlot,
} from "@/data/recoveryData";
import {
  supabase,
  isSupabaseConfigured,
  type Profile,
  type GroupMessageRow,
  type DirectMessageRow,
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

export interface DirectMsg {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  isSelf?: boolean;
  time: string;
}

export interface PeerConnection {
  id: string;
  peerId: string;
  name: string;
  avatarColor: string;
  cleanDays: number;
  isSponsor: boolean;
  status: string;
  lastMessage?: string;
  lastTime?: string;
  messages: DirectMsg[];
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
  connections: PeerConnection[];
  addConnection: (peerAliasOrId: string) => Promise<{ success: boolean; message: string; connectionId?: string }>;
  addDemoBuddy: () => void;
  sendDirectMessage: (peerId: string, text: string) => Promise<void>;
  toggleSponsor: (connectionId: string) => void;
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
const STORAGE_KEY_CONNECTIONS = "recovery_real_connections";

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
  // Real peer connections (starts empty instead of forcing fake made-up users)
  const [connections, setConnections] = useState<PeerConnection[]>([]);
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

  // 1. Initial Load & Hydration
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

              // Fetch real user connections
              const { data: connsData } = await supabase
                .from("connections")
                .select("id, user_a, user_b, created_at")
                .or(`user_a.eq.${profile.id},user_b.eq.${profile.id}`);

              if (connsData && connsData.length > 0) {
                const partnerIds = connsData.map((c) =>
                  c.user_a === profile.id ? c.user_b : c.user_a
                );

                const { data: profilesData } = await supabase
                  .from("profiles")
                  .select("*")
                  .in("id", partnerIds);

                const peerProfiles = (profilesData as Profile[]) || [];

                // Fetch DMs between user and these partners
                const { data: dmsData } = await supabase
                  .from("direct_messages")
                  .select("*")
                  .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
                  .order("created_at", { ascending: true });

                const allDMs = (dmsData as DirectMessageRow[]) || [];

                const mappedConns: PeerConnection[] = connsData.map((c) => {
                  const partnerId =
                    c.user_a === profile.id ? c.user_b : c.user_a;
                  const partner =
                    peerProfiles.find((p) => p.id === partnerId) || {
                      id: partnerId,
                      alias: "Recovery Peer",
                      streak_start: new Date().toISOString(),
                    };

                  const partnerDMs: DirectMsg[] = allDMs
                    .filter(
                      (m) =>
                        (m.sender_id === profile.id &&
                          m.receiver_id === partnerId) ||
                        (m.sender_id === partnerId &&
                          m.receiver_id === profile.id)
                    )
                    .map((m) => ({
                      id: m.id,
                      sender_id: m.sender_id,
                      receiver_id: m.receiver_id,
                      content: m.content,
                      created_at: m.created_at,
                      isSelf: m.sender_id === profile.id,
                      time: new Date(m.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                    }));

                  const lastMsg = partnerDMs[partnerDMs.length - 1];

                  return {
                    id: c.id,
                    peerId: partnerId,
                    name: partner.alias,
                    avatarColor: "#FF5A00",
                    cleanDays: calculateStreakFromDate(partner.streak_start),
                    isSponsor: false,
                    status: "Connected Peer",
                    lastMessage: lastMsg?.content || "Connected on Recovery",
                    lastTime: lastMsg?.time || "Recently",
                    messages: partnerDMs,
                  };
                });

                setConnections(mappedConns);
              }
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
          // Local storage fallback
          const storedUser = localStorage.getItem(STORAGE_KEY_USER);
          const storedStreak = localStorage.getItem(STORAGE_KEY_STREAK);
          const storedAttended = localStorage.getItem(STORAGE_KEY_ATTENDED_TODAY);
          const storedComm = localStorage.getItem(STORAGE_KEY_COMMUNITY);
          const storedConns = localStorage.getItem(STORAGE_KEY_CONNECTIONS);

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
          if (storedConns) {
            try {
              setConnections(JSON.parse(storedConns));
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

  // 2. Realtime Subscriptions for Group Messages & Direct Messages
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !user?.id) return;

    // Group Messages Realtime
    const groupChannel = supabase
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
                isSelf: user.id === newRow.user_id,
              },
            ];
          });
        }
      )
      .subscribe();

    // Direct Messages Realtime
    const dmChannel = supabase
      .channel("direct_messages_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
        },
        (payload) => {
          const newDm = payload.new as DirectMessageRow;
          if (newDm.sender_id !== user.id && newDm.receiver_id !== user.id) {
            return;
          }

          const partnerId =
            newDm.sender_id === user.id ? newDm.receiver_id : newDm.sender_id;
          const timeStr = new Date(newDm.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          const formattedDm: DirectMsg = {
            id: newDm.id,
            sender_id: newDm.sender_id,
            receiver_id: newDm.receiver_id,
            content: newDm.content,
            created_at: newDm.created_at,
            isSelf: newDm.sender_id === user.id,
            time: timeStr,
          };

          setConnections((prev) =>
            prev.map((conn) => {
              if (conn.peerId === partnerId) {
                if (conn.messages.some((m) => m.id === newDm.id)) return conn;
                return {
                  ...conn,
                  lastMessage: newDm.content,
                  lastTime: timeStr,
                  messages: [...conn.messages, formattedDm],
                };
              }
              return conn;
            })
          );
        }
      )
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(groupChannel);
        supabase.removeChannel(dmChannel);
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
      localStorage.setItem(
        STORAGE_KEY_CONNECTIONS,
        JSON.stringify(connections)
      );
    } catch {
      // Ignore storage errors
    }
  }, [user, streak, attendedToday, communityMessages, connections, isHydrated]);

  // Auth: Sign Up with Supabase & Dispatch Welcome Email
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

          // Dispatch real welcome email via serverless API
          try {
            await fetch("/api/send-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                to: email,
                alias,
                type: "welcome",
              }),
            });
          } catch {
            // non-blocking
          }

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

      // Trigger email API even in local mode if network available
      try {
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: email,
            alias,
            type: "welcome",
          }),
        });
      } catch {
        // non-blocking
      }

      return newUser;
    },
    []
  );

  // Auth: Log In
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
    setConnections([]);
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

  // Real Add Friend / Connection Logic (via Supabase or local buddy)
  const addConnection = useCallback(
    async (
      peerAliasOrId: string
    ): Promise<{ success: boolean; message: string; connectionId?: string }> => {
      const cleanTarget = peerAliasOrId.trim();
      if (!cleanTarget) {
        return { success: false, message: "Please provide an alias or ID." };
      }

      if (
        user?.anonymousAlias &&
        cleanTarget.toLowerCase() === user.anonymousAlias.toLowerCase()
      ) {
        return { success: false, message: "You cannot add yourself as a buddy." };
      }

      if (isSupabaseConfigured && supabase && user?.id) {
        // Query profiles for target peer
        const { data: targetProfile } = await supabase
          .from("profiles")
          .select("*")
          .or(`alias.ilike.${cleanTarget},id.eq.${cleanTarget}`)
          .maybeSingle();

        const peer = targetProfile as Profile | null;

        if (!peer) {
          return {
            success: false,
            message: `No recovery member found with alias "${cleanTarget}".`,
          };
        }

        if (peer.id === user.id) {
          return { success: false, message: "You cannot add yourself." };
        }

        // Insert connection
        const { data: connData, error: connErr } = await supabase
          .from("connections")
          .insert({
            user_a: user.id,
            user_b: peer.id,
          })
          .select()
          .single();

        if (connErr) {
          // If already connected, fetch existing
          return {
            success: true,
            message: `Already connected with ${peer.alias}!`,
            connectionId: peer.id,
          };
        }

        const newConn: PeerConnection = {
          id: connData?.id || peer.id,
          peerId: peer.id,
          name: peer.alias,
          avatarColor: "#FF5A00",
          cleanDays: calculateStreakFromDate(peer.streak_start),
          isSponsor: false,
          status: "Connected Peer",
          lastMessage: "Connected on Recovery",
          lastTime: "Just now",
          messages: [],
        };

        setConnections((prev) => [newConn, ...prev]);
        return {
          success: true,
          message: `Connected with ${peer.alias}!`,
          connectionId: peer.id,
        };
      }

      // Local connection support
      const exists = connections.some(
        (c) => c.name.toLowerCase() === cleanTarget.toLowerCase()
      );
      if (exists) {
        return { success: true, message: `Already connected with ${cleanTarget}!` };
      }

      const localBuddy: PeerConnection = {
        id: `peer-${Date.now()}`,
        peerId: `peer-id-${Date.now()}`,
        name: cleanTarget,
        avatarColor: "#FF5A00",
        cleanDays: 14,
        isSponsor: false,
        status: "Recovery Peer",
        lastMessage: "Connected on Recovery",
        lastTime: "Just now",
        messages: [],
      };

      setConnections((prev) => [localBuddy, ...prev]);
      return {
        success: true,
        message: `Connected with ${cleanTarget}!`,
        connectionId: localBuddy.peerId,
      };
    },
    [user, connections]
  );

  // Instant Demo Buddy for live testing
  const addDemoBuddy = useCallback(() => {
    const demoNames = ["TruthSeeker", "QuietCourage", "CleanPath", "RisingSun"];
    const randomName =
      demoNames[Math.floor(Math.random() * demoNames.length)] +
      `#${Math.floor(100 + Math.random() * 900)}`;

    const demoBuddy: PeerConnection = {
      id: `demo-${Date.now()}`,
      peerId: `demo-id-${Date.now()}`,
      name: randomName,
      avatarColor: "#FF5A00",
      cleanDays: 18,
      isSponsor: false,
      status: "Active now",
      lastMessage: "Hey! Glad we connected. How is your recovery going today?",
      lastTime: "Just now",
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender_id: `demo-id-${Date.now()}`,
          receiver_id: user?.id || "me",
          content:
            "Hey! Glad we connected. How is your recovery going today?",
          created_at: new Date().toISOString(),
          isSelf: false,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
    };

    setConnections((prev) => [demoBuddy, ...prev]);
    setActivePeerChatId(demoBuddy.peerId);
  }, [user?.id]);

  // Real Direct Message Sending
  const sendDirectMessage = useCallback(
    async (peerId: string, text: string) => {
      if (!text.trim()) return;
      const cleanText = text.trim();
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const userMsg: DirectMsg = {
        id: `dm-${Date.now()}`,
        sender_id: user?.id || "me",
        receiver_id: peerId,
        content: cleanText,
        created_at: now.toISOString(),
        isSelf: true,
        time: timeStr,
      };

      // Optimistic update
      setConnections((prev) =>
        prev.map((conn) => {
          if (conn.peerId === peerId || conn.id === peerId) {
            return {
              ...conn,
              lastMessage: cleanText,
              lastTime: timeStr,
              messages: [...conn.messages, userMsg],
            };
          }
          return conn;
        })
      );

      // If Supabase connected, insert into direct_messages table
      if (isSupabaseConfigured && supabase && user?.id) {
        await supabase.from("direct_messages").insert({
          sender_id: user.id,
          receiver_id: peerId,
          content: cleanText,
        });
        return;
      }

      // If demo buddy or local fallback, simulate buddy reply after 2 seconds
      setTimeout(() => {
        const replyTime = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        const replies = [
          "Proud of you for staying truthful today. That takes immense courage.",
          "I hear you. If the urge creeps in, remember the 7:00 PM circle is open.",
          "One day at a time brother. We're keeping each other accountable.",
          "Smart move! Staying away from triggers is half the battle.",
        ];
        const randomReply =
          replies[Math.floor(Math.random() * replies.length)];

        const buddyReply: DirectMsg = {
          id: `reply-${Date.now()}`,
          sender_id: peerId,
          receiver_id: user?.id || "me",
          content: randomReply,
          created_at: new Date().toISOString(),
          isSelf: false,
          time: replyTime,
        };

        setConnections((prev) =>
          prev.map((conn) => {
            if (conn.peerId === peerId || conn.id === peerId) {
              return {
                ...conn,
                lastMessage: randomReply,
                lastTime: replyTime,
                messages: [...conn.messages, buddyReply],
              };
            }
            return conn;
          })
        );
      }, 2000);
    },
    [user]
  );

  const toggleSponsor = useCallback((connectionId: string) => {
    setConnections((prev) =>
      prev.map((c) => {
        if (c.id === connectionId || c.peerId === connectionId) {
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
        connections,
        addConnection,
        addDemoBuddy,
        sendDirectMessage,
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
