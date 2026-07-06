import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import AccountPage from "@/app/account/page";
import type { AuthUser } from "@/hooks/useAuth";

const mocks = vi.hoisted(() => ({
  user: {
    id: 42,
    email: "diego@example.com",
    displayName: "Diego",
    role: "USER",
    createdAt: "2026-03-04T12:00:00Z",
  } as AuthUser | null,
  isLoading: false,
  logout: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  apiFetch: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: mocks.user,
    isLoading: mocks.isLoading,
    logout: mocks.logout,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mocks.replace,
    refresh: mocks.refresh,
  }),
}));

vi.mock("@/lib/api", () => ({
  apiFetch: mocks.apiFetch,
}));

describe("AccountPage", () => {
  beforeEach(() => {
    mocks.user = {
      id: 42,
      email: "diego@example.com",
      displayName: "Diego",
      role: "USER",
      createdAt: "2026-03-04T12:00:00Z",
    };
    mocks.isLoading = false;
    mocks.logout.mockReset();
    mocks.logout.mockResolvedValue(undefined);
    mocks.replace.mockReset();
    mocks.refresh.mockReset();
    mocks.apiFetch.mockReset();
    mocks.apiFetch.mockImplementation(async (input: RequestInfo | URL) => {
      if (String(input) === "/api/feedback/mine") {
        return {
          ok: true,
          json: async () => [
            {
              id: 2,
              subject: "Newest message",
              sentAt: "2026-07-02T12:00:00Z",
            },
            {
              id: 1,
              subject: "Older message",
              sentAt: "2026-07-01T12:00:00Z",
            },
          ],
        } as Response;
      }

      return {
        ok: true,
        json: async () => ({
          totalWins: 3,
          winsByDifficulty: [
            { level: "Easy", count: 2 },
            { level: "Medium", count: 0 },
            { level: "Hard", count: 1 },
          ],
          winsByGame: [
            { game: "Tic-Tac-Toe", count: 1 },
            { game: "Connect 4", count: 2 },
          ],
        }),
      } as Response;
    });
  });

  test("redirects unauthenticated visitors to login", async () => {
    mocks.user = null;

    render(<AccountPage />);

    expect(screen.getByText("Redirecting to sign in…")).toBeInTheDocument();
    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith("/login");
    });
    expect(mocks.apiFetch).not.toHaveBeenCalled();
  });

  test("shows the authenticated identity and logs out", async () => {
    const user = userEvent.setup();
    render(<AccountPage />);

    expect(screen.getByText("Diego")).toBeInTheDocument();
    expect(screen.getByText("diego@example.com")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Log out" }));

    expect(mocks.logout).toHaveBeenCalledOnce();
    expect(mocks.replace).toHaveBeenCalledWith("/login");
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  test("sent messages only show sent state and submission date", async () => {
    const user = userEvent.setup();
    render(<AccountPage />);

    await user.click(screen.getByRole("button", { name: "Messages" }));

    expect(await screen.findByText("Newest message")).toBeInTheDocument();
    expect(screen.getByText("Older message")).toBeInTheDocument();
    expect(screen.getAllByText("Sent")).toHaveLength(2);
    expect(mocks.apiFetch).toHaveBeenCalledWith("/api/feedback/mine");
    expect(screen.queryByText("read")).not.toBeInTheDocument();
    expect(screen.queryByText("responded")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Status updates as the recipient reads and replies."),
    ).not.toBeInTheDocument();
  });

  test("shows game statistics returned by the account endpoint", async () => {
    const user = userEvent.setup();
    render(<AccountPage />);

    await user.click(screen.getByRole("button", { name: "Stats" }));

    expect(await screen.findByText(/3 total wins/)).toBeInTheDocument();
    expect(screen.getByText("Easy")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(screen.getByText("Hard")).toBeInTheDocument();
    expect(screen.getByText("Tic-Tac-Toe")).toBeInTheDocument();
    expect(screen.getByText("Connect 4")).toBeInTheDocument();
    expect(mocks.apiFetch).toHaveBeenCalledWith("/api/games/stats");
  });

  test("shows an account-data error without losing the account page", async () => {
    const user = userEvent.setup();
    mocks.apiFetch.mockResolvedValue({
      ok: false,
      json: async () => ({}),
    } as Response);
    render(<AccountPage />);

    await user.click(screen.getByRole("button", { name: "Messages" }));

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("Unable to load your sent messages.");
    expect(screen.getByText("Diego")).toBeInTheDocument();
  });
});
