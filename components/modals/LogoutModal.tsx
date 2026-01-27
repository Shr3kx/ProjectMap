"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User as UserIcon, Mail } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import supabase from "@/app/api/client";
import toast from "react-hot-toast";
import { useState } from "react";

interface LogoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

function getUserDisplayName(user: User): string {
  const name =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0];
  return name || user.email || "User";
}

function getUserInitials(user: User): string {
  const name = getUserDisplayName(user);
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function LogoutModal({ open, onOpenChange, user }: LogoutModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Failed to sign out. Please try again.");
        return;
      }
      toast.success("Signed out successfully.");
      onOpenChange(false);
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(user);
  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl">Account</DialogTitle>
          <DialogDescription className="sr-only">
            View account details and sign out
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6">
          {/* User Profile Section */}
          <div className="flex items-start gap-4 mb-6">
            <Avatar className="h-14 w-14 ring-2 ring-border">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="text-lg font-medium bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 pt-1">
              <h3 className="font-semibold text-base text-foreground truncate">
                {displayName}
              </h3>
              {user.email && (
                <div className="flex items-center gap-1.5 mt-1.5 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
              )}
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 h-11"
              onClick={handleSignOut}
              disabled={isLoading}
              aria-label="Sign out of your account"
            >
              <LogOut className="h-4 w-4" />
              {isLoading ? "Signing out..." : "Sign out"}
            </Button>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
