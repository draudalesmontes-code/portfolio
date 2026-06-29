"use client";

import { useState } from "react";
import {
  BarChart3,
  Calendar,
  Camera,
  KeyRound,
  Mail,
  Trophy,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ── mock data (no backend yet) ──────────────────────────────────────────────
const USER = {
  name: "Diego Raudales",
  email: "draudalesmontes@gmail.com",
  joined: "2026-03-04",
};

type MsgStatus = "sent" | "read" | "responded";
const MESSAGES: { subject: string; sentAt: string; status: MsgStatus }[] = [
  { subject: "Collaboration on a RAG project", sentAt: "2026-06-24", status: "responded" },
  { subject: "Question about the Segway ASIC", sentAt: "2026-06-18", status: "read" },
  { subject: "Internship availability", sentAt: "2026-06-11", status: "read" },
  { subject: "Just saying hi 👋", sentAt: "2026-06-02", status: "sent" },
];

const WINS = [
  { level: "Easy", count: 12, color: "#6f8f3f" },
  { level: "Medium", count: 7, color: "#c89a3c" },
  { level: "Hard", count: 3, color: "#7b2e3c" },
];

const STATUS_STYLE: Record<MsgStatus, string> = {
  sent: "bg-[#3a2228]/8 text-[#6a4a4f]",
  read: "bg-[#c89a3c]/22 text-[#8a6516]",
  responded: "bg-[#6f8f3f]/20 text-[#4d6b29]",
};

const NAV = [
  { id: "account", label: "Account", icon: User },
  { id: "messages", label: "Messages", icon: Mail },
  { id: "stats", label: "Stats", icon: BarChart3 },
] as const;
type Section = (typeof NAV)[number]["id"];

// ── shared bits ──────────────────────────────────────────────────────────────
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-6 flex items-center gap-2.5">
        <span className="h-5 w-1.5 rounded-full bg-[#7b2e3c]" />
        <h2 className="text-xl font-bold text-[#3a2228]">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl border border-[#e7d3ca] bg-[#fdf6f1] shadow-[0_12px_30px_-14px_rgba(110,40,55,0.35)] ${className}`}
    >
      {children}
    </div>
  );
}

const inputClass =
  "border-[#e2cbc2] bg-[#fdf6f1] text-[#3a2228] placeholder:text-[#b89a93]";
const saveBtnClass = "rounded-full bg-[#7b2e3c] font-semibold text-[#fdf6f1] hover:bg-[#651f2c]";

