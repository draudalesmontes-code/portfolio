"use client";

import { useState } from "react";
import Connect4Board, {
  type Connect4Cell,
  type Connect4Piece,
} from "@/components/games/Connect4Board";
import { apiFetch } from "@/lib/api";
import {
  readApiErrorMessage,
  type Difficulty,
  type GameState,
} from "@/lib/games";

type Connect4GameState = GameState<
  Connect4Cell[][],
  Connect4Piece
>;

type Connect4GameProps = {
  difficulty: Difficulty;
  compact?: boolean;
  onBack?: () => void;
};

const ROWS = 6;
const COLUMNS = 7;

function emptyBoard(): Connect4Cell[][] {
  return Array.from(
    { length: ROWS },
    () => Array<Connect4Cell>(COLUMNS).fill(null),
  );
}

function gameMessage(
  game: Connect4GameState | null,
  isLoading: boolean,
): string {
  if (isLoading) {
    return game ? "Computer is thinking…" : "Starting game…";
  }
  if (!game) {
    return "Choose your color, then start the game.";
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
  return `Your turn — drop a ${game.humanPiece} piece.`;
}

export default function Connect4Game({
  difficulty,
  compact = false,
  onBack,
}: Connect4GameProps) {
  const [humanPiece, setHumanPiece] =
    useState<Connect4Piece>("RED");
  const [game, setGame] =
    useState<Connect4GameState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const board = game?.board ?? emptyBoard();
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
        "/api/games/connect4/sessions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            difficulty,
            humanPiece,
          }),
        },
      );

      if (!response.ok) {
        setError(
          await readApiErrorMessage(
            response,
            "Unable to start Connect 4.",
          ),
        );
        return;
      }

      setGame((await response.json()) as Connect4GameState);
    } catch {
      setError("Unable to reach the game server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function makeMove(column: number) {
    if (
      !game ||
      isLoading ||
      game.status !== "IN_PROGRESS" ||
      board[0]?.[column] !== null
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFetch(
        `/api/games/connect4/sessions/${game.sessionId}/moves`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ move: column }),
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

      setGame((await response.json()) as Connect4GameState);
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
      aria-label="Connect 4 game"
    >
      <div className="text-center">
        <h2
          className={`font-arcade ${headingColor} ${
            compact ? "text-sm" : "text-3xl sm:text-5xl"
          }`}
        >
          Connect 4
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
            Choose your color
          </p>
          <div className="flex gap-3">
            {(["RED", "YELLOW"] as const).map((piece) => (
              <button
                key={piece}
                type="button"
                aria-pressed={humanPiece === piece}
                aria-label={`Play as ${piece}`}
                onClick={() => setHumanPiece(piece)}
                className={`rounded-full border-4 border-[#161514] shadow-[4px_4px_0_0_#161514] ${
                  compact ? "size-12" : "size-16"
                } ${
                  piece === "RED"
                    ? "bg-[#e63946]"
                    : "bg-[#ffd23f]"
                } ${
                  humanPiece === piece
                    ? "scale-110"
                    : "opacity-60"
                }`}
              />
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

      <Connect4Board
        board={board}
        compact={compact}
        disabled={!game || isLoading || gameIsFinished}
        onMove={makeMove}
      />

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
              Change color
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
