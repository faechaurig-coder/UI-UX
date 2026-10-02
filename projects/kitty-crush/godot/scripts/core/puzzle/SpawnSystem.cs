using System;
using System.Collections.Generic;

namespace Whiskerfolk.Puzzle;

public static class SpawnSystem
{
    public static List<SpawnInfo> FillEmpty(BoardData board, Random? random = null)
    {
        random ??= Random.Shared;
        var spawns = new List<SpawnInfo>();

        for (var col = 0; col < board.Cols; col++)
        for (var row = 0; row < board.Rows; row++)
        {
            var tile = board.GetTile(row, col);
            if (!tile.IsEmpty) continue;

            var crystalType = random.Next(board.NumCrystalTypes);
            spawns.Add(new SpawnInfo
            {
                Row = row,
                Col = col,
                CrystalType = crystalType
            });
            tile.SetCrystal(crystalType);
        }

        return spawns;
    }

    public sealed class SpawnInfo
    {
        public int Row { get; init; }
        public int Col { get; init; }
        public int CrystalType { get; init; } = -1;
        public float GetEnterOffsetY() => -(Row + 1) * 76.0f;
    }
}
