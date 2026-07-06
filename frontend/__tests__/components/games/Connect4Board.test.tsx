import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import Connect4Board, {
  type Connect4Cell,
} from "@/components/games/Connect4Board";

function emptyBoard(): Connect4Cell[][] {
  return Array.from(
    { length: 6 },
    () => Array<Connect4Cell>(7).fill(null),
  );
}

describe("Connect4Board", () => {
  test("renders seven playable columns and reports the selected column", async () => {
    const user = userEvent.setup();
    const onMove = vi.fn();
    render(<Connect4Board board={emptyBoard()} onMove={onMove} />);

    const columns = screen.getAllByRole("button");
    expect(columns).toHaveLength(7);

    await user.click(
      screen.getByRole("button", {
        name: "Drop a piece in column 4",
      }),
    );

    expect(onMove).toHaveBeenCalledWith(3);
  });

  test("disables a column when its top position is occupied", () => {
    const board = emptyBoard();
    board[0][2] = "RED";

    render(<Connect4Board board={board} onMove={vi.fn()} />);

    expect(
      screen.getByRole("button", {
        name: "Column 3 is full",
      }),
    ).toBeDisabled();
  });

  test("disables every column while waiting for the backend", () => {
    render(
      <Connect4Board
        board={emptyBoard()}
        disabled
        onMove={vi.fn()}
      />,
    );

    screen.getAllByRole("button").forEach((column) => {
      expect(column).toBeDisabled();
    });
  });
});
