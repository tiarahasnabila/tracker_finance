import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AppSidebar } from "@/components/layout/AppSidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090e17] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors">
      {/* Sidebar Navigation */}
      <AppSidebar user={user} />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen bg-slate-50 dark:bg-[#090e17] transition-colors">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
