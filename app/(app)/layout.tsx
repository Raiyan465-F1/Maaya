"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isForumRoute = pathname === "/forum" || pathname.startsWith("/forum/");
  const isWideKnowledgeRoute = pathname === "/education" || pathname.startsWith("/sti-awareness");
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-12 items-center gap-2 border-b border-sidebar-border px-4 md:hidden">
          <SidebarTrigger />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text font-heading text-lg font-bold tracking-tight text-transparent">
            MAAYA
          </span>
        </header>
        <div
          className={[
            "mx-auto w-full flex-1 px-4 py-8 sm:px-6 lg:py-12",
            isForumRoute ? "max-w-[108rem] lg:px-6" : isWideKnowledgeRoute ? "max-w-7xl lg:px-8" : "max-w-4xl",
          ].join(" ")}
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
