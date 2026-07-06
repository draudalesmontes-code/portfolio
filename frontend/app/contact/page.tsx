"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api";

type ContactFormData = {
  firstName: string;
  lastName: string;
  contactEmail: string;
  message: string;
};

type ContactRequest = {
  authorName: string;
  contactEmail: string;
  message: string;
};

type ApiErrorResponse = {
  timestamp: string;
  status: number;
  message: string;
  path: string;
  fields: Partial<Record<keyof ContactRequest, string>>;
};

type Submission = "idle" | "submitting" | "success" | "error";

const INITIAL_CONTACT_FORM: ContactFormData = {
  firstName: "",
  lastName: "",
  contactEmail: "",
  message: "",
};

export default function ContactPage() {
  const [form, setForm] = useState<ContactFormData>(INITIAL_CONTACT_FORM);
  const [status, setStatus] = useState<Submission>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] =
    useState<ApiErrorResponse["fields"]>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: ContactRequest = {
      authorName: `${form.firstName} ${form.lastName}`.trim(),
      contactEmail: form.contactEmail.trim(),
      message: form.message.trim(),
    };

    setStatus("submitting");
    setErrorMessage(null);
    setFieldErrors({});

    try {
      const response = await apiFetch("/api/feedback", {
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
      setForm(INITIAL_CONTACT_FORM);
    } catch {
      setStatus("error");
      setErrorMessage("Unable to send your message. Please try again.");
    }
  }
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#e7e1d8] px-6 py-20">
      {/* organic animated background blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="animate-blob-drift absolute -top-24 -left-24 h-96 w-96 rounded-full bg-rose-300/40 blur-3xl" />
        <div className="animate-blob-drift absolute top-1/3 -right-20 h-[28rem] w-[28rem] rounded-full bg-violet-300/40 blur-3xl [animation-delay:-6s]" />
        <div className="animate-blob-drift absolute -bottom-28 left-1/4 h-96 w-96 rounded-full bg-amber-300/40 blur-3xl [animation-delay:-12s]" />
      </div>

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center gap-8">
        {/* floating title card */}
        <Card className="animate-card-float-delayed w-fit rounded-full border-0 bg-white/60 px-8 py-4 shadow-xl ring-1 ring-white/50 backdrop-blur-xl">
          <CardTitle className="bg-gradient-to-r from-rose-500 via-fuchsia-500 to-violet-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
            Contact me
          </CardTitle>
        </Card>

        {/* floating form card */}
        <Card className="animate-card-float w-full rounded-3xl border-0 bg-white/55 p-2 shadow-2xl ring-1 ring-white/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground/90">
              Let&apos;s get in touch
            </CardTitle>
            <CardDescription>
              Drop me a message and I&apos;ll get back to you.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {status === "success" ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <p className="text-lg font-semibold text-foreground/90">
                  Thanks for reaching out! 🌿
                </p>
                <p className="text-sm text-muted-foreground">
                  Your message is on its way — I&apos;ll reply soon.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-5"
              >
                {errorMessage && (
                  <p
                    role="alert"
                    className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {errorMessage}
                  </p>
                )}

                <div className="flex flex-col gap-5 sm:flex-row">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={form.firstName}
                      onChange={(changeEvent) => {
                        const firstName = changeEvent.currentTarget.value;
                        setForm((current) => ({
                          ...current,
                          firstName,
                        }));
                      }}
                      placeholder="John"
                      autoComplete="given-name"
                      required
                      className="bg-white/70"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={form.lastName}
                      onChange={(changeEvent) => {
                        const lastName = changeEvent.currentTarget.value;
                        setForm((current) => ({
                          ...current,
                          lastName,
                        }));
                      }}
                      placeholder="Doe"
                      autoComplete="family-name"
                      required
                      className="bg-white/70"
                    />
                  </div>
                </div>
                {fieldErrors.authorName && (
                  <p role="alert" className="text-sm text-red-700">
                    {fieldErrors.authorName}
                  </p>
                )}

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={form.contactEmail}
                    onChange={(changeEvent) => {
                      const contactEmail = changeEvent.currentTarget.value;
                      setForm((current) => ({
                        ...current,
                        contactEmail,
                      }));
                    }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="bg-white/70"
                  />
                  {fieldErrors.contactEmail && (
                    <p role="alert" className="text-sm text-red-700">
                      {fieldErrors.contactEmail}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={(changeEvent) => {
                      const message = changeEvent.currentTarget.value;
                      setForm((current) => ({
                        ...current,
                        message,
                      }));
                    }}
                    placeholder="Tell me about your project or just say hi…"
                    required
                    rows={5}
                    className="resize-none bg-white/70"
                  />
                  {fieldErrors.message && (
                    <p role="alert" className="text-sm text-red-700">
                      {fieldErrors.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={status === "submitting"}
                  className="mt-1 w-full rounded-xl bg-gradient-to-r from-rose-500 via-fuchsia-500 to-violet-500 text-white transition-opacity hover:opacity-90"
                >
                  {status === "submitting" ? "Sending…" : "Send message"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
