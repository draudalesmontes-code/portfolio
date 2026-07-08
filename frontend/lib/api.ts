"use client";

function readXsrfCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function fetchCsrfToken(): Promise<string | null> {
  try {
    const res = await fetch("/api/auth/csrf", {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { token?: string };
    // Prefer body (works even with HttpOnly cookie), fall back to cookie
    return data.token ?? readXsrfCookie();
  } catch {
    return readXsrfCookie();
  }
}

export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase();
  const requiresCsrf = !["GET", "HEAD", "OPTIONS", "TRACE"].includes(method);

  if (!requiresCsrf) {
    return fetch(input, {
      ...init,
      credentials: init.credentials ?? "include",
    });
  }

  const response = await fetchWithCsrf(input, init);

  if (![401, 403].includes(response.status)) {
    return response;
  }

  // Retry once with a freshly fetched token
  return fetchWithCsrf(input, init, true);
}

async function fetchWithCsrf(
  input: RequestInfo | URL,
  init: RequestInit,
  forceFresh = false,
): Promise<Response> {
  let token = forceFresh ? null : readXsrfCookie();
  if (!token) {
    token = await fetchCsrfToken();
  }

  const headers = new Headers(init.headers);
  if (token) {
    headers.set("X-XSRF-TOKEN", token);
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: init.credentials ?? "include",
  });
}