export default function AccountPage() {
  const [section, setSection] = useState<Section>("account");

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f8efe8] via-[#f0dcd6] to-[#e6cbc6] text-[#3a2228]">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12 md:flex-row">
        {/* ── sidebar ── */}
        <aside className="md:w-64 md:shrink-0">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-[#7b2e3c] to-[#9a3a4a] text-[#fdf6f1]">
                <User className="size-6" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-bold leading-tight text-[#3a2228]">{USER.name}</p>
                <p className="truncate text-xs text-[#9a7d78]">{USER.email}</p>
              </div>
            </div>

            <nav className="mt-5 space-y-1">
              {NAV.map(({ id, label, icon: Icon }) => {
                const active = section === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSection(id)}
                    className={`flex w-full items-center gap-2.5 rounded-full px-3.5 py-2 text-left text-sm font-medium transition-colors ${
                      active
                        ? "bg-[#7b2e3c] text-[#fdf6f1]"
                        : "text-[#6a4a4f] hover:bg-[#f1ddd6]"
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    {label}
                  </button>
                );
              })}
            </nav>
          </Card>
        </aside>

        {/* ── content ── */}
        <section className="min-w-0 flex-1">
          {section === "account" && <AccountSection />}
          {section === "messages" && <MessagesSection />}
          {section === "stats" && <StatsSection />}
        </section>
      </div>
    </main>
  );
}

// ── Account ──────────────────────────────────────────────────────────────────
function AccountSection() {
  return (
    <Panel title="Account">
      <div className="space-y-5">
        {/* picture */}
        <Card className="flex items-center gap-5 p-5">
          <div className="flex size-20 items-center justify-center rounded-full bg-[#f1ddd6] text-[#c2a39c]">
            <User className="size-9" />
          </div>
          <div>
            <p className="font-semibold text-[#3a2228]">Profile picture</p>
            <p className="mb-3 text-sm text-[#9a7d78]">PNG or JPG, up to 2&nbsp;MB.</p>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#e2cbc2] bg-[#fdf6f1] px-3.5 py-1.5 text-sm font-medium text-[#6a4a4f] transition-colors hover:bg-[#f1ddd6]">
              <Camera className="size-4" />
              Change picture
              <input type="file" accept="image/*" className="hidden" />
            </label>
          </div>
        </Card>

        {/* email */}
        <Card className="space-y-3 p-5">
          <p className="flex items-center gap-2 font-semibold text-[#3a2228]">
            <Mail className="size-4 text-[#7b2e3c]" /> Email address
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="acc-email" className="text-[#6a4a4f]">
                New email
              </Label>
              <Input id="acc-email" type="email" defaultValue={USER.email} className={inputClass} />
            </div>
            <Button className={saveBtnClass}>Save email</Button>
          </div>
        </Card>

        {/* password */}
        <Card className="space-y-3 p-5">
          <p className="flex items-center gap-2 font-semibold text-[#3a2228]">
            <KeyRound className="size-4 text-[#7b2e3c]" /> Change password
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="cur-pass" className="text-[#6a4a4f]">
                Current
              </Label>
              <Input id="cur-pass" type="password" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-pass" className="text-[#6a4a4f]">
                New
              </Label>
              <Input id="new-pass" type="password" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-pass" className="text-[#6a4a4f]">
                Confirm
              </Label>
              <Input id="confirm-pass" type="password" className={inputClass} />
            </div>
          </div>
          <Button className={saveBtnClass}>Update password</Button>
        </Card>
      </div>
    </Panel>
  );
}

// ── Messages ─────────────────────────────────────────────────────────────────
function MessagesSection() {
  return (
    <Panel title="Sent Messages">
      <Card className="divide-y divide-[#e7d3ca]">
        {MESSAGES.map((msg) => (
          <div
            key={msg.subject}
            className="flex flex-wrap items-center justify-between gap-3 p-4"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-[#3a2228]">{msg.subject}</p>
              <p className="text-xs text-[#9a7d78]">
                Sent{" "}
                {new Date(msg.sentAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${STATUS_STYLE[msg.status]}`}
            >
              {msg.status}
            </span>
          </div>
        ))}
      </Card>
      <p className="mt-3 text-xs text-[#9a7d78]">
        Status updates as the recipient reads and replies.
      </p>
    </Panel>
  );
}

// ── Stats ────────────────────────────────────────────────────────────────────
function StatsSection() {
  const joined = new Date(USER.joined);
  const now = new Date();
  const daysMember = Math.max(
    0,
    Math.floor((now.getTime() - joined.getTime()) / 86_400_000),
  );
  const totalWins = WINS.reduce((sum, w) => sum + w.count, 0);

  // next anniversary
  const nextAnniv = new Date(joined);
  nextAnniv.setFullYear(now.getFullYear());
  if (nextAnniv < now) nextAnniv.setFullYear(now.getFullYear() + 1);
  const daysToAnniv = Math.ceil((nextAnniv.getTime() - now.getTime()) / 86_400_000);

  return (
    <Panel title="Stats">
      {/* identity header */}
      <div className="mb-7 flex items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-[#7b2e3c] to-[#9a3a4a] text-[#fdf6f1] shadow-[0_10px_24px_-10px_rgba(123,46,60,0.7)]">
          <User className="size-8" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-[#3a2228]">{USER.name}</h3>
          <p className="text-sm text-[#9a7d78]">
            {totalWins} total wins · {daysMember} days a member
          </p>
        </div>
      </div>

      {/* games won by difficulty */}
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#6a4a4f]">
        <Trophy className="size-4 text-[#7b2e3c]" /> Wins vs. bots
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {WINS.map((w) => {
          const pct = totalWins ? Math.round((w.count / totalWins) * 100) : 0;
          return (
            <Card key={w.level} className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#6a4a4f]">{w.level}</span>
                <span className="size-2.5 rounded-full" style={{ background: w.color }} />
              </div>
              <p className="mt-2 text-4xl font-bold text-[#3a2228]">{w.count}</p>
              {/* mini bar */}
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#f0ddd6]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, background: w.color }}
                />
              </div>
            </Card>
          );
        })}
      </div>

      {/* anniversary */}
      <p className="mt-8 mb-3 flex items-center gap-2 text-sm font-semibold text-[#6a4a4f]">
        <Calendar className="size-4 text-[#7b2e3c]" /> Account anniversary
      </p>
      <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm text-[#9a7d78]">Member since</p>
          <p className="text-xl font-semibold text-[#3a2228]">
            {joined.toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-[#9a7d78]">Next anniversary in</p>
          <p className="text-xl font-semibold text-[#7b2e3c]">{daysToAnniv} days</p>
        </div>
      </Card>
    </Panel>
  );
}
