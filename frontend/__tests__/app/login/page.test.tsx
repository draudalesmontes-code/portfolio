import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import LoginPage from "@/app/login/page";

const routerMocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
}));

const authMocks = vi.hoisted(() => ({
  refreshAuth: vi.fn(),
}));

const apiMocks = vi.hoisted(() => ({
  apiFetch: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => routerMocks,
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => authMocks,
}));

vi.mock("@/lib/api", () => ({
  apiFetch: apiMocks.apiFetch,
}));

async function completeForm() {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText("Email"), "  Diego@Example.com  ");
  await user.type(screen.getByLabelText("Password"), "password123");

  return user;
}

describe("LoginPage", () => {
  beforeEach(() => {
    routerMocks.push.mockReset();
    routerMocks.refresh.mockReset();
    authMocks.refreshAuth.mockReset();
    apiMocks.apiFetch.mockReset();
    authMocks.refreshAuth.mockResolvedValue({
      id: 1,
      email: "diego@example.com",
      displayName: "Diego",
      role: "USER",
      createdAt: "2026-03-04T12:00:00Z",
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("submits credentials and opens the account after login", async () => {
    apiMocks.apiFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        email: "diego@example.com",
        displayName: "Diego",
      }),
    } as Response);
    render(<LoginPage />);

    const user = await completeForm();
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(apiMocks.apiFetch).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email: "Diego@Example.com",
        password: "password123",
      }),
    });
    expect(routerMocks.push).toHaveBeenCalledWith("/account");
    expect(routerMocks.refresh).toHaveBeenCalledOnce();
    expect(authMocks.refreshAuth).toHaveBeenCalledOnce();
  });

  test("shows the shared invalid-credentials response", async () => {
    apiMocks.apiFetch.mockResolvedValue({
        ok: false,
        json: async () => ({
          timestamp: "2026-07-02T12:00:00Z",
          status: 401,
          message: "Invalid email or password.",
          path: "/auth/login",
          fields: {},
        }),
      } as Response);
    render(<LoginPage />);

    const user = await completeForm();
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(
      await screen.findByText("Invalid email or password."),
    ).toBeInTheDocument();
    expect(routerMocks.push).not.toHaveBeenCalled();
  });

  test("shows backend validation errors beside their fields", async () => {
    apiMocks.apiFetch.mockResolvedValue({
        ok: false,
        json: async () => ({
          timestamp: "2026-07-02T12:00:00Z",
          status: 400,
          message: "Validation failed",
          path: "/auth/login",
          fields: {
            email: "must be a well-formed email address",
          },
        }),
      } as Response);
    render(<LoginPage />);

    const user = await completeForm();
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(await screen.findByText("Validation failed")).toBeInTheDocument();
    expect(
      screen.getByText("must be a well-formed email address"),
    ).toBeInTheDocument();
  });

  test("prevents duplicate submissions while login is pending", async () => {
    let finishRequest!: (response: Response) => void;
    apiMocks.apiFetch.mockImplementation(
        () =>
          new Promise<Response>((resolve) => {
            finishRequest = resolve;
          }),
      );
    render(<LoginPage />);

    const user = await completeForm();
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(screen.getByRole("button", { name: "Signing in…" })).toBeDisabled();

    finishRequest({ ok: true } as Response);
    await vi.waitFor(() => {
      expect(routerMocks.push).toHaveBeenCalledWith("/account");
    });
  });
});
