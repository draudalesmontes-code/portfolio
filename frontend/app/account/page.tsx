"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Calendar,
  Camera,
  KeyRound,
  LogOut,
  Mail,
  Trophy,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import type { AuthUser } from "@/hooks/useAuth";

type SentMessage = {
  id: number;
  subject: string;
  sentAt: string;
};

type GameStats = {
  totalWins: number;
  winsByDifficulty: {
    level: string;
    count: number;
  }[];
  winsByGame: {
    game: string;
    count: number;
  }[];
};

type ApiError = {
  message?: string;
  fields?: Record<string, string>;
};

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "#6f8f3f",
  Medium: "#c89a3c",
  Hard: "#7b2e3c",
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
  const router = useRouter();
  const { user, isLoading, logout, refreshAuth } = useAuth();
  const [section, setSection] = useState<Section>("account");
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [messages, setMessages] = useState<SentMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, router, user]);

  useEffect(() => {
    if (isLoading || !user) {
      return;
    }

    let active = true;

    async function loadMessages() {
      setMessagesLoading(true);
      setMessagesError(null);
      try {
        const response = await apiFetch("/api/feedback/mine");
        if (!response.ok) {
          throw new Error("Messages request failed.");
        }
        const data = (await response.json()) as SentMessage[];
        if (active) {
          setMessages(data);
        }
      } catch {
        if (active) {
          setMessagesError("Unable to load your sent messages.");
        }
      } finally {
        if (active) {
          setMessagesLoading(false);
        }
      }
    }

    async function loadStats() {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const response = await apiFetch("/api/games/stats");
        if (!response.ok) {
          throw new Error("Stats request failed.");
        }
        const data = (await response.json()) as GameStats;
        if (active) {
          setStats(data);
        }
      } catch {
        if (active) {
          setStatsError("Unable to load your game statistics.");
        }
      } finally {
        if (active) {
          setStatsLoading(false);
        }
      }
    }

    void loadMessages();
    void loadStats();

    return () => {
      active = false;
    };
  }, [isLoading, user]);

  async function handleLogout() {
    setLogoutError(null);
    try {
      await logout();
      router.replace("/login");
      router.refresh();
    } catch {
      setLogoutError("Unable to log out. Please try again.");
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f8efe8] via-[#f0dcd6] to-[#e6cbc6]">
        <p className="text-sm text-[#6a4a4f]" role="status">
          Loading your account…
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f8efe8] via-[#f0dcd6] to-[#e6cbc6]">
        <p className="text-sm text-[#6a4a4f]" role="status">
          Redirecting to sign in…
        </p>
      </main>
    );
  }

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
                <p className="truncate font-bold leading-tight text-[#3a2228]">
                  {user.displayName}
                </p>
                <p className="truncate text-xs text-[#9a7d78]">{user.email}</p>
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
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-full px-3.5 py-2 text-left text-sm font-medium text-[#7b2e3c] transition-colors hover:bg-[#f1ddd6]"
              >
                <LogOut className="size-4 shrink-0" />
                Log out
              </button>
            </nav>
            {logoutError && (
              <p className="mt-3 text-xs text-red-700" role="alert">
                {logoutError}
              </p>
            )}
          </Card>
        </aside>

        {/* ── content ── */}
        <section className="min-w-0 flex-1">
          {section === "account" && (
            <AccountSection user={user} refreshAuth={refreshAuth} />
          )}
          {section === "messages" && (
            <MessagesSection
              messages={messages}
              isLoading={messagesLoading}
              error={messagesError}
            />
          )}
          {section === "stats" && (
            <StatsSection
              displayName={user.displayName}
              createdAt={user.createdAt}
              stats={stats}
              isLoading={statsLoading}
              error={statsError}
            />
          )}
        </section>
      </div>
    </main>
  );
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

async function readApiError(response: Response, fallback: string) {
  const error = (await response.json().catch(() => ({}))) as ApiError;
  return error.message ?? fallback;
}

