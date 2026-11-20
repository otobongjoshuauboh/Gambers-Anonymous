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
    id: "comm-1",
    sender: "Marcus T.",
    dayCount: 42,
    avatarColor: "#FF5A00",
    text: "Good morning everyone. Reached 6 weeks today without placing a single bet. There were tough days this week with the big matches on, but joining the 7 PM call kept me honest.",
    time: "8:45 AM",
  },
  {
    id: "comm-2",
    sender: "Sarah K.",
    dayCount: 11,
    avatarColor: "#EA580C",
    text: "Proud of you Marcus! Today is Day 11 for me. The urge hit really hard last night, but I reminded myself how miserable I felt waking up with zero balance. Staying strong today.",
    time: "9:12 AM",
  },
  {
    id: "comm-3",
    sender: "David O.",
    dayCount: 128,
    avatarColor: "#C2410C",
    text: "One day at a time, Sarah. You survived the hardest 10 days. Remember: a slip starts in the mind hours before an actual bet. Protect your peace.",
    time: "9:30 AM",
  },
  {
    id: "comm-4",
    sender: "Elena R.",
    dayCount: 5,
    avatarColor: "#F97316",
    text: "Checking in. Attending the 7:00 PM GMT meeting tonight. Having you all here anonymously makes me feel like I don't have to carry this shame alone.",
    time: "10:05 AM",
  },
  {
    id: "comm-5",
    sender: "Jordan P.",
    dayCount: 89,
    avatarColor: "#D97706",
    text: "See you at the 7:00 PM call Elena. We're all in this together. No shame here, only moving forward.",
    time: "10:18 AM",
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
