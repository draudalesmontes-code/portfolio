"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/lib/api";

const inputClass = "border-[#e2cbc2] bg-[#fdf6f1] text-[#3a2228] placeholder:text-[#b89a93]";

type RegisterFormData = {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const INITIAL_REGISTER_FORM: RegisterFormData = {
  displayName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

type RegisterRequest = {
  displayName: string;
  email: string;
  password: string;
};

type Submission = "idle" | "submitting" | "success" | "error";

type ApiErrorResponse = {
  timestamp: string;
  status: number;
  message: string;
  path: string;
  fields: Partial<Record<keyof RegisterRequest, string>>;
};

type RegisterFieldErrors = Partial<Record<keyof RegisterFormData, string>>;

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterFormData>(INITIAL_REGISTER_FORM);
  const [status, setStatus] = useState<Submission>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<RegisterFieldErrors>({});

  function updateField(
    field: keyof RegisterFormData,
    value: string,
  ) {
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

    const displayName = form.displayName.trim();
    const email = form.email.trim();
    const payload: RegisterRequest = {
      displayName,
      email,
      password: form.password,
    };

    const clientErrors: RegisterFieldErrors = {};
    if (!displayName) {
      clientErrors.displayName = "Full name is required.";
    } else if (displayName.length > 100) {
      clientErrors.displayName = "Full name must be at most 100 characters.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      clientErrors.email = "Please enter a valid email address.";
    }

    if (form.password.length < 8) {
      clientErrors.password = "Password must be at least 8 characters long.";
    } else if (form.password.length > 72) {
      clientErrors.password = "Password must be at most 72 characters long.";
    }

    if (form.password !== form.confirmPassword) {
      clientErrors.confirmPassword = "Passwords do not match.";
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
      const res = await apiFetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error: ApiErrorResponse = await res.json();
        setStatus("error");
        setErrorMessage(error.message);
        setFieldErrors(error.fields ?? {});
        return;
      }

      setStatus("success");
      setForm(INITIAL_REGISTER_FORM);
    } catch {
      setStatus("error");
      setErrorMessage("Unable to create your account. Please try again.");
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
          <span className="text-xs font-semibold uppercase tracking-[0.25em]">New account</span>
        </div>

        <div className="p-8">
          <h1 className="text-2xl font-bold text-[#3a2228]">Create your account</h1>
          <p className="mt-1.5 text-sm text-[#6a4a4f]">
            Join to message me, play the bots, and track your stats.
          </p>

          {status === "success" ? (
            <div className="mt-7 space-y-4 text-center" role="status">
              <p className="text-lg font-semibold text-[#3a2228]">
                Check your email
              </p>
              <p className="text-sm text-[#6a4a4f]">
                We sent you a verification link. Open it before signing in.
              </p>
              <Button
                asChild
                size="lg"
                className="w-full rounded-full bg-[#7b2e3c] font-semibold text-[#fdf6f1] hover:bg-[#651f2c]"
              >
                <Link href="/login">Go to sign in</Link>
              </Button>
              <Link
                href="/verify-email"
                className="inline-block text-sm font-semibold text-[#7b2e3c] hover:underline"
              >
                Didn&apos;t receive it? Request a new link
              </Link>
            </div>
          ) : (
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
              <Label htmlFor="name" className="text-[#6a4a4f]">
                Full name
              </Label>
              <Input
                id="name"
                name="displayName"
                type="text"
                value={form.displayName}
                onChange={(changeEvent) =>
                  updateField("displayName", changeEvent.currentTarget.value)
                }
                placeholder="Diego Raudales"
                autoComplete="name"
                maxLength={100}
                required
                className={inputClass}
              />
              {fieldErrors.displayName && (
                <p role="alert" className="text-sm text-red-700">
                  {fieldErrors.displayName}
                </p>
              )}
            </div>

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
                className={inputClass}
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
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                required
                className={inputClass}
              />
              {fieldErrors.password && (
                <p role="alert" className="text-sm text-red-700">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-[#6a4a4f]">
                Confirm password
              </Label>
              <Input
                id="confirm"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={(changeEvent) =>
                  updateField(
                    "confirmPassword",
                    changeEvent.currentTarget.value,
                  )
                }
                placeholder="••••••••"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                required
                className={inputClass}
              />
              {fieldErrors.confirmPassword && (
                <p role="alert" className="text-sm text-red-700">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full bg-[#7b2e3c] font-semibold text-[#fdf6f1] hover:bg-[#651f2c]"
              disabled={status === "submitting"}
           >
              {status === "submitting" ? "Creating account…" : "Create account"}
            </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-[#9a7d78]">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#7b2e3c] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
