"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

interface AdminShellProps {
  children: React.ReactNode;
  role: "ADMIN" | "ASISTENTE";
  userName: string;
  userRole: "ADMIN" | "ASISTENTE";
}

export default function AdminShell({ children, role, userName, userRole }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar role={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          userName={userName}
          userRole={userRole}
          onMenuOpen={() => setSidebarOpen(true)}
        />
        {children}
      </div>
    </div>
  );
}
