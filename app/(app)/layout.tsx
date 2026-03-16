"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:py-12">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
