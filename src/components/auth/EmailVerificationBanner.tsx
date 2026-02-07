"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

type ResendState = "idle" | "sending" | "sent" | "error";

export function EmailVerificationBanner() {
  const [state, setState] = useState<ResendState>("idle");

  async function handleResend() {
    setState("sending");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to resend");
      setState("sent");
    } catch {
      setState("error");
    }
  }

  const buttonLabel: Record<ResendState, string> = {
    idle: "Resend",
    sending: "Sending...",
    sent: "Sent!",
    error: "Retry",
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
      <Mail className="h-5 w-5 shrink-0 text-amber-600" />
      <p className="flex-1 text-sm text-amber-800">
        Please verify your email address. Check your inbox for a verification
        link.
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={handleResend}
        disabled={state === "sending" || state === "sent"}
        className="shrink-0 border-amber-300 text-amber-700 hover:bg-amber-100"
      >
        {buttonLabel[state]}
      </Button>
    </div>
  );
}
