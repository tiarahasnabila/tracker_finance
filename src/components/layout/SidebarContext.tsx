"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
  isSidebarHidden: boolean;
  toggleSidebar: () => void;
  setSidebarHidden: (hidden: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("fintrack_sidebar_hidden");
      if (saved === "true") {
        setIsSidebarHidden(true);
      }
    } catch (_) {}
  }, []);

  const toggleSidebar = () => {
    setIsSidebarHidden((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("fintrack_sidebar_hidden", String(next));
      } catch (_) {}
      return next;
    });
  };

  const setSidebarHidden = (hidden: boolean) => {
    setIsSidebarHidden(hidden);
    try {
      localStorage.setItem("fintrack_sidebar_hidden", String(hidden));
    } catch (_) {}
  };

  return (
    <SidebarContext.Provider
      value={{
        isSidebarHidden: mounted ? isSidebarHidden : false,
        toggleSidebar,
        setSidebarHidden,
        mobileOpen,
        setMobileOpen,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    return {
      isSidebarHidden: false,
      toggleSidebar: () => {},
      setSidebarHidden: () => {},
      mobileOpen: false,
      setMobileOpen: () => {},
    };
  }
  return context;
}
