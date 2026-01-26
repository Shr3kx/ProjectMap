"use client";

import React, { useState } from "react";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { ThemeSwitcher } from "@/components/layout/ThemeSwitcher";
import { InfoModal } from "@/components/modals/InfoModal";
import { SignInModal } from "@/components/modals/SignInModal";
import { UserMenu } from "@/components/layout/UserMenu";
import { Info, LogIn } from "lucide-react";
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
import { useSession } from "@/lib/auth-client";

export default function Home() {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const { data: session, isPending } = useSession();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen">
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
          {/* Top Right Controls */}
          <div className="flex items-center gap-2 px-4">
            {/* User Menu or Sign In Button */}
            {!isPending && session?.user ? (
              <UserMenu
                user={{
                  name: session.user.name || session.user.email || "User",
                  email: session.user.email || "",
                  image: session.user.image,
                }}
              />
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                aria-label="Sign in to your account"
                onClick={() => setIsSignInOpen(true)}
                disabled={isPending}
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Button>
            )}

            {/* Info Button */}
            <button
              onClick={() => setIsInfoOpen(true)}
              className="w-8 h-8 flex items-center justify-center bg-card hover:bg-accent border border-border rounded-full transition-colors shadow-sm"
              aria-label="About ProjectMap"
              title="About ProjectMap"
            >
              <Info size={16} className="text-foreground" />
            </button>

            {/* Theme Switcher */}
            <ThemeSwitcher />
          </div>
        </header>
        <div className="flex flex-1 flex-col overflow-hidden">
          <ChatInterface />
        </div>
        {/* Info Modal */}
        <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
        {/* Sign In Modal */}
        <SignInModal open={isSignInOpen} onOpenChange={setIsSignInOpen} />
      </SidebarInset>
    </SidebarProvider>
  );
}
