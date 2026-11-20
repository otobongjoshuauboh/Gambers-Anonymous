"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, MessageSquare, Flame, User } from "lucide-react";
import { useRecovery } from "@/context/RecoveryContext";

export default function BottomNav() {
  const pathname = usePathname();
  const { streak, attendedToday } = useRecovery();

  const navItems = [
    {
      name: "Home",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Meetings",
      href: "/meetings",
      icon: Users,
      badge: !attendedToday ? "1" : undefined,
    },
    {
      name: "Chats",
      href: "/chats",
      icon: MessageSquare,
    },
    {
      name: "Streak",
      href: "/streak",
      icon: Flame,
      badgeText: `${streak}d`,
    },
    {
      name: "Account",
      href: "/account",
      icon: User,
    },
  ];

  return (
    <nav
      aria-label="Main Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-100"
    >
      <div className="max-w-md mx-auto flex items-center justify-around px-1 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-[#FF5A00]"
                  : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? "scale-105 stroke-[2.4]" : "stroke-[1.8]"
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#FF5A00] text-[9px] font-bold text-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-1 font-sans ${
                  isActive ? "font-bold text-[#FF5A00]" : "font-medium"
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
