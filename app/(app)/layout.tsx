"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { cn } from "@/lib/utils";

const MOBILE_NAV = [
  { label: "Personal Dashboard", href: "/dashboard" },
  { label: "Cycle Tracking", href: "/cycle-tracking" },
  { label: "Forum", href: "/forum" },
  { label: "Doctor's Help", href: "/doctors-help" },
  { label: "Notification & Reminders", href: "/notifications" },
  { label: "Educational Hub", href: "/education" },
  { label: "Profile", href: "/profile" },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isForumRoute = pathname === "/forum" || pathname.startsWith("/forum/");

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0 lg:w-[260px]">
        <AppSidebar />
      </div>

      {/* Mobile header + overlay nav */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-primary/15">
        <div className="flex items-center justify-between h-14 px-4">
          <Link
            href="/dashboard"
            className="font-heading text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tight"
          >
            MAAYA
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-foreground hover:bg-primary/10 rounded-lg transition-colors"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {mobileOpen && (
          <nav className="border-t border-primary/15 px-4 py-4 flex flex-col gap-1 bg-card">
            {MOBILE_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-medium py-3 px-3 rounded-xl hover:bg-primary/10 hover:text-primary text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>

      {/* Main content */}
      <main
        className={cn(
          "flex-1 min-h-screen flex flex-col",
          "pt-14 lg:pt-0"
        )}
      >
        <div
          className={cn(
            "flex-1 w-full mx-auto px-4 sm:px-6 py-8 lg:py-12",
            isForumRoute ? "max-w-[108rem] lg:px-6" : "max-w-4xl"
          )}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
