"use client";

import { useState } from "react";
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

export default function ContactPage() {
  const [sent, setSent] = useState(false);

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
            {sent ? (
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
                onSubmit={(e) => {
                  e.preventDefault();
                  // TODO: wire to the API. For now just acknowledge locally.
                  setSent(true);
                }}
                className="flex flex-col gap-5"
              >
                <div className="flex flex-col gap-5 sm:flex-row">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="Diego"
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
                      placeholder="Raudales"
                      autoComplete="family-name"
                      required
                      className="bg-white/70"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="bg-white/70"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell me about your project or just say hi…"
                    required
                    rows={5}
                    className="resize-none bg-white/70"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="mt-1 w-full rounded-xl bg-gradient-to-r from-rose-500 via-fuchsia-500 to-violet-500 text-white transition-opacity hover:opacity-90"
                >
                  Send message
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
