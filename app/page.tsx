"use client";

import React, { useEffect, useState } from "react";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";
import { InfoModal } from "@/components/modals/InfoModal";
import { LogoutModal } from "@/components/modals/LogoutModal";
import { SignInModal } from "@/components/modals/SignInModal";
import { useAuth } from "@/hooks/useAuth";
import { Info, LogIn } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/navigation/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

function getUserDisplayName(user: {
  user_metadata?: { full_name?: string; name?: string };
  email?: string;
}) {
  const name =
    user?.user_metadata?.full_name ??
    user?.user_metadata?.name ??
    user?.email?.split("@")[0];
  return name || user?.email || "User";
}

function getUserInitials(user: {
  user_metadata?: { full_name?: string; name?: string };
  email?: string;
}) {
  const name = getUserDisplayName(user);
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  { bg: "#4285F4", text: "#fff" }, // Google blue
  { bg: "#34A853", text: "#fff" }, // Google green
  { bg: "#FBBC05", text: "#1a1a1a" }, // Google yellow
  { bg: "#EA4335", text: "#fff" }, // Google red
  { bg: "#9C27B0", text: "#fff" }, // purple
  { bg: "#00BCD4", text: "#fff" }, // cyan
  { bg: "#FF9800", text: "#fff" }, // orange
  { bg: "#E91E63", text: "#fff" }, // pink
] as const;

function getUserAvatarColor(user: { id?: string; email?: string }) {
  const str = user?.id ?? user?.email ?? "default";
  let hash = 0;
  for (let i = 0; i < str.length; i++)
    hash = (hash << 5) - hash + str.charCodeAt(i);
  const idx = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export default function Home() {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!user) setIsLogoutOpen(false);
  }, [user]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen">
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between gap-2 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 ">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
          {/* Top Right Controls */}
          <div className="flex items-center gap-2 px-4">
            {/* Auth: Sign in or user name + logout modal */}
            {loading ? (
              <Button variant="outline" size="sm" className="gap-2" disabled>
                <span className="animate-pulse">…</span>
              </Button>
            ) : user ? (
              (() => {
                const { bg, text } = getUserAvatarColor(user);
                return (
                  <Button
                    variant="tabs"
                    size="sm"
                    className="gap-2 cursor-pointer"
                    aria-label="Account"
                    onClick={() => setIsLogoutOpen(true)}
                  >
                    <Avatar
                      className="h-6 w-6 shrink-0"
                      style={{ borderColor: bg }}
                    >
                      <AvatarImage
                        src={user.user_metadata?.avatar_url ?? undefined}
                        alt={getUserDisplayName(user)}
                        className="object-cover"
                      />
                      <AvatarFallback
                        className="text-xs font-semibold"
                        style={{ backgroundColor: bg, color: text }}
                      >
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{getUserDisplayName(user)}</span>
                  </Button>
                );
              })()
            ) : (
              <Button
                variant="tabs"
                size="sm"
                className="gap-2  cursor-pointer"
                aria-label="Sign in"
                onClick={() => setIsSignInOpen(true)}
              >
                <LogIn className="h-4 w-4" />
                <span>Sign in</span>
              </Button>
            )}

            {/* Info Button */}
            <Button
              onClick={() => setIsInfoOpen(true)}
              variant="tabs"
              className=" cursor-pointer"
              size="sm"
              aria-label="About ProjectMap"
              title="About ProjectMap"
            >
              <Info size={16} className="text-foreground" />
            </Button>

            {/* Theme Switcher */}
            <ThemeSwitcher />
          </div>
        </header>
        <div className="flex flex-1 flex-col overflow-hidden">
          <ChatInterface />
        </div>
        {/* Info Modal */}
        <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
        {/* Sign-In Modal */}
        <SignInModal open={isSignInOpen} onOpenChange={setIsSignInOpen} />
        {/* Logout Modal */}
        <LogoutModal
          open={isLogoutOpen}
          onOpenChange={setIsLogoutOpen}
          user={user}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
