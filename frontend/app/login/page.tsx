"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";

type LoginFormData = {
  email: string;
  password: string;
};

type LoginRequest = {
  email: string;
  password: string;
};

const LOGIN_BASE: LoginFormData = {
  email: "",
  password: "",
};

type Submission = "idle" | "submitting" | "success" | "error";

type ApiErrorResponse = {
  timestamp: string;
  status: number;
  message: string;
  path: string;
  fields: Partial<Record<keyof LoginFormData, string>>;
};

export default function LoginPage() {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const [form, setForm] = useState<LoginFormData>(LOGIN_BASE);
  const [status, setStatus] = useState<Submission>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ApiErrorResponse["fields"]>({});

  function updateField(field: keyof LoginFormData, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: LoginRequest = {
      email: form.email.trim(),
      password: form.password,
    };

    const clientErrors: ApiErrorResponse["fields"] = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
      clientErrors.email = "Please enter a valid email address.";
    }
    if (!payload.password) {
      clientErrors.password = "Password is required.";
    }

    if (Object.keys(clientErrors).length > 0) {
      setStatus("error");
      setErrorMessage(null);
      setFieldErrors(clientErrors);
      return;
    }

    setStatus("submitting");
    setErrorMessage(null);
    setFieldErrors({});

    try {
      const response = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error: ApiErrorResponse = await response.json();
        setStatus("error");
        setErrorMessage(error.message);
        setFieldErrors(error.fields ?? {});
        return;
      }

      setStatus("success");
      setForm(LOGIN_BASE);
      await refreshAuth();
      router.push("/account");
      router.refresh();
    } catch {
      setStatus("error");
      setErrorMessage("Unable to sign in. Please try again.");
    }
  }


  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#f8efe8] via-[#f0dcd6] to-[#e6cbc6] px-6 py-16">
      {/* soft wine glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-[#9a3a4a]/20 blur-3xl"
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-[#e7d3ca] bg-[#fdf6f1] shadow-[0_24px_60px_-18px_rgba(110,40,55,0.5)]">
        {/* warm wine header band */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-[#651f2c] to-[#9a3a4a] px-8 py-4 text-[#fdf6f1]">
          <span className="size-2.5 rounded-full bg-[#fdf6f1]" />
          <span className="text-xs font-semibold uppercase tracking-[0.25em]">Account</span>
        </div>

        <div className="p-8">
          <h1 className="text-2xl font-bold text-[#3a2228]">Welcome back</h1>
          <p className="mt-1.5 text-sm text-[#6a4a4f]">
            Manage your messages, match stats, and profile.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-7 space-y-5"
          >
            {errorMessage && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {errorMessage}
              </p>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#6a4a4f]">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={(changeEvent) =>
                  updateField("email", changeEvent.currentTarget.value)
                }
                placeholder="you@example.com"
                autoComplete="email"
                maxLength={255}
                required
                className="border-[#e2cbc2] bg-[#fdf6f1] text-[#3a2228] placeholder:text-[#b89a93]"
              />
              {fieldErrors.email && (
                <p role="alert" className="text-sm text-red-700">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#6a4a4f]">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={(changeEvent) =>
                  updateField("password", changeEvent.currentTarget.value)
                }
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="border-[#e2cbc2] bg-[#fdf6f1] text-[#3a2228] placeholder:text-[#b89a93]"
              />
              {fieldErrors.password && (
                <p role="alert" className="text-sm text-red-700">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full bg-[#7b2e3c] font-semibold text-[#fdf6f1] hover:bg-[#651f2c]"
              disabled={status === "submitting"}
            >
              {status === "submitting" ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[#9a7d78]">
            No account yet?{" "}
            <Link href="/register" className="font-semibold text-[#7b2e3c] hover:underline">
              Create one
            </Link>
          </p>
          <p className="mt-2 text-center text-sm">
            <Link
              href="/verify-email"
              className="font-semibold text-[#7b2e3c] hover:underline"
            >
              Resend verification email
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
