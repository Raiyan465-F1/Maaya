"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
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
  const { data: session } = useSession();

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
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${accentColor} font-heading text-sm font-semibold text-primary-foreground`}
                >
                  {initial}
                </span>
                <span className="flex flex-col">
                  <span className="truncate text-sm font-medium">
                    {name || email || "Profile"}
                  </span>
                  {role && (
                    <span className="truncate text-xs text-muted-foreground capitalize">
                      {role}
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
