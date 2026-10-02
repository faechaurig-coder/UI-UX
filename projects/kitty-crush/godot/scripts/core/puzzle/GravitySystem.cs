using System.Collections.Generic;

namespace Whiskerfolk.Puzzle;

public static class GravitySystem
{
    private const float FallBase = 0.1f;
    private const float FallPerRow = 0.08f;

    public static List<FallInfo> ApplyGravity(BoardData board)
    {
        var allFalls = new List<FallInfo>();
        for (var col = 0; col < board.Cols; col++)
            allFalls.AddRange(ProcessColumn(board, col));
        return allFalls;
    }

    private static List<FallInfo> ProcessColumn(BoardData board, int col)
    {
        var falls = new List<FallInfo>();
        var writeRow = board.Rows - 1;

        for (var readRow = board.Rows - 1; readRow >= 0; readRow--)
        {
            var tile = board.GetTile(readRow, col);
            if (tile.IsEmpty) continue;

            if (readRow != writeRow)
            {
                falls.Add(new FallInfo
                {
                    FromRow = readRow,
                    ToRow = writeRow,
                    Col = col,
                    CrystalType = tile.CrystalType,
                    SpecialType = tile.SpecialType
                });

                board.Swap(readRow, col, writeRow, col);
            }

            writeRow--;
        }

        for (var row = writeRow; row >= 0; row--)
            board.GetTile(row, col).Clear();

        return falls;
    }

    public sealed class FallInfo
    {
        public int FromRow { get; init; }
        public int ToRow { get; init; }
        public int Col { get; init; }
        public int CrystalType { get; init; } = -1;
        public int SpecialType { get; init; } = -1;

        public int GetDistance() => ToRow - FromRow;
        public float GetDuration() => FallBase + GetDistance() * FallPerRow;
    }
}
