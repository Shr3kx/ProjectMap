"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import supabase from "@/app/api/client";
import toast from "react-hot-toast";

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

export function LogoutModal({ open, onOpenChange, user }: LogoutModalProps) {
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out.");
      return;
    }
    toast.success("Signed out successfully.");
    onOpenChange(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Account</DialogTitle>
          <DialogDescription>
            Signed in as{" "}
            <span className="font-medium text-foreground">
              {getUserDisplayName(user)}
            </span>
            {user.email && (
              <span className="block text-muted-foreground mt-1">
                {user.email}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleSignOut}
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
