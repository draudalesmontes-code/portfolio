import { afterEach, describe, expect, test, vi } from "vitest";

describe("apiFetch", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  test("loads a CSRF token and sends it on unsafe requests", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: "csrf-token",
          headerName: "X-XSRF-TOKEN",
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
      } as Response);
    vi.stubGlobal("fetch", fetchMock);

    const { apiFetch } = await import("@/lib/api");
    await apiFetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "{}",
    });

    expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/auth/csrf", {
      credentials: "include",
      cache: "no-store",
    });

    const [, request] = fetchMock.mock.calls[1];
    expect(fetchMock.mock.calls[1][0]).toBe("/api/feedback");
    expect(request.method).toBe("POST");
    expect(request.credentials).toBe("include");
    expect(request.headers.get("Content-Type")).toBe("application/json");
    expect(request.headers.get("X-XSRF-TOKEN")).toBe("csrf-token");
  });

  test("refreshes CSRF token and retries once after an unauthorized unsafe request", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: "stale-token",
          headerName: "X-XSRF-TOKEN",
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: "fresh-token",
          headerName: "X-XSRF-TOKEN",
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
      } as Response);
    vi.stubGlobal("fetch", fetchMock);

    const { apiFetch } = await import("@/lib/api");
    const response = await apiFetch("/api/auth/register", {
      method: "POST",
      body: "{}",
    });

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(4);
    expect(fetchMock.mock.calls[1][1].headers.get("X-XSRF-TOKEN")).toBe(
      "stale-token",
    );
    expect(fetchMock.mock.calls[3][1].headers.get("X-XSRF-TOKEN")).toBe(
      "fresh-token",
    );
  });
});
