import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import RegisterPage from "@/app/register/page";

const apiMocks = vi.hoisted(() => ({
  apiFetch: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  apiFetch: apiMocks.apiFetch,
}));

async function completeForm(
  password = "password123",
  confirmPassword = password,
) {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText("Full name"), "  Diego Raudales  ");
  await user.type(screen.getByLabelText("Email"), "  Diego@Example.com  ");
  await user.type(screen.getByLabelText("Password"), password);
  await user.type(screen.getByLabelText("Confirm password"), confirmPassword);

  return user;
}

describe("RegisterPage", () => {
  beforeEach(() => {
    apiMocks.apiFetch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("submits the backend request and shows the verification state", async () => {
    apiMocks.apiFetch.mockResolvedValue({ ok: true } as Response);
    render(<RegisterPage />);

    const user = await completeForm();
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(apiMocks.apiFetch).toHaveBeenCalledOnce();
    expect(apiMocks.apiFetch).toHaveBeenCalledWith("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        displayName: "Diego Raudales",
        email: "Diego@Example.com",
        password: "password123",
      }),
    });
    expect(await screen.findByText("Check your email")).toBeInTheDocument();
    expect(
      screen.getByText(
        "We sent you a verification link. Open it before signing in.",
      ),
    ).toBeInTheDocument();
  });

  test("does not submit when the confirmation password differs", async () => {
    render(<RegisterPage />);

    const user = await completeForm("password123", "different123");
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
    expect(apiMocks.apiFetch).not.toHaveBeenCalled();
  });

  test("shows backend validation errors beside the matching field", async () => {
    apiMocks.apiFetch.mockResolvedValue({
        ok: false,
        json: async () => ({
          timestamp: "2026-07-02T12:00:00Z",
          status: 400,
          message: "Validation failed",
          path: "/auth/register",
          fields: {
            email: "must be a well-formed email address",
          },
        }),
      } as Response);
    render(<RegisterPage />);

    const user = await completeForm();
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Validation failed")).toBeInTheDocument();
    expect(
      screen.getByText("must be a well-formed email address"),
    ).toBeInTheDocument();
  });

  test("disables duplicate submissions while registration is pending", async () => {
    let finishRequest!: (response: Response) => void;
    apiMocks.apiFetch.mockImplementation(
        () =>
          new Promise<Response>((resolve) => {
            finishRequest = resolve;
          }),
      );
    render(<RegisterPage />);

    const user = await completeForm();
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(
      screen.getByRole("button", { name: "Creating account…" }),
    ).toBeDisabled();

    finishRequest({ ok: true } as Response);
    expect(await screen.findByText("Check your email")).toBeInTheDocument();
  });
});
