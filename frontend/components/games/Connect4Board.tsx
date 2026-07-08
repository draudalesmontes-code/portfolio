"use client";

export type Connect4Piece = "RED" | "YELLOW";
export type Connect4Cell = Connect4Piece | null;

type Connect4BoardProps = {
  board: Connect4Cell[][];
  disabled?: boolean;
  compact?: boolean;
  onMove: (column: number) => void;
};

const COLUMNS = 7;

export default function Connect4Board({
  board,
  disabled = false,
  compact = false,
  onMove,
}: Connect4BoardProps) {
  return (
    <div
      className={`grid w-full grid-cols-7 rounded-2xl border-4 border-[#161514] bg-[#2f6fed] shadow-[8px_8px_0_0_#161514] ${
        compact
          ? "max-w-[19rem] gap-1 p-2"
          : "max-w-2xl gap-2 p-3"
      }`}
      aria-label="Connect Four board"
    >
      {Array.from({ length: COLUMNS }, (_, column) => {
        const columnIsFull = board[0]?.[column] !== null;

        return (
          <button
            key={column}
            type="button"
            disabled={disabled || columnIsFull}
            onClick={() => onMove(column)}
            aria-label={
              columnIsFull
                ? `Column ${column + 1} is full`
                : `Drop a piece in column ${column + 1}`
            }
            className={`group grid grid-rows-6 rounded-xl p-1 transition-colors hover:bg-white/15 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:opacity-70 ${
              compact ? "gap-1" : "gap-2"
            }`}
          >
            {board.map((row, rowIndex) => {
              const piece = row[column] ?? null;

              return (
                <span
                  key={`${rowIndex}-${column}`}
                  aria-hidden="true"
                  className={`aspect-square rounded-full border-[#161514] transition-transform group-enabled:group-hover:scale-105 ${
                    compact ? "border-2" : "border-4"
                  } ${
                    piece === "RED"
                      ? "bg-[#e63946]"
                      : piece === "YELLOW"
                        ? "bg-[#ffd23f]"
                        : "bg-[#f4f1e9]"
                  }`}
                />
              );
            })}
          </button>
        );
      })}
    </div>
  );
}
