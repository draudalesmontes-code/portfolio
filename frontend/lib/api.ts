"use client";

type CsrfResponse = {
  token: string;
  headerName: string;
};

let csrfPromise: Promise<CsrfResponse> | null = null;

async function loadCsrfToken(): Promise<CsrfResponse> {
  csrfPromise ??= fetch("/api/auth/csrf", {
    credentials: "include",
    cache: "no-store",
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error("Unable to initialize request security.");
    }
    return response.json() as Promise<CsrfResponse>;
  });

  return csrfPromise;
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

  const csrf = await loadCsrfToken();
  const headers = new Headers(init.headers);
  headers.set(csrf.headerName, csrf.token);

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: init.credentials ?? "include",
  });

  if (response.status === 403) {
    csrfPromise = null;
  }
  return response;
}