// ── Account ──────────────────────────────────────────────────────────────────
function AccountSection({
  user,
  refreshAuth,
}: {
  user: AuthUser;
  refreshAuth: () => Promise<AuthUser | null>;
}) {
  const [email, setEmail] = useState(user.email);
  const [profileImageUrl, setProfileImageUrl] = useState(
    user.profileImageUrl ?? "",
  );
  const [savedProfileImageUrl, setSavedProfileImageUrl] = useState(
    user.profileImageUrl ?? "",
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [imageStatus, setImageStatus] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isSavingImage, setIsSavingImage] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEmailStatus(null);
    setEmailError(null);

    const newEmail = email.trim();
    if (!newEmail) {
      setEmailError("Email is required.");
      return;
    }

    setIsSavingEmail(true);
    try {
      const response = await apiFetch("/api/auth/change-email", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail }),
      });

      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Unable to request email change."),
        );
      }

      setEmailStatus("Check the new email address to confirm this change.");
    } catch (error) {
      setEmailError(errorMessage(error, "Unable to request email change."));
    } finally {
      setIsSavingEmail(false);
    }
  }

  async function handleImageSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setImageStatus(null);
    setImageError(null);

    const nextProfileImageUrl = profileImageUrl.trim();
    if (
      nextProfileImageUrl
      && !/^https?:\/\/[^\s]+$/i.test(nextProfileImageUrl)
    ) {
      setImageError("Use a valid http:// or https:// image URL.");
      return;
    }

    setIsSavingImage(true);
    try {
      const response = await apiFetch("/api/auth/profile-image", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileImageUrl: nextProfileImageUrl || null,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Unable to update profile image."),
        );
      }

      const updatedUser = (await response.json()) as AuthUser;
      const updatedProfileImageUrl = updatedUser.profileImageUrl ?? "";
      setSavedProfileImageUrl(updatedProfileImageUrl);
      setProfileImageUrl(updatedProfileImageUrl);
      await refreshAuth();
      setImageStatus(
        updatedProfileImageUrl
          ? "Profile picture updated."
          : "Profile picture cleared.",
      );
    } catch (error) {
      setImageError(errorMessage(error, "Unable to update profile image."));
    } finally {
      setIsSavingImage(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordStatus(null);
    setPasswordError(null);

    if (!currentPassword || !newPassword) {
      setPasswordError("Current and new password are required.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsSavingPassword(true);
    try {
      const response = await apiFetch("/api/auth/change-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await readApiError(response, "Unable to update password."),
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordStatus("Password updated.");
    } catch (error) {
      setPasswordError(errorMessage(error, "Unable to update password."));
    } finally {
      setIsSavingPassword(false);
    }
  }

  return (
    <Panel title="Account">
      <div className="space-y-5">
        {/* picture */}
        <Card className="p-5">
          <form onSubmit={handleImageSubmit} className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {savedProfileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={savedProfileImageUrl}
                alt={user.displayName}
                className="size-20 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-20 items-center justify-center rounded-full bg-[#f1ddd6] text-[#c2a39c]">
                <User className="size-9" />
              </div>
            )}
            <div className="flex-1">
            <p className="font-semibold text-[#3a2228]">Profile picture</p>
            <p className="mb-3 text-sm text-[#9a7d78]">
              Paste a public image URL. Upload storage can be added later.
            </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  type="url"
                  value={profileImageUrl}
                  onChange={(event) =>
                    setProfileImageUrl(event.currentTarget.value)
                  }
                  placeholder="https://example.com/avatar.jpg"
                  className={inputClass}
                />
                <Button
                  type="submit"
                  className={saveBtnClass}
                  disabled={isSavingImage}
                >
                  <Camera className="mr-2 size-4" />
                  {isSavingImage ? "Saving…" : "Save image"}
                </Button>
              </div>
              {imageStatus && <p className="mt-2 text-sm text-green-700">{imageStatus}</p>}
              {imageError && <p className="mt-2 text-sm text-red-700" role="alert">{imageError}</p>}
            </div>
          </form>
        </Card>

        {/* email */}
        <Card className="space-y-3 p-5">
          <p className="flex items-center gap-2 font-semibold text-[#3a2228]">
            <Mail className="size-4 text-[#7b2e3c]" /> Email address
          </p>
          <form
            onSubmit={handleEmailSubmit}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="acc-email" className="text-[#6a4a4f]">
                New email
              </Label>
              <Input
                id="acc-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
                className={inputClass}
              />
            </div>
            <Button
              type="submit"
              className={saveBtnClass}
              disabled={isSavingEmail}
            >
              {isSavingEmail ? "Sending…" : "Save email"}
            </Button>
          </form>
          {emailStatus && <p className="text-sm text-green-700">{emailStatus}</p>}
          {emailError && <p className="text-sm text-red-700" role="alert">{emailError}</p>}
        </Card>

        {/* password */}
        <Card className="space-y-3 p-5">
          <p className="flex items-center gap-2 font-semibold text-[#3a2228]">
            <KeyRound className="size-4 text-[#7b2e3c]" /> Change password
          </p>
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="cur-pass" className="text-[#6a4a4f]">
                Current
              </Label>
              <Input
                id="cur-pass"
                type="password"
                value={currentPassword}
                onChange={(event) =>
                  setCurrentPassword(event.currentTarget.value)
                }
                autoComplete="current-password"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-pass" className="text-[#6a4a4f]">
                New
              </Label>
              <Input
                id="new-pass"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.currentTarget.value)}
                autoComplete="new-password"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-pass" className="text-[#6a4a4f]">
                Confirm
              </Label>
              <Input
                id="confirm-pass"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.currentTarget.value)
                }
                autoComplete="new-password"
                className={inputClass}
              />
            </div>
            </div>
            <Button
              type="submit"
              className={saveBtnClass}
              disabled={isSavingPassword}
            >
              {isSavingPassword ? "Updating…" : "Update password"}
            </Button>
          </form>
          {passwordStatus && <p className="text-sm text-green-700">{passwordStatus}</p>}
          {passwordError && <p className="text-sm text-red-700" role="alert">{passwordError}</p>}
        </Card>
      </div>
    </Panel>
  );
}

