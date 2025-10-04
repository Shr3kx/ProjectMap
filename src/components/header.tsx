"use client";
import { useState } from "react";
import ThemeSwitcher from "@/components/theme-switcher";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { SignInButton, useUser, UserButton } from "@clerk/nextjs";
import { Github, Info } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
export function AppHeader() {
  const { state } = useSidebar();
  const isSidebarCollapsed = state === "collapsed";
  const user = useUser();

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

        {/* Right: Auth + Theme switcher */}
        <div className="flex items-center gap-2">
          {user.isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm" asChild>
                <span tabIndex={0} aria-label="Log in">
                  Log in
                </span>
              </Button>
            </SignInButton>
          )}

          <ThemeSwitcher />
          <Link href="https://github.com/Shr3kx" target="_blank">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="Keyboard shortcuts"
            >
              <Github className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
