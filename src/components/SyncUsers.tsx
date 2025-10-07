"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function SyncUser() {
  const { user, isSignedIn } = useUser();
  const storeUser = useMutation(api.users.storeUser);

  useEffect(() => {
    if (!isSignedIn || !user) {
      return;
    }

    storeUser({
      clerkId: user.id,
      email: user.primaryEmailAddress?.emailAddress ?? "",
      name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
      imageUrl: user.imageUrl,
    })
      .then(result => console.log("User sync successful:", result))
      .catch(err => console.error("User sync failed:", err));
  }, [isSignedIn, user, storeUser]);

  return null;
}
