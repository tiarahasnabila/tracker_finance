"use client";

import React from "react";
import { SidebarProvider, useSidebar } from "./SidebarContext";
import { AppSidebar } from "./AppSidebar";

interface DashboardShellProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
  children: React.ReactNode;
}

function DashboardContent({
  user,
  children,
}: DashboardShellProps) {
  const { isSidebarHidden } = useSidebar();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090e17] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors">
      {/* Sidebar Navigation */}
      <AppSidebar user={user} />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-[#090e17] transition-all duration-300 ease-in-out ${
          isSidebarHidden ? "md:pl-0" : "md:pl-64"
        }`}
      >
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  return (
    <SidebarProvider>
      <DashboardContent user={user}>{children}</DashboardContent>
    </SidebarProvider>
  );
}
