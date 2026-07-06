package com.diego.portfolio.games.connect4;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.stereotype.Component;

@Component
public class Connect4Engine {
    public static final int ROWS = 6;
    public static final int COLUMNS = 7;

    private static final int WIN_SCORE = 1_000_000;
    private static final int[] COLUMN_ORDER = {3, 2, 4, 1, 5, 0, 6};

    public record PlacedPiece(int row, int column) {
    }

    public Piece[][] newBoard() {
        return new Piece[ROWS][COLUMNS];
    }

    public PlacedPiece dropPiece(
        Piece[][] board,
        int column,
        Piece piece
    ) {
        validateBoard(board);
        validateColumn(column);
        Objects.requireNonNull(piece, "Piece is required.");

        int row = findOpenRow(board, column);
        if (row == -1) {
            throw new IllegalArgumentException("Column is full.");
        }

        board[row][column] = piece;
        return new PlacedPiece(row, column);
    }

    public List<Integer> availableColumns(Piece[][] board) {
        validateBoard(board);

        List<Integer> available = new ArrayList<>();
        for (int column : COLUMN_ORDER) {
            if (board[0][column] == null) {
                available.add(column);
            }
        }
        return available;
    }

    public boolean hasWon(
        Piece[][] board,
        PlacedPiece move,
        Piece piece
    ) {
        validateBoard(board);
        Objects.requireNonNull(move, "Placed move is required.");
        Objects.requireNonNull(piece, "Piece is required.");

        int row = move.row();
        int column = move.column();

        return connectedPieces(board, row, column, piece, 0, 1) >= 4
            || connectedPieces(board, row, column, piece, 1, 0) >= 4
            || connectedPieces(board, row, column, piece, 1, 1) >= 4
            || connectedPieces(board, row, column, piece, 1, -1) >= 4;
    }

    public boolean isDraw(Piece[][] board) {
        return availableColumns(board).isEmpty();
    }

    public int chooseComputerMove(
        Piece[][] board,
        Difficulty difficulty,
        Piece computerPiece
    ) {
        validateBoard(board);
        Objects.requireNonNull(difficulty, "Difficulty is required.");
        Objects.requireNonNull(
            computerPiece,
            "Computer piece is required."
        );

        List<Integer> available = availableColumns(board);
        if (available.isEmpty()) {
            throw new IllegalStateException("No available moves.");
        }

        if (difficulty == Difficulty.EASY) {
            return randomColumn(available);
        }

        int bestMove = findBestMove(
            board,
            difficulty.searchDepth(),
            computerPiece
        );

        if (ThreadLocalRandom.current().nextDouble()
            < difficulty.optimalMoveChance()) {
            return bestMove;
        }

        List<Integer> nonOptimalMoves = new ArrayList<>(available);
        nonOptimalMoves.remove(Integer.valueOf(bestMove));
        return nonOptimalMoves.isEmpty()
            ? bestMove
            : randomColumn(nonOptimalMoves);
    }

    private int findOpenRow(Piece[][] board, int column) {
        for (int row = ROWS - 1; row >= 0; row--) {
            if (board[row][column] == null) {
                return row;
            }
        }
        return -1;
    }

    private int findBestMove(
        Piece[][] board,
        int depth,
        Piece computerPiece
    ) {
        int bestMove = -1;
        int bestScore = Integer.MIN_VALUE;

        for (int column : availableColumns(board)) {
            PlacedPiece move = dropPiece(board, column, computerPiece);
            int score = hasWon(board, move, computerPiece)
                ? WIN_SCORE
                : minimax(
                    board,
                    depth - 1,
                    false,
                    computerPiece,
                    Integer.MIN_VALUE,
                    Integer.MAX_VALUE
                );
            undoMove(board, move);

            if (score > bestScore) {
                bestScore = score;
                bestMove = column;
            }
        }

        return bestMove;
    }

    private int minimax(
        Piece[][] board,
        int depth,
        boolean maximizing,
        Piece computerPiece,
        int alpha,
        int beta
    ) {
        if (depth == 0 || isDraw(board)) {
            return evaluateBoard(board, computerPiece);
        }

        Piece currentPiece = maximizing
            ? computerPiece
            : computerPiece.opposite();
        int bestScore = maximizing
            ? Integer.MIN_VALUE
            : Integer.MAX_VALUE;

        for (int column : availableColumns(board)) {
            PlacedPiece move = dropPiece(
                board,
                column,
                currentPiece
            );

            int score;
            if (hasWon(board, move, currentPiece)) {
                score = maximizing
                    ? WIN_SCORE + depth
                    : -WIN_SCORE - depth;
            } else {
                score = minimax(
                    board,
                    depth - 1,
                    !maximizing,
                    computerPiece,
                    alpha,
                    beta
                );
            }
            undoMove(board, move);

            if (maximizing) {
                bestScore = Math.max(bestScore, score);
                alpha = Math.max(alpha, bestScore);
            } else {
                bestScore = Math.min(bestScore, score);
                beta = Math.min(beta, bestScore);
            }

            if (beta <= alpha) {
                break;
            }
        }

        return bestScore;
    }

