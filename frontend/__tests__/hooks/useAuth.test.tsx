import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import {
  AuthProvider,
  useAuth,
  type AuthUser,
} from "@/hooks/useAuth";

const apiMocks = vi.hoisted(() => ({
  apiFetch: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  apiFetch: apiMocks.apiFetch,
}));

const authenticatedUser: AuthUser = {
  id: 42,
  email: "diego@example.com",
  displayName: "Diego",
  role: "USER",
  createdAt: "2026-03-04T12:00:00Z",
};

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("useAuth", () => {
  afterEach(() => {
    apiMocks.apiFetch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("starts loading and becomes unauthenticated after a 401", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 401 } as Response),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  test("loads the authenticated user from the HTTP-only cookie session", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => authenticatedUser,
      } as Response),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    expect(result.current.user).toEqual(authenticatedUser);
  });

  test("logout expires the backend cookie and clears the user", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => authenticatedUser,
      } as Response);
    vi.stubGlobal("fetch", fetchMock);
    apiMocks.apiFetch.mockResolvedValue({ ok: true } as Response);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    await act(async () => {
      await result.current.logout();
    });

    expect(apiMocks.apiFetch).toHaveBeenCalledWith("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
