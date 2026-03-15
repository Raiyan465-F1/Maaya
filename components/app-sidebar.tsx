"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const MAIN_NAV = [
  { label: "Personal Dashboard", href: "/dashboard" },
  { label: "Cycle Tracking", href: "/cycle-tracking" },
  { label: "Forum", href: "/forum" },
  { label: "Doctor's Help", href: "/doctors-help" },
  { label: "Notification & Reminders", href: "/notifications" },
  { label: "Educational Hub", href: "/education" },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const initial = session?.user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <aside
      className={cn(
        "flex flex-col w-full max-w-[260px] border-r border-[var(--sidebar-border)]",
        "bg-[var(--sidebar)] text-[var(--sidebar-foreground)]"
      )}
      aria-label="App navigation"
    >
      {/* Brand */}
      <div className="p-5 border-b border-[var(--sidebar-border)]">
        <Link
          href="/dashboard"
          className="font-heading text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
        >
          MAAYA
        </Link>
        <p className="text-xs text-muted-foreground mt-1 font-medium">
          Smart Women&apos;s Health
        </p>
      </div>

      {/* Section label — editorial, font-mono per design */}
      <p className="font-mono text-xs tracking-widest text-primary uppercase px-5 pt-6 pb-2">
        Navigate
      </p>

      {/* Main nav */}
      <nav className="flex-1 px-3 pb-4 flex flex-col gap-0.5">
        {MAIN_NAV.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium px-3 py-2.5 rounded-xl transition-colors",
                isActive
                  ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] border border-primary/20"
                  : "text-foreground hover:bg-primary/10 hover:text-primary border border-transparent"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Profile at bottom — design: profile last */}
      <div className="p-3 border-t border-[var(--sidebar-border)]">
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-2 text-sm font-medium px-3 py-2.5 rounded-xl transition-colors w-full",
            pathname === "/profile"
              ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] border border-primary/20"
              : "text-foreground hover:bg-primary/10 hover:text-primary border border-transparent"
          )}
        >
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-heading font-semibold text-sm">
            {initial}
          </span>
          Profile
        </Link>
      </div>
    </aside>
  );
}
