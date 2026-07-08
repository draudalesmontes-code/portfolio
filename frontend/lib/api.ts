"use client";

function readXsrfCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function ensureXsrfCookie(): Promise<void> {
  await fetch("/api/auth/csrf", {
    credentials: "include",
    cache: "no-store",
  });
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

  await ensureXsrfCookie();
  return fetchWithCsrf(input, init);
}

async function fetchWithCsrf(
  input: RequestInfo | URL,
  init: RequestInit,
): Promise<Response> {
  let token = readXsrfCookie();
  if (!token) {
    await ensureXsrfCookie();
    token = readXsrfCookie();
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
