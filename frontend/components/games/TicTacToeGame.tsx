"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  readApiErrorMessage,
  type Difficulty,
  type GameState,
} from "@/lib/games";

export type TicTacToeSymbol = "X" | "O";
export type TicTacToeCell = TicTacToeSymbol | null;

type TicTacToeGameState = GameState<
  TicTacToeCell[],
  TicTacToeSymbol
>;

type TicTacToeGameProps = {
  difficulty: Difficulty;
  compact?: boolean;
  onBack?: () => void;
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

export default function TicTacToeGame({
  difficulty,
  compact = false,
  onBack,
}: TicTacToeGameProps) {
  const [humanSymbol, setHumanSymbol] =
    useState<TicTacToeSymbol>("X");
  const [game, setGame] =
    useState<TicTacToeGameState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const board = game?.board ?? EMPTY_BOARD;
  const gameIsFinished =
    game !== null && game.status !== "IN_PROGRESS";
  const headingColor = compact ? "text-[#f4f1e9]" : "text-[#161514]";
  const mutedColor = compact ? "text-cyan-300" : "text-[#6a4a4f]";
  const promptColor = compact ? "text-[#f4f1e9]" : "text-[#161514]";

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
    <section
      className={`flex w-full flex-col items-center ${
        compact ? "gap-3 px-3 py-4" : "gap-8"
      }`}
      aria-label="Tic-Tac-Toe game"
    >
      <div className="text-center">
        <h2
          className={`font-arcade ${headingColor} ${
            compact ? "text-sm" : "text-3xl sm:text-5xl"
          }`}
        >
          Tic-Tac-Toe
        </h2>
        <p className={`mt-2 font-arcade text-[9px] ${mutedColor}`}>
          {difficulty} difficulty
        </p>
      </div>

      {!game && (
        <div
          aria-label="Game settings"
          className="flex flex-col items-center gap-3"
        >
          <p className={`font-arcade text-[9px] ${promptColor}`}>
            Choose your symbol
          </p>
          <div className="flex gap-3">
            {(["X", "O"] as const).map((symbol) => (
              <button
                key={symbol}
                type="button"
                aria-pressed={humanSymbol === symbol}
                onClick={() => setHumanSymbol(symbol)}
                className={`border-4 border-[#161514] font-arcade shadow-[4px_4px_0_0_#161514] ${
                  compact ? "size-12 text-2xl" : "size-16 text-3xl"
                } ${
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
            className="rounded-full border-4 border-[#161514] bg-[#5ad469] px-5 py-2 font-arcade text-[9px] text-[#161514] shadow-[4px_4px_0_0_#161514] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Starting…" : "Start game"}
          </button>
        </div>
      )}

      <p
        aria-live="polite"
        className={`min-h-5 max-w-sm text-center font-arcade text-[9px] leading-5 ${mutedColor}`}
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
        className={`grid w-full grid-cols-3 gap-1 bg-[#161514] p-1 shadow-[6px_6px_0_0_#161514] ${
          compact ? "max-w-[15rem]" : "max-w-sm"
        }`}
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
            className={`aspect-square bg-[#f4f1e9] font-arcade transition-colors hover:bg-cyan-100 focus-visible:outline-4 focus-visible:outline-offset-[-4px] focus-visible:outline-cyan-500 disabled:cursor-not-allowed ${
              compact ? "text-3xl" : "text-5xl"
            }`}
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

      <div className="flex flex-wrap justify-center gap-3">
        {game && (
          <>
            <button
              type="button"
              disabled={isLoading}
              onClick={startGame}
              className="rounded-full border-4 border-[#161514] bg-[#ffd23f] px-4 py-2 font-arcade text-[9px] text-[#161514] shadow-[4px_4px_0_0_#161514] disabled:cursor-not-allowed disabled:opacity-60"
            >
              New game
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={changeSettings}
              className="rounded-full border-4 border-[#161514] bg-white px-4 py-2 font-arcade text-[9px] text-[#161514] shadow-[4px_4px_0_0_#161514] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Change symbol
            </button>
          </>
        )}
        {onBack && (
          <button
            type="button"
            disabled={isLoading}
            onClick={onBack}
            className="rounded-full border-4 border-[#161514] bg-cyan-300 px-4 py-2 font-arcade text-[9px] text-[#161514] shadow-[4px_4px_0_0_#161514] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Game menu
          </button>
        )}
      </div>
    </section>
  );
}
