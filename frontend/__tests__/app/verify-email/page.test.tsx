import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { VerifyEmailContent } from "@/app/verify-email/page";

const searchParamsMock = vi.hoisted(() => ({
  token: "verification-token" as string | null,
}));

const apiMocks = vi.hoisted(() => ({
  apiFetch: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (key: string) => (key === "token" ? searchParamsMock.token : null),
  }),
}));

vi.mock("@/lib/api", () => ({
  apiFetch: apiMocks.apiFetch,
}));

describe("VerifyEmailContent", () => {
  beforeEach(() => {
    searchParamsMock.token = "verification-token";
    apiMocks.apiFetch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("verifies the token and shows the sign-in action", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true } as Response);
    vi.stubGlobal("fetch", fetchMock);

    render(<VerifyEmailContent />);

    expect(await screen.findByText("Email verified")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/verify?token=verification-token",
      {
        credentials: "include",
      },
    );
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  test("can request a replacement verification link", async () => {
    searchParamsMock.token = null;
    apiMocks.apiFetch.mockResolvedValue({ ok: true } as Response);
    const user = userEvent.setup();

    render(<VerifyEmailContent />);

    await user.type(
      screen.getByLabelText("Email"),
      "  Diego@Example.com  ",
    );
    await user.click(
      screen.getByRole("button", { name: "Resend verification email" }),
    );

    expect(apiMocks.apiFetch).toHaveBeenCalledWith(
      "/api/auth/resend-verification",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: "Diego@Example.com" }),
      },
    );
    expect(
      await screen.findByText(
        "If that account exists and still needs verification, a new link was sent.",
      ),
    ).toBeInTheDocument();
  });
});