    private int evaluateBoard(
        Piece[][] board,
        Piece computerPiece
    ) {
        int score = 0;

        for (int row = 0; row < ROWS; row++) {
            if (board[row][COLUMNS / 2] == computerPiece) {
                score += 6;
            } else if (
                board[row][COLUMNS / 2] == computerPiece.opposite()
            ) {
                score -= 6;
            }
        }

        for (int row = 0; row < ROWS; row++) {
            for (int column = 0; column <= COLUMNS - 4; column++) {
                score += evaluateWindow(
                    board,
                    row,
                    column,
                    0,
                    1,
                    computerPiece
                );
            }
        }

        for (int row = 0; row <= ROWS - 4; row++) {
            for (int column = 0; column < COLUMNS; column++) {
                score += evaluateWindow(
                    board,
                    row,
                    column,
                    1,
                    0,
                    computerPiece
                );
            }
        }

        for (int row = 0; row <= ROWS - 4; row++) {
            for (int column = 0; column <= COLUMNS - 4; column++) {
                score += evaluateWindow(
                    board,
                    row,
                    column,
                    1,
                    1,
                    computerPiece
                );
            }
        }

        for (int row = 0; row <= ROWS - 4; row++) {
            for (int column = 3; column < COLUMNS; column++) {
                score += evaluateWindow(
                    board,
                    row,
                    column,
                    1,
                    -1,
                    computerPiece
                );
            }
        }

        return score;
    }

    private int evaluateWindow(
        Piece[][] board,
        int row,
        int column,
        int rowChange,
        int columnChange,
        Piece computerPiece
    ) {
        int computerCount = 0;
        int opponentCount = 0;
        int emptyCount = 0;

        for (int offset = 0; offset < 4; offset++) {
            Piece piece = board[row + offset * rowChange]
                [column + offset * columnChange];

            if (piece == computerPiece) {
                computerCount++;
            } else if (piece == computerPiece.opposite()) {
                opponentCount++;
            } else {
                emptyCount++;
            }
        }

        if (computerCount == 4) {
            return 100_000;
        }
        if (opponentCount == 4) {
            return -100_000;
        }
        if (computerCount == 3 && emptyCount == 1) {
            return 120;
        }
        if (opponentCount == 3 && emptyCount == 1) {
            return -150;
        }
        if (computerCount == 2 && emptyCount == 2) {
            return 12;
        }
        if (opponentCount == 2 && emptyCount == 2) {
            return -15;
        }
        return 0;
    }

    private int connectedPieces(
        Piece[][] board,
        int row,
        int column,
        Piece piece,
        int rowChange,
        int columnChange
    ) {
        return 1
            + countDirection(
                board,
                row,
                column,
                piece,
                rowChange,
                columnChange
            )
            + countDirection(
                board,
                row,
                column,
                piece,
                -rowChange,
                -columnChange
            );
    }

    private int countDirection(
        Piece[][] board,
        int row,
        int column,
        Piece piece,
        int rowChange,
        int columnChange
    ) {
        int count = 0;
        int nextRow = row + rowChange;
        int nextColumn = column + columnChange;

        while (
            isInsideBoard(nextRow, nextColumn)
            && board[nextRow][nextColumn] == piece
        ) {
            count++;
            nextRow += rowChange;
            nextColumn += columnChange;
        }

        return count;
    }

    private void undoMove(Piece[][] board, PlacedPiece move) {
        board[move.row()][move.column()] = null;
    }

    private int randomColumn(List<Integer> columns) {
        int index = ThreadLocalRandom.current().nextInt(columns.size());
        return columns.get(index);
    }

    private boolean isInsideBoard(int row, int column) {
        return row >= 0
            && row < ROWS
            && column >= 0
            && column < COLUMNS;
    }

    private void validateColumn(int column) {
        if (column < 0 || column >= COLUMNS) {
            throw new IllegalArgumentException(
                "Column must be between 0 and 6."
            );
        }
    }

    private void validateBoard(Piece[][] board) {
        Objects.requireNonNull(board, "Board is required.");
        if (board.length != ROWS) {
            throw new IllegalArgumentException(
                "Connect Four board must have 6 rows."
            );
        }
        for (Piece[] row : board) {
            if (row == null || row.length != COLUMNS) {
                throw new IllegalArgumentException(
                    "Every Connect Four row must have 7 columns."
                );
            }
        }
    }
}
