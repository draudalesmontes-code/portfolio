"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";

type VerificationStatus = "idle" | "verifying" | "success" | "error";
type ResendStatus = "idle" | "sending" | "sent" | "error";

type ApiErrorResponse = {
  message?: string;
};

export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>(token ? "verifying" : "idle");
  const [verificationError, setVerificationError] = useState<string | null>(
    null,
  );
  const [email, setEmail] = useState("");
  const [resendStatus, setResendStatus] = useState<ResendStatus>("idle");
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;

    async function verifyEmail() {
      setVerificationStatus("verifying");
      setVerificationError(null);

      try {
        const response = await fetch(
          `/api/auth/verify?token=${encodeURIComponent(token!)}`,
          {
            credentials: "include",
          },
        );

        if (!active) {
          return;
        }

        if (!response.ok) {
          const error: ApiErrorResponse = await response.json();
          setVerificationStatus("error");
          setVerificationError(
            error.message ?? "This verification link is invalid.",
          );
          return;
        }

        setVerificationStatus("success");
      } catch {
        if (active) {
          setVerificationStatus("error");
          setVerificationError(
            "Unable to verify your email. Please try again.",
          );
        }
      }
    }

    void verifyEmail();

    return () => {
      active = false;
    };
  }, [token]);

  async function handleResend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setResendStatus("error");
      setResendMessage("Email is required.");
      return;
    }

    setResendStatus("sending");
    setResendMessage(null);

    try {
      const response = await apiFetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      if (!response.ok) {
        const error: ApiErrorResponse = await response.json();
        setResendStatus("error");
        setResendMessage(
          error.message ?? "Unable to resend the verification email.",
        );
        return;
      }

      setResendStatus("sent");
      setResendMessage(
        "If that account exists and still needs verification, a new link was sent.",
      );
    } catch {
      setResendStatus("error");
      setResendMessage("Unable to resend the verification email.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f8efe8] via-[#f0dcd6] to-[#e6cbc6] px-6 py-16">
      <section className="w-full max-w-md rounded-[2rem] border border-[#e7d3ca] bg-[#fdf6f1] p-8 text-center shadow-[0_24px_60px_-18px_rgba(110,40,55,0.5)]">
        {verificationStatus === "verifying" && (
          <>
            <h1 className="text-2xl font-bold text-[#3a2228]">
              Verifying your email
            </h1>
            <p className="mt-3 text-sm text-[#6a4a4f]" role="status">
              One moment while we confirm your verification link…
            </p>
          </>
        )}

        {verificationStatus === "success" && (
          <>
            <h1 className="text-2xl font-bold text-[#3a2228]">
              Email verified
            </h1>
            <p className="mt-3 text-sm text-[#6a4a4f]">
              Your account is ready. You can now sign in.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-6 w-full rounded-full bg-[#7b2e3c] font-semibold text-[#fdf6f1] hover:bg-[#651f2c]"
            >
              <Link href="/login">Sign in</Link>
            </Button>
          </>
        )}

        {(verificationStatus === "idle" ||
          verificationStatus === "error") && (
          <>
            <h1 className="text-2xl font-bold text-[#3a2228]">
              {verificationStatus === "error"
                ? "Verification link failed"
                : "Verify your email"}
            </h1>
            <p className="mt-3 text-sm text-[#6a4a4f]">
              {verificationError ??
                "Enter your email to request a new verification link."}
            </p>

            <form onSubmit={handleResend} className="mt-6 space-y-4 text-left">
              <div className="space-y-2">
                <Label htmlFor="verification-email">Email</Label>
                <Input
                  id="verification-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.currentTarget.value)}
                  autoComplete="email"
                  required
                />
              </div>
              {resendMessage && (
                <p
                  role={resendStatus === "error" ? "alert" : "status"}
                  className={`text-sm ${
                    resendStatus === "error"
                      ? "text-red-700"
                      : "text-[#4d6b29]"
                  }`}
                >
                  {resendMessage}
                </p>
              )}
              <Button
                type="submit"
                size="lg"
                disabled={resendStatus === "sending"}
                className="w-full rounded-full bg-[#7b2e3c] font-semibold text-[#fdf6f1] hover:bg-[#651f2c]"
              >
                {resendStatus === "sending"
                  ? "Sending…"
                  : "Resend verification email"}
              </Button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <p role="status">Loading verification…</p>
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
