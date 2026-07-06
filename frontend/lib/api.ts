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
  const response = await fetchWithCsrf(input, init, csrf);

  if (![401, 403].includes(response.status)) {
    return response;
  }

  csrfPromise = null;
  const freshCsrf = await loadCsrfToken();
  return fetchWithCsrf(input, init, freshCsrf);
}

async function fetchWithCsrf(
  input: RequestInfo | URL,
  init: RequestInit,
  csrf: CsrfResponse,
): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set(csrf.headerName, csrf.token);

  const response = await fetch(input, {
    ...init,
    headers,
    credentials: init.credentials ?? "include",
  });

  if ([401, 403].includes(response.status)) {
    csrfPromise = null;
  }

  return response;
}
