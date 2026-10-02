using System;
using System.Collections.Generic;

namespace Whiskerfolk.Puzzle;

public sealed class BoardData
{
    public int Cols { get; }
    public int Rows { get; }
    public CellData[] Tiles { get; }
    public int NumCrystalTypes { get; }

    public BoardData(int cols = 8, int rows = 8, int types = 5)
    {
        if (cols <= 0) throw new ArgumentOutOfRangeException(nameof(cols));
        if (rows <= 0) throw new ArgumentOutOfRangeException(nameof(rows));
        if (types <= 0) throw new ArgumentOutOfRangeException(nameof(types));

        Cols = cols;
        Rows = rows;
        NumCrystalTypes = types;
        Tiles = new CellData[Cols * Rows];

        for (var i = 0; i < Tiles.Length; i++)
        {
            var pos = RowCol(i);
            Tiles[i] = new CellData { Row = pos.Y, Col = pos.X };
        }
    }

    public CellData GetTile(int row, int col) => Tiles[GetIndex(row, col)];

    public void SetTile(int row, int col, CellData tile)
    {
        if (tile is null) throw new ArgumentNullException(nameof(tile));
        tile.Row = row;
        tile.Col = col;
        Tiles[GetIndex(row, col)] = tile;
    }

    public int GetIndex(int row, int col)
    {
        if (!IsInBounds(row, col))
            throw new ArgumentOutOfRangeException($"Cell ({row},{col}) is outside {Rows}x{Cols} board.");
        return row * Cols + col;
    }

    public GridPos RowCol(int index)
    {
        if (index < 0 || index >= Tiles.Length)
            throw new ArgumentOutOfRangeException(nameof(index));
        return new GridPos(index % Cols, index / Cols);
    }

    public bool IsInBounds(int row, int col) =>
        row >= 0 && row < Rows && col >= 0 && col < Cols;

    public void Swap(int row1, int col1, int row2, int col2)
    {
        var idx1 = GetIndex(row1, col1);
        var idx2 = GetIndex(row2, col2);

        (Tiles[idx1], Tiles[idx2]) = (Tiles[idx2], Tiles[idx1]);

        Tiles[idx1].Row = row1;
        Tiles[idx1].Col = col1;
        Tiles[idx2].Row = row2;
        Tiles[idx2].Col = col2;
    }

    public CellSnapshot[] DuplicateData()
    {
        var data = new CellSnapshot[Tiles.Length];
        for (var i = 0; i < Tiles.Length; i++)
        {
            var tile = Tiles[i];
            data[i] = new CellSnapshot(tile.CrystalType, tile.SpecialType, tile.IsEmpty, tile.IsLocked, tile.LockHp);
        }
        return data;
    }

    public void RestoreFromData(IReadOnlyList<CellSnapshot> data)
    {
        if (data.Count != Tiles.Length)
            throw new ArgumentException("Snapshot size does not match board.", nameof(data));

        for (var i = 0; i < Tiles.Length; i++)
        {
            var snapshot = data[i];
            var tile = Tiles[i];
            tile.CrystalType = snapshot.CrystalType;
            tile.SpecialType = snapshot.SpecialType;
            tile.IsEmpty = snapshot.IsEmpty;
            tile.IsLocked = snapshot.IsLocked;
            tile.LockHp = snapshot.LockHp;
        }
    }

    public void Clear()
    {
        foreach (var tile in Tiles)
            tile.Clear();
    }

    public int CountType(int type)
    {
        var count = 0;
        foreach (var tile in Tiles)
            if (!tile.IsEmpty && tile.CrystalType == type)
                count++;
        return count;
    }

    public int GetEmptyCount()
    {
        var count = 0;
        foreach (var tile in Tiles)
            if (tile.IsEmpty)
                count++;
        return count;
    }

    public sealed class CellData
    {
        public int CrystalType { get; set; } = -1;
        public int SpecialType { get; set; } = -1;
        public int Row { get; set; } = -1;
        public int Col { get; set; } = -1;
        public bool IsEmpty { get; set; } = true;
        public bool IsLocked { get; set; }
        public int LockHp { get; set; }

        public CellData(int type = -1, int special = -1)
        {
            CrystalType = type;
            SpecialType = special;
            IsEmpty = type < 0;
        }

        public void Clear()
        {
            CrystalType = -1;
            SpecialType = -1;
            IsEmpty = true;
        }

        public void SetCrystal(int type, int special = -1)
        {
            CrystalType = type;
            SpecialType = special;
            IsEmpty = false;
        }

        public bool IsNormal() => !IsEmpty && SpecialType == -1;
        public bool IsSpecial() => !IsEmpty && SpecialType != -1;

        public override string ToString()
        {
            if (IsEmpty) return "EMPTY";
            var suffix = SpecialType switch { 0 => "B", 1 => "R", 2 => "C", _ => "" };
            return CrystalType + suffix;
        }
    }

    public sealed record CellSnapshot(
        int CrystalType,
        int SpecialType,
        bool IsEmpty,
        bool IsLocked,
        int LockHp
    );

    public sealed class MoveRecord
    {
        public GridPos From { get; init; }
        public GridPos To { get; init; }
        public CellSnapshot[] Snapshot { get; init; } = Array.Empty<CellSnapshot>();
        public int ScoreGained { get; init; }
    }
}
