import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import ChatWidget from "@/components/chat/ChatWidget";

function streamedResponse(text: string, sessionId: string | null = null): Response {
  const chunks = [new TextEncoder().encode(text)];

  return {
    ok: true,
    headers: {
      get: (name: string) =>
        name.toLowerCase() === "x-session-id" ? sessionId : null,
    },
    body: {
      getReader: () => ({
        read: async () =>
          chunks.length > 0
            ? { done: false, value: chunks.shift() }
            : { done: true, value: undefined },
      }),
    },
  } as unknown as Response;
}

function getSubmitButton(): HTMLButtonElement {
  const input = screen.getByPlaceholderText("Ask something about Diego...");
  const button = input.closest("form")?.querySelector("button[type='submit']");

  if (!(button instanceof HTMLButtonElement)) {
    throw new Error("Chat submit button was not found.");
  }

  return button;
}

describe("ChatWidget", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("renders the chat controls and updates the input", async () => {
    const user = userEvent.setup();
    render(<ChatWidget onClose={vi.fn()} />);

    const input = screen.getByPlaceholderText("Ask something about Diego...");
    expect(input).toBeInTheDocument();
    expect(getSubmitButton()).toBeEnabled();

    await user.type(input, "Tell me about Diego");
    expect(input).toHaveValue("Tell me about Diego");
  });

  test("submits a message and displays the streamed reply", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(streamedResponse("Hello from the assistant"));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<ChatWidget onClose={vi.fn()} />);

    await user.type(
      screen.getByPlaceholderText("Ask something about Diego..."),
      "Hello",
    );
    await user.click(getSubmitButton());

    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(
      await screen.findByText("Hello from the assistant"),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Hello",
        provider: "groq",
      }),
    });
  });

  test("disables submission while a response is pending", async () => {
    let finishRequest!: (response: Response) => void;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(
        () =>
          new Promise<Response>((resolve) => {
            finishRequest = resolve;
          }),
      ),
    );
    const user = userEvent.setup();
    render(<ChatWidget onClose={vi.fn()} />);

    await user.type(
      screen.getByPlaceholderText("Ask something about Diego..."),
      "Wait for it",
    );
    await user.click(getSubmitButton());

    expect(getSubmitButton()).toBeDisabled();

    finishRequest(streamedResponse("Done"));
    expect(await screen.findByText("Done")).toBeInTheDocument();
    expect(getSubmitButton()).toBeEnabled();
  });

  test("uses the server session id on the next message", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(streamedResponse("First reply", "session-123"))
      .mockResolvedValueOnce(streamedResponse("Second reply"));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<ChatWidget onClose={vi.fn()} />);
    const input = screen.getByPlaceholderText("Ask something about Diego...");

    await user.type(input, "First");
    await user.click(getSubmitButton());
    await screen.findByText("First reply");

    await user.type(input, "Second");
    await user.click(getSubmitButton());
    await screen.findByText("Second reply");

    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({
      message: "Second",
      session_id: "session-123",
    });
  });

  test("renders the API error when the chat request is rejected", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ detail: "Rate limit reached" }),
      }),
    );
    const user = userEvent.setup();
    render(<ChatWidget onClose={vi.fn()} />);

    await user.type(
      screen.getByPlaceholderText("Ask something about Diego..."),
      "Hello",
    );
    await user.click(getSubmitButton());

    expect(
      await screen.findByText("Error: Rate limit reached"),
    ).toBeInTheDocument();
    expect(getSubmitButton()).toBeEnabled();
  });
});