// ── Messages ─────────────────────────────────────────────────────────────────
function MessagesSection({
  messages,
  isLoading,
  error,
}: {
  messages: SentMessage[];
  isLoading: boolean;
  error: string | null;
}) {
  return (
    <Panel title="Sent Messages">
      {isLoading && (
        <p role="status" className="text-sm text-[#9a7d78]">
          Loading sent messages…
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      {!isLoading && !error && messages.length === 0 && (
        <Card className="p-5 text-sm text-[#9a7d78]">
          You have not sent any messages yet.
        </Card>
      )}
      {!isLoading && !error && messages.length > 0 && (
      <Card className="divide-y divide-[#e7d3ca]">
        {messages.map((msg) => (
          <div
            key={msg.id}
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
            <span className="shrink-0 rounded-full bg-[#3a2228]/8 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#6a4a4f]">
              Sent
            </span>
          </div>
        ))}
      </Card>
      )}
    </Panel>
  );
}

// ── Stats ────────────────────────────────────────────────────────────────────
function StatsSection({
  displayName,
  createdAt,
  stats,
  isLoading,
  error,
}: {
  displayName: string;
  createdAt: string;
  stats: GameStats | null;
  isLoading: boolean;
  error: string | null;
}) {
  const joined = new Date(createdAt);
  const now = new Date();
  const daysMember = Math.max(
    0,
    Math.floor((now.getTime() - joined.getTime()) / 86_400_000),
  );
  const totalWins = stats?.totalWins ?? 0;

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
          <h3 className="text-2xl font-bold text-[#3a2228]">{displayName}</h3>
          <p className="text-sm text-[#9a7d78]">
            {totalWins} total wins · {daysMember} days a member
          </p>
        </div>
      </div>

      {isLoading && (
        <p role="status" className="text-sm text-[#9a7d78]">
          Loading game statistics…
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {!isLoading && !error && stats && (
        <>
      {/* games won by difficulty */}
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#6a4a4f]">
        <Trophy className="size-4 text-[#7b2e3c]" /> Wins vs. bots
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.winsByDifficulty.map((w) => {
          const pct = totalWins ? Math.round((w.count / totalWins) * 100) : 0;
          const color = DIFFICULTY_COLORS[w.level] ?? "#7b2e3c";
          return (
            <Card key={w.level} className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#6a4a4f]">{w.level}</span>
                <span className="size-2.5 rounded-full" style={{ background: color }} />
              </div>
              <p className="mt-2 text-4xl font-bold text-[#3a2228]">{w.count}</p>
              {/* mini bar */}
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#f0ddd6]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
            </Card>
          );
        })}
      </div>

      <p className="mt-8 mb-3 flex items-center gap-2 text-sm font-semibold text-[#6a4a4f]">
        <BarChart3 className="size-4 text-[#7b2e3c]" /> Wins by game
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {stats.winsByGame.map((game) => (
          <Card key={game.game} className="p-4">
            <p className="text-sm font-medium text-[#6a4a4f]">
              {game.game}
            </p>
            <p className="mt-2 text-4xl font-bold text-[#3a2228]">
              {game.count}
            </p>
          </Card>
        ))}
      </div>
        </>
      )}

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
