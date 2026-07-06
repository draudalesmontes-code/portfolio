import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import ChatMessage from "@/components/chat/ChatMessage";

describe("ChatMessage", () => {
  test("renders user messages with the user bubble style", () => {
    render(<ChatMessage message={{ role: "user", content: "Hello" }} />);

    expect(screen.getByText("Hello")).toHaveClass("bg-foreground");
    expect(screen.getByText("Hello").parentElement?.parentElement).toHaveClass(
      "justify-end",
    );
  });

  test("renders assistant messages with the assistant bubble style", () => {
    render(<ChatMessage message={{ role: "assistant", content: "Hi!" }} />);

    expect(screen.getByText("Hi!")).toHaveClass("bg-background", "border");
    expect(screen.getByText("Hi!").parentElement?.parentElement).toHaveClass(
      "justify-start",
    );
  });

  test("renders citation sources when supplied", () => {
    render(
      <ChatMessage
        message={{
          role: "assistant",
          content: "I found this.",
          citations: [
            {
              chunk_text: "Portfolio information",
              source: "about.md",
              distance: 0.12,
            },
          ],
        }}
      />,
    );

    expect(screen.getByText("I found this.")).toBeInTheDocument();
    expect(screen.getByText("about.md")).toBeInTheDocument();
  });

  test("does not render citation pills for an empty citation list", () => {
    render(
      <ChatMessage
        message={{ role: "assistant", content: "No sources", citations: [] }}
      />,
    );

    expect(screen.queryByText("about.md")).not.toBeInTheDocument();
  });
});
