"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { use, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  isDifficulty,
  readApiErrorMessage,
  type Difficulty,
  type GameState,
} from "@/lib/games";

type TicTacToeSymbol = "X" | "O";
type TicTacToeCell = TicTacToeSymbol | null;
type TicTacToeGameState = GameState<
  TicTacToeCell[],
  TicTacToeSymbol
>;

type TicTacToePageProps = {
  searchParams: Promise<{
    difficulty?: string | string[];
  }>;
};

const EMPTY_BOARD: TicTacToeCell[] =
  Array<TicTacToeCell>(9).fill(null);

function gameMessage(
  game: TicTacToeGameState | null,
  isLoading: boolean,
): string {
  if (isLoading) {
    return game ? "Computer is thinking…" : "Starting game…";
  }
  if (!game) {
    return "Choose your symbol, then start the game.";
  }
  if (game.status === "HUMAN_WON") {
    return `You won as ${game.humanPiece}!`;
  }
  if (game.status === "COMPUTER_WON") {
    return `The computer won as ${game.computerPiece}.`;
  }
  if (game.status === "DRAW") {
    return "Draw game.";
  }
  return `Your turn — play ${game.humanPiece}.`;
}

export default function TicTacToe({
  searchParams,
}: TicTacToePageProps) {
  const params = use(searchParams);
  const difficulty: Difficulty = isDifficulty(params.difficulty)
    ? params.difficulty
    : "MEDIUM";

  const [humanSymbol, setHumanSymbol] =
    useState<TicTacToeSymbol>("X");
  const [game, setGame] =
    useState<TicTacToeGameState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const board = game?.board ?? EMPTY_BOARD;
  const gameIsFinished =
    game !== null && game.status !== "IN_PROGRESS";

  async function startGame() {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch(
        "/api/games/tictactoe/sessions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            difficulty,
            humanSymbol,
          }),
        },
      );

      if (!response.ok) {
        setError(
          await readApiErrorMessage(
            response,
            "Unable to start Tic-Tac-Toe.",
          ),
        );
        return;
      }

      setGame((await response.json()) as TicTacToeGameState);
    } catch {
      setError("Unable to reach the game server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function makeMove(index: number) {
    if (
      !game ||
      isLoading ||
      game.status !== "IN_PROGRESS" ||
      board[index] !== null
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch(
        `/api/games/tictactoe/sessions/${game.sessionId}/moves`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ move: index }),
        },
      );

      if (!response.ok) {
        setError(
          await readApiErrorMessage(
            response,
            "Unable to play that move.",
          ),
        );
        return;
      }

      setGame((await response.json()) as TicTacToeGameState);
    } catch {
      setError("Unable to reach the game server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function changeSettings() {
    if (isLoading) {
      return;
    }
    setGame(null);
    setError(null);
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 bg-[#f4f1e9] px-4 py-12">
      <div className="text-center">
        <h1 className="font-arcade text-3xl text-[#161514] sm:text-5xl">
          Tic-Tac-Toe
        </h1>
        <p className="mt-3 font-arcade text-xs text-[#6a4a4f]">
          {difficulty} difficulty
        </p>
      </div>

      {!game && (
        <section
          aria-label="Game settings"
          className="flex flex-col items-center gap-4"
        >
          <p className="font-arcade text-xs text-[#161514]">
            Choose your symbol
          </p>
          <div className="flex gap-4">
            {(["X", "O"] as const).map((symbol) => (
              <button
                key={symbol}
                type="button"
                aria-pressed={humanSymbol === symbol}
                onClick={() => setHumanSymbol(symbol)}
                className={`size-16 border-4 border-[#161514] font-arcade text-3xl shadow-[4px_4px_0_0_#161514] ${
                  humanSymbol === symbol
                    ? "bg-[#ffd23f]"
                    : "bg-white"
                }`}
              >
                {symbol}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={isLoading}
            onClick={startGame}
            className="rounded-full border-4 border-[#161514] bg-[#5ad469] px-6 py-3 font-arcade text-xs text-[#161514] shadow-[4px_4px_0_0_#161514] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Starting…" : "Start game"}
          </button>
        </section>
      )}

      <p
        aria-live="polite"
        className="min-h-5 text-center font-arcade text-xs text-[#6a4a4f]"
      >
        {gameMessage(game, isLoading)}
      </p>

      {error && (
        <p
          role="alert"
          className="max-w-sm rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div
        className="grid w-full max-w-sm grid-cols-3 gap-1 bg-[#161514] p-1 shadow-[8px_8px_0_0_#161514]"
        aria-label="Tic-Tac-Toe board"
      >
        {board.map((symbol, index) => (
          <button
            key={index}
            type="button"
            disabled={
              !game ||
              isLoading ||
              gameIsFinished ||
              symbol !== null
            }
            onClick={() => makeMove(index)}
            aria-label={
              symbol
                ? `Position ${index + 1}: ${symbol}`
                : `Play position ${index + 1}`
            }
            className="aspect-square bg-[#f4f1e9] font-arcade text-5xl transition-colors hover:bg-cyan-100 focus-visible:outline-4 focus-visible:outline-offset-[-4px] focus-visible:outline-cyan-500 disabled:cursor-not-allowed"
          >
            <span
              className={
                symbol === "X"
                  ? "text-[#e63946]"
                  : "text-[#2f6fed]"
              }
            >
              {symbol}
            </span>
          </button>
        ))}
      </div>

      {game && (
        <div className="flex flex-wrap justify-center gap-4">
          <button
            type="button"
            disabled={isLoading}
            onClick={startGame}
            className="rounded-full border-4 border-[#161514] bg-[#ffd23f] px-6 py-3 font-arcade text-xs text-[#161514] shadow-[4px_4px_0_0_#161514] disabled:cursor-not-allowed disabled:opacity-60"
          >
            New game
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={changeSettings}
            className="rounded-full border-4 border-[#161514] bg-white px-6 py-3 font-arcade text-xs text-[#161514] shadow-[4px_4px_0_0_#161514] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Change symbol
          </button>
        </div>
      )}

      <Link
        href="/games"
        className="font-arcade text-[10px] text-[#2f6fed] underline underline-offset-4"
      >
        Back to games
      </Link>
    </main>
  );
}
