import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import Connect4 from "@/app/games/connect4/page";

const apiMocks = vi.hoisted(() => ({
  apiFetch: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  apiFetch: apiMocks.apiFetch,
}));

function emptyBoard(): null[][] {
  return Array.from(
    { length: 6 },
    () => Array<null>(7).fill(null),
  );
}

function successfulResponse(body: unknown): Response {
  return {
    ok: true,
    json: async () => body,
  } as Response;
}

async function renderPage(difficulty: string) {
  await act(async () => {
    render(
      <Connect4
        searchParams={Promise.resolve({
          difficulty,
        })}
      />,
    );
  });
}

describe("Connect 4 page", () => {
  beforeEach(() => {
    apiMocks.apiFetch.mockReset();
  });

  test("starts a game with the selected difficulty and color", async () => {
    const user = userEvent.setup();
    const board = emptyBoard();
    board[5][3] = null;
    apiMocks.apiFetch.mockResolvedValue(
      successfulResponse({
        sessionId: "connect-session",
        gameType: "CONNECT_FOUR",
        difficulty: "HARD",
        status: "IN_PROGRESS",
        board,
        humanPiece: "YELLOW",
        computerPiece: "RED",
        winner: null,
        computerMove: 3,
      }),
    );

    await renderPage("HARD");

    await user.click(
      await screen.findByRole("button", {
        name: "Play as YELLOW",
      }),
    );
    await user.click(screen.getByRole("button", { name: "Start game" }));

    expect(apiMocks.apiFetch).toHaveBeenCalledWith(
      "/api/games/connect4/sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          difficulty: "HARD",
          humanPiece: "YELLOW",
        }),
      },
    );
  });

  test("submits the selected column using the active session", async () => {
    const user = userEvent.setup();
    apiMocks.apiFetch
      .mockResolvedValueOnce(
        successfulResponse({
          sessionId: "connect-session",
          gameType: "CONNECT_FOUR",
          difficulty: "MEDIUM",
          status: "IN_PROGRESS",
          board: emptyBoard(),
          humanPiece: "RED",
          computerPiece: "YELLOW",
          winner: null,
          computerMove: null,
        }),
      )
      .mockResolvedValueOnce(
        successfulResponse({
          sessionId: "connect-session",
          gameType: "CONNECT_FOUR",
          difficulty: "MEDIUM",
          status: "IN_PROGRESS",
          board: emptyBoard(),
          humanPiece: "RED",
          computerPiece: "YELLOW",
          winner: null,
          computerMove: 2,
        }),
      );

    await renderPage("MEDIUM");

    await user.click(
      await screen.findByRole("button", { name: "Start game" }),
    );
    await user.click(
      await screen.findByRole("button", {
        name: "Drop a piece in column 4",
      }),
    );

    expect(apiMocks.apiFetch).toHaveBeenLastCalledWith(
      "/api/games/connect4/sessions/connect-session/moves",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ move: 3 }),
      },
    );
  });
});
