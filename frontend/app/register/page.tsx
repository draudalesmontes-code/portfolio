"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const inputClass = "border-[#e2cbc2] bg-[#fdf6f1] text-[#3a2228] placeholder:text-[#b89a93]";

export default function RegisterPage() {
  const router = useRouter();

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

          <form
            onSubmit={(e) => {
              e.preventDefault();
              // no auth backend yet — go straight to the account dashboard
              router.push("/account");
            }}
            className="mt-7 space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#6a4a4f]">
                Full name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Diego Raudales"
                autoComplete="name"
                required
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#6a4a4f]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#6a4a4f]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                required
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-[#6a4a4f]">
                Confirm password
              </Label>
              <Input
                id="confirm"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                required
                className={inputClass}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full bg-[#7b2e3c] font-semibold text-[#fdf6f1] hover:bg-[#651f2c]"
            >
              Create account
            </Button>
          </form>

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
