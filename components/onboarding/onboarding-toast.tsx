"use client";

import { useEffect } from "react";
import { toast } from "sonner";

interface OnboardingToastProps {
  confirmed: boolean;
}

export function OnboardingToast({ confirmed }: OnboardingToastProps) {
  useEffect(() => {
    if (confirmed) {
      toast.success("Email confirmed successfully");
    }
  }, [confirmed]);

  return null;
}
