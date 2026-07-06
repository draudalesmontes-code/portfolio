import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import ContactPage from "@/app/contact/page";

const apiMocks = vi.hoisted(() => ({
  apiFetch: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  apiFetch: apiMocks.apiFetch,
}));

function successfulResponse(): Response {
  return { ok: true } as Response;
}

async function completeForm() {
  const user = userEvent.setup();

  await user.type(screen.getByLabelText("First name"), "  Diego");
  await user.type(screen.getByLabelText("Last name"), "Alvarez  ");
  await user.type(screen.getByLabelText("Email"), "  DIEGO@example.com  ");
  await user.type(screen.getByLabelText("Message"), "  Hello there!  ");

  return user;
}

describe("ContactPage", () => {
  beforeEach(() => {
    apiMocks.apiFetch.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("submits the normalized API payload and shows the success state", async () => {
    apiMocks.apiFetch.mockResolvedValue(successfulResponse());
    render(<ContactPage />);

    const user = await completeForm();
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(apiMocks.apiFetch).toHaveBeenCalledOnce();
    expect(apiMocks.apiFetch).toHaveBeenCalledWith("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        authorName: "Diego Alvarez",
        contactEmail: "DIEGO@example.com",
        message: "Hello there!",
      }),
    });
    expect(
      await screen.findByText("Thanks for reaching out! 🌿"),
    ).toBeInTheDocument();
  });

  test("disables submission while the request is pending", async () => {
    let finishRequest!: (response: Response) => void;
    apiMocks.apiFetch.mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          finishRequest = resolve;
        }),
    );
    render(<ContactPage />);

    const user = await completeForm();
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(screen.getByRole("button", { name: "Sending…" })).toBeDisabled();

    finishRequest(successfulResponse());
    expect(
      await screen.findByText("Thanks for reaching out! 🌿"),
    ).toBeInTheDocument();
  });

  test("renders API validation errors beside their fields", async () => {
    apiMocks.apiFetch.mockResolvedValue({
      ok: false,
      json: async () => ({
        timestamp: "2026-07-02T12:00:00Z",
        status: 400,
        message: "Validation failed.",
        path: "/feedback",
        fields: {
          contactEmail: "Please provide a valid email address.",
        },
      }),
    } as Response);
    render(<ContactPage />);

    const user = await completeForm();
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(await screen.findByText("Validation failed.")).toBeInTheDocument();
    expect(
      screen.getByText("Please provide a valid email address."),
    ).toBeInTheDocument();
  });

  test("shows a recoverable message when the network request fails", async () => {
    apiMocks.apiFetch.mockRejectedValue(new TypeError("offline"));
    render(<ContactPage />);

    const user = await completeForm();
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(
      await screen.findByText(
        "Unable to send your message. Please try again.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send message" })).toBeEnabled();
  });
});
