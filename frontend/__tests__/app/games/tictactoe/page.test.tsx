import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import TicTacToe from "@/app/games/tictactoe/page";

const apiMocks = vi.hoisted(() => ({
  apiFetch: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  apiFetch: apiMocks.apiFetch,
}));

function successfulResponse(body: unknown): Response {
  return {
    ok: true,
    json: async () => body,
  } as Response;
}

const emptyBoard = Array<string | null>(9).fill(null);

async function renderPage(difficulty: string) {
  await act(async () => {
    render(
      <TicTacToe
        searchParams={Promise.resolve({
          difficulty,
        })}
      />,
    );
  });
}

describe("TicTacToe page", () => {
  beforeEach(() => {
    apiMocks.apiFetch.mockReset();
  });

  test("starts a game with the selected difficulty and symbol", async () => {
    const user = userEvent.setup();
    apiMocks.apiFetch.mockResolvedValue(
      successfulResponse({
        sessionId: "ttt-session",
        gameType: "TIC_TAC_TOE",
        difficulty: "HARD",
        status: "IN_PROGRESS",
        board: ["X", ...emptyBoard.slice(1)],
        humanPiece: "O",
        computerPiece: "X",
        winner: null,
        computerMove: 0,
      }),
    );

    await renderPage("HARD");

    await user.click(await screen.findByRole("button", { name: "O" }));
    await user.click(screen.getByRole("button", { name: "Start game" }));

    expect(apiMocks.apiFetch).toHaveBeenCalledWith(
      "/api/games/tictactoe/sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          difficulty: "HARD",
          humanSymbol: "O",
        }),
      },
    );
    expect(
      await screen.findByRole("button", {
        name: "Position 1: X",
      }),
    ).toBeDisabled();
  });

  test("submits a move using the active session", async () => {
    const user = userEvent.setup();
    apiMocks.apiFetch
      .mockResolvedValueOnce(
        successfulResponse({
          sessionId: "ttt-session",
          gameType: "TIC_TAC_TOE",
          difficulty: "MEDIUM",
          status: "IN_PROGRESS",
          board: emptyBoard,
          humanPiece: "X",
          computerPiece: "O",
          winner: null,
          computerMove: null,
        }),
      )
      .mockResolvedValueOnce(
        successfulResponse({
          sessionId: "ttt-session",
          gameType: "TIC_TAC_TOE",
          difficulty: "MEDIUM",
          status: "IN_PROGRESS",
          board: [null, "X", null, null, "O", null, null, null, null],
          humanPiece: "X",
          computerPiece: "O",
          winner: null,
          computerMove: 4,
        }),
      );

    await renderPage("MEDIUM");

    await user.click(
      await screen.findByRole("button", { name: "Start game" }),
    );
    await user.click(
      await screen.findByRole("button", {
        name: "Play position 2",
      }),
    );

    expect(apiMocks.apiFetch).toHaveBeenLastCalledWith(
      "/api/games/tictactoe/sessions/ttt-session/moves",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ move: 1 }),
      },
    );
    expect(
      await screen.findByRole("button", {
        name: "Position 2: X",
      }),
    ).toBeDisabled();
  });

  test("shows a backend error when a game cannot start", async () => {
    const user = userEvent.setup();
    apiMocks.apiFetch.mockResolvedValue({
      ok: false,
      json: async () => ({
        message: "Game service is unavailable.",
      }),
    } as Response);

    await renderPage("EASY");

    await user.click(
      await screen.findByRole("button", { name: "Start game" }),
    );

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("Game service is unavailable.");
  });
});
