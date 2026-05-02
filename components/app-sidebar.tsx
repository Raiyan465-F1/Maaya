"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  CalendarHeart,
  MessageSquare,
  Stethoscope,
  Bell,
  BookOpen,
  UserPlus,
  Shield,
  Newspaper,
  EyeOff,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import type { UserRole } from "@/src/schema/enums";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SHARED_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Forum", href: "/forum", icon: MessageSquare },
  { label: "Educational Hub", href: "/education", icon: BookOpen },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "STI Awareness Hub", href: "/sti-awareness", icon: Newspaper },
];

const USER_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Cycle Tracking", href: "/cycle-tracking", icon: CalendarHeart },
  { label: "Forum", href: "/forum", icon: MessageSquare },
  { label: "Doctor's Help", href: "/doctors-help", icon: Stethoscope },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Educational Hub", href: "/education", icon: BookOpen },
  { label: "STI Awareness Hub", href: "/sti-awareness", icon: Newspaper },
];

const DOCTOR_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Doctor's Help", href: "/doctors-help", icon: Stethoscope },
  { label: "Forum", href: "/forum", icon: MessageSquare },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Educational Hub", href: "/education", icon: BookOpen },
  { label: "STI Awareness Hub", href: "/sti-awareness", icon: Newspaper },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Forum", href: "/forum", icon: MessageSquare },
  { label: "Doctor's Help", href: "/doctors-help", icon: Stethoscope },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Educational Hub", href: "/education", icon: BookOpen },
  { label: "STI Awareness Hub", href: "/sti-awareness", icon: Newspaper },
];

const ADMIN_TOOLS: NavItem[] = [
  { label: "Onboard Doctor", href: "/admin/onboard-doctor", icon: UserPlus },
  { label: "Moderation", href: "/admin/moderation", icon: Shield },
];

function getNavForRole(role: UserRole | undefined): NavItem[] {
  switch (role) {
    case "doctor":
      return DOCTOR_NAV;
    case "admin":
      return ADMIN_NAV;
    default:
      return USER_NAV;
  }
}

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (status !== "authenticated") {
      setIsAnonymous(false);
      return;
    }

    let cancelled = false;

    const loadAnonymous = async () => {
      try {
        const res = await fetch("/api/profile", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { isAnonymous?: unknown };
        if (!cancelled) setIsAnonymous(Boolean(data.isAnonymous));
      } catch {
        // best-effort
      }
    };

    loadAnonymous();

    const handleAnonymousChange = (event: Event) => {
      const detail = (event as CustomEvent<{ isAnonymous?: boolean }>).detail;
      if (detail && typeof detail.isAnonymous === "boolean") {
        setIsAnonymous(detail.isAnonymous);
      } else {
        loadAnonymous();
      }
    };

    window.addEventListener("profile:anonymous-changed", handleAnonymousChange);

    return () => {
      cancelled = true;
      window.removeEventListener(
        "profile:anonymous-changed",
        handleAnonymousChange,
      );
    };
  }, [status, pathname]);

  useEffect(() => {
    if (status !== "authenticated") {
      setUnreadCount(0);
      return;
    }

    let cancelled = false;

    const refreshUnreadCount = async () => {
      try {
        const res = await fetch("/api/notifications/unread-count", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as { unreadCount?: unknown };
        if (!cancelled) {
          setUnreadCount(
            typeof data.unreadCount === "number" ? data.unreadCount : 0,
          );
        }
      } catch {
        // best-effort
      }
    };

    refreshUnreadCount();
    const interval = window.setInterval(refreshUnreadCount, 60000);
    const source = new EventSource("/api/notifications/stream");
    const handleNotifications = (event: MessageEvent<string>) => {
      try {
        const data = JSON.parse(event.data) as { unseenCount?: unknown };
        if (!cancelled && typeof data.unseenCount === "number") {
          setUnreadCount(data.unseenCount);
        }
      } catch {
        // ignore malformed events
      }
    };
    source.addEventListener("notifications", handleNotifications as EventListener);
    window.addEventListener("focus", refreshUnreadCount);
    window.addEventListener("notifications:changed", refreshUnreadCount);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      source.removeEventListener("notifications", handleNotifications as EventListener);
      source.close();
      window.removeEventListener("focus", refreshUnreadCount);
      window.removeEventListener("notifications:changed", refreshUnreadCount);
    };
  }, [status]);

  const role = session?.user?.role;
  const name = session?.user?.name;
  const email = session?.user?.email;
  const initial = name ? name[0].toUpperCase() : email ? email[0].toUpperCase() : "?";

  const mainNav = getNavForRole(role);
  const isAdmin = role === "admin";
  const isDoctor = role === "doctor";

  const accentColor = isDoctor
    ? "from-secondary to-primary"
    : isAdmin
      ? "from-primary via-accent to-secondary"
      : "from-primary to-secondary";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span
            className={`bg-gradient-to-r ${accentColor} bg-clip-text font-heading text-xl font-bold tracking-tight text-transparent`}
          >
            MAAYA
          </span>
        </Link>
        <p className="text-xs font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">
          Smart Women&apos;s Health
        </p>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono text-[10px] tracking-widest uppercase">
            {isDoctor ? "Practice" : isAdmin ? "Platform" : "Navigate"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                const showUnreadBadge =
                  item.href === "/notifications" && unreadCount > 0;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                        {showUnreadBadge ? (
                          <span className="ml-auto inline-flex min-w-6 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground group-data-[collapsible=icon]:hidden">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        ) : null}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel className="font-mono text-[10px] tracking-widest text-accent uppercase">
                Admin Tools
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {ADMIN_TOOLS.map((item) => {
                    const isActive =
                      pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                          <Link href={item.href}>
                            <item.icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/profile"}
              tooltip="Profile"
              size="lg"
            >
              <Link href="/profile">
                <span className="relative flex size-8 shrink-0 items-center justify-center">
                  <span
                    className={`flex size-8 items-center justify-center rounded-full bg-gradient-to-br ${accentColor} font-heading text-sm font-semibold text-primary-foreground`}
                  >
                    {initial}
                  </span>
                  {isAnonymous && (
                    <span
                      title="Anonymous mode is on"
                      aria-label="Anonymous mode is on"
                      className="absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full border-2 border-sidebar bg-primary text-primary-foreground"
                    >
                      <EyeOff className="size-2.5" />
                    </span>
                  )}
                </span>
                <span className="flex flex-col">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-sm font-medium">
                      {name || email || "Profile"}
                    </span>
                    {isAnonymous && (
                      <span className="rounded-full border border-primary/30 bg-primary/10 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-primary group-data-[collapsible=icon]:hidden">
                        Anon
                      </span>
                    )}
                  </span>
                  {role && (
                    <span className="truncate text-xs text-muted-foreground capitalize">
                      {isAnonymous ? `${role} • Anonymous mode on` : role}
                    </span>
                  )}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
