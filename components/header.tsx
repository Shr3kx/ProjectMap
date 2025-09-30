"use client";

import Link from "next/link";
import ThemeSwitcher from "@/components/theme-switcher";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

export function AppHeader() {
  const { state } = useSidebar();
  const isSidebarCollapsed = state === "collapsed";

  return (
    <header
      role="banner"
      data-sidebar-collapsed={isSidebarCollapsed}
      className="sticky top-0 z-50 border-b data-[sidebar-collapsed=true]:border-b-0 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="flex h-12 items-center justify-between px-3 md:h-14 md:px-4">
        {/* Left: Sidebar trigger + brand */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="size-8 md:size-7" />
        </div>

        {/* Right: Theme switcher */}
        <div className="flex items-center gap-2">{/* <ThemeSwitcher /> */}</div>
      </div>
    </header>
  );
}

export default AppHeader;
