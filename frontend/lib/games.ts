export const DIFFICULTIES = [
  "EASY",
  "MEDIUM",
  "HARD",
] as const;

export type Difficulty = (typeof DIFFICULTIES)[number];

export const GAMES = [
  {
    id: "tic-tac-toe",
    label: "Tic-Tac-Toe",
    path: "/games/tictactoe",
    color: "#e63946",
  },
  {
    id: "connect-4",
    label: "Connect 4",
    path: "/games/connect4",
    color: "#2f6fed",
  },
] as const;

export type Game = (typeof GAMES)[number];

export type GameStatus =
  | "IN_PROGRESS"
  | "HUMAN_WON"
  | "COMPUTER_WON"
  | "DRAW";

export type GameState<TBoard, TPiece extends string> = {
  sessionId: string;
  gameType: "TIC_TAC_TOE" | "CONNECT_FOUR";
  difficulty: Difficulty;
  status: GameStatus;
  board: TBoard;
  humanPiece: TPiece;
  computerPiece: TPiece;
  winner: TPiece | null;
  computerMove: number | null;
};

export function isDifficulty(
  value: unknown,
): value is Difficulty {
  return (
    typeof value === "string" &&
    DIFFICULTIES.some(
      (difficulty) => difficulty === value,
    )
  );
}

type ApiErrorResponse = {
  message?: unknown;
};

export async function readApiErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const error = (await response.json()) as ApiErrorResponse;
    return typeof error.message === "string"
      ? error.message
      : fallback;
  } catch {
    return fallback;
  }
}
