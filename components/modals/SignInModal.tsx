"use client";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import SignIn from "@/components/auth/SignIn";

interface SignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignInModal({ open, onOpenChange }: SignInModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <SignIn onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
