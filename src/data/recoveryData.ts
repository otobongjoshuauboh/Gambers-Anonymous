export interface MeetingSlot {
  id: string;
  timeLabel: string;
  timeZone: string;
  region: string;
  topic: string;
  isActiveOrNext: boolean;
  participantCount: number;
}

export const DAILY_MEETINGS: MeetingSlot[] = [
  {
    id: "gmt-7pm",
    timeLabel: "7:00 PM GMT",
    timeZone: "GMT (London / UK & Europe)",
    region: "Europe & Africa",
    topic: "Daily Truth & Grounding Circle",
    isActiveOrNext: true,
    participantCount: 18,
  },
  {
    id: "est-7pm",
    timeLabel: "7:00 PM EST",
    timeZone: "EST (New York / US & Canada)",
    region: "Americas",
    topic: "Evening Urge Prevention & Support",
    isActiveOrNext: false,
    participantCount: 24,
  },
  {
    id: "sgt-7pm",
    timeLabel: "7:00 PM SGT",
    timeZone: "SGT (Singapore / Asia & Pacific)",
    region: "Asia & Oceania",
    topic: "Morning Honesty & Intention Setting",
    isActiveOrNext: false,
    participantCount: 14,
  },
];

export interface CommunityMessage {
  id: string;
  sender: string;
  dayCount: number;
  avatarColor: string;
  text: string;
  time: string;
  isSelf?: boolean;
}

export const INITIAL_COMMUNITY_MESSAGES: CommunityMessage[] = [
  {
    id: "comm-intro",
    sender: "Recovery Community",
    dayCount: 1,
    avatarColor: "#FF5A00",
    text: "Welcome to the 24/7 Community Room. Check in honestly, share your day, and support peers. All messages are live and anonymous.",
    time: "Today",
  },
];

export interface ChatMessage {
  id: string;
  sender: "them" | "me";
  text: string;
  time: string;
}

export interface PeerChat {
  id: string;
  name: string;
  avatarColor: string;
  cleanDays: number;
  isSponsor: boolean;
  status: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export const INITIAL_PEER_CHATS: PeerChat[] = [
  {
    id: "marcus-t",
    name: "Marcus T.",
    avatarColor: "#FF5A00",
    cleanDays: 128,
    isSponsor: true,
    status: "Active 12m ago",
    unreadCount: 0,
    messages: [
      {
        id: "m-1",
        sender: "them",
        text: "Hey, how are you feeling about the upcoming weekend? Any triggers or urges creeping up?",
        time: "Yesterday, 6:15 PM",
      },
      {
        id: "m-2",
        sender: "me",
        text: "A bit nervous with the games on Saturday, but I gave my banking passwords to my partner and blocked the apps.",
        time: "Yesterday, 6:30 PM",
      },
      {
        id: "m-3",
        sender: "them",
        text: "Smart move. If the urge creeps in, drop me a message right away or jump into the 7 PM call. You've got this.",
        time: "Yesterday, 6:42 PM",
      },
    ],
  },
  {
    id: "sarah-k",
    name: "Sarah K.",
    avatarColor: "#EA580C",
    cleanDays: 11,
    isSponsor: false,
    status: "Active 1h ago",
    unreadCount: 1,
    messages: [
      {
        id: "s-1",
        sender: "them",
        text: "Hey! Just wanted to check in. Did you attend yesterday's evening meeting?",
        time: "10:14 AM",
      },
      {
        id: "s-2",
        sender: "me",
        text: "Yes, it really helped calm my mind down.",
        time: "10:20 AM",
      },
      {
        id: "s-3",
        sender: "them",
        text: "Same here. Let's keep each other accountable today!",
        time: "10:25 AM",
      },
    ],
  },
  {
    id: "liam-m",
    name: "Liam M.",
    avatarColor: "#F97316",
    cleanDays: 24,
    isSponsor: false,
    status: "Active 3h ago",
    unreadCount: 0,
    messages: [
      {
        id: "l-1",
        sender: "them",
        text: "Thanks for sharing your story in yesterday's call man, your experience with chasing losses really resonated with me.",
        time: "Yesterday, 9:02 PM",
      },
      {
        id: "l-2",
        sender: "me",
        text: "Appreciate that Liam. Glad we're both here and facing it honestly.",
        time: "Yesterday, 9:15 PM",
      },
    ],
  },
];
