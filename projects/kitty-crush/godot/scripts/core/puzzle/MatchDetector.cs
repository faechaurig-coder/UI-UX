using System;
using System.Collections.Generic;
using System.Linq;

namespace Whiskerfolk.Puzzle;

public static class MatchDetector
{
    private static readonly GridPos[] Directions =
    {
        new(0, -1),
        new(1, 0),
        new(0, 1),
        new(-1, 0)
    };

    public static MatchResult DetectAll(BoardData board)
    {
        var result = new MatchResult
        {
            MatchedFlags = new byte[board.Cols * board.Rows]
        };

        MarkHorizontal(board, result.MatchedFlags);
        MarkVertical(board, result.MatchedFlags);

        var visited = new byte[result.MatchedFlags.Length];

        for (var i = 0; i < result.MatchedFlags.Length; i++)
        {
            if (result.MatchedFlags[i] == 0 || visited[i] != 0)
                continue;

            var region = FloodFill(board, result.MatchedFlags, visited, i);
            if (region.Count < 3) continue;

            var group = Classify(region, board);
            result.Groups.Add(group);

            var special = DetermineSpecial(group);
            if (special.SpecialType != (int)SpecialType.None)
                result.SpecialSpawns.Add(special);
        }

        result.TotalMatched = result.MatchedFlags.Count(x => x != 0);
        return result;
    }

    private static void MarkHorizontal(BoardData board, byte[] flags)
    {
        for (var row = 0; row < board.Rows; row++)
        {
            var col = 0;
            while (col < board.Cols)
            {
                var tile = board.GetTile(row, col);
                if (tile.IsEmpty)
                {
                    col++;
                    continue;
                }

                var type = tile.CrystalType;
                var start = col++;
                while (col < board.Cols)
                {
                    var next = board.GetTile(row, col);
                    if (next.IsEmpty || next.CrystalType != type) break;
                    col++;
                }

                if (col - start < 3) continue;
                for (var c = start; c < col; c++)
                    flags[board.GetIndex(row, c)] = 1;
            }
        }
    }

    private static void MarkVertical(BoardData board, byte[] flags)
    {
        for (var col = 0; col < board.Cols; col++)
        {
            var row = 0;
            while (row < board.Rows)
            {
                var tile = board.GetTile(row, col);
                if (tile.IsEmpty)
                {
                    row++;
                    continue;
                }

                var type = tile.CrystalType;
                var start = row++;
                while (row < board.Rows)
                {
                    var next = board.GetTile(row, col);
                    if (next.IsEmpty || next.CrystalType != type) break;
                    row++;
                }

                if (row - start < 3) continue;
                for (var r = start; r < row; r++)
                    flags[board.GetIndex(r, col)] = 1;
            }
        }
    }

    private static List<GridPos> FloodFill(
        BoardData board,
        byte[] flags,
        byte[] visited,
        int startIndex)
    {
        var region = new List<GridPos>();
        var stack = new Stack<int>();
        stack.Push(startIndex);
        visited[startIndex] = 1;

        var type = board.Tiles[startIndex].CrystalType;

        while (stack.Count > 0)
        {
            var index = stack.Pop();
            var pos = board.RowCol(index);
            region.Add(pos);

            foreach (var direction in Directions)
            {
                var next = pos + direction;
                if (!board.IsInBounds(next.Y, next.X)) continue;

                var nextIndex = board.GetIndex(next.Y, next.X);
                if (visited[nextIndex] != 0 || flags[nextIndex] == 0) continue;
                if (board.Tiles[nextIndex].CrystalType != type) continue;

                visited[nextIndex] = 1;
                stack.Push(nextIndex);
            }
        }

        return region;
    }

    private static MatchResult.MatchGroup Classify(List<GridPos> region, BoardData board)
    {
        var group = new MatchResult.MatchGroup
        {
            Positions = region,
            CrystalType = board.GetTile(region[0].Y, region[0].X).CrystalType
        };

        var rowGroups = region.GroupBy(p => p.Y).ToDictionary(g => g.Key, g => g.Count());
        var colGroups = region.GroupBy(p => p.X).ToDictionary(g => g.Key, g => g.Count());

        if (rowGroups.Count == 1)
        {
            group.Shape = (int)MatchShape.Horizontal;
            group.MatchLength = region.Count;
            group.Pivot = region.OrderBy(p => p.X).ElementAt(region.Count / 2);
            return group;
        }

        if (colGroups.Count == 1)
        {
            group.Shape = (int)MatchShape.Vertical;
            group.MatchLength = region.Count;
            group.Pivot = region.OrderBy(p => p.Y).ElementAt(region.Count / 2);
            return group;
        }

        var pivot = region.FirstOrDefault(p =>
            rowGroups.TryGetValue(p.Y, out var rowCount) && rowCount >= 3 &&
            colGroups.TryGetValue(p.X, out var colCount) && colCount >= 3);

        group.Pivot = pivot == default && !region.Contains(default) ? region[0] : pivot;

        var set = region.ToHashSet();
        var left = set.Contains(group.Pivot + new GridPos(-1, 0));
        var right = set.Contains(group.Pivot + new GridPos(1, 0));
        var up = set.Contains(group.Pivot + new GridPos(0, -1));
        var down = set.Contains(group.Pivot + new GridPos(0, 1));
        var directions = new[] { left, right, up, down }.Count(x => x);

        group.Shape = directions switch
        {
            4 => (int)MatchShape.Cross,
            3 => (int)MatchShape.TShape,
            _ => (int)MatchShape.LShape
        };
        group.MatchLength = region.Count;
        return group;
    }

    private static MatchResult.SpecialSpawn DetermineSpecial(MatchResult.MatchGroup group)
    {
        var spawn = new MatchResult.SpecialSpawn
        {
            Position = group.Pivot,
            CrystalType = group.CrystalType,
            SpecialType = (int)SpecialType.None
        };

        if (group.Shape is (int)MatchShape.Horizontal or (int)MatchShape.Vertical)
        {
            if (group.MatchLength >= 5)
                spawn.SpecialType = (int)SpecialType.Rainbow;
            else if (group.MatchLength >= 4)
                spawn.SpecialType = (int)SpecialType.Bomb;

            return spawn;
        }

        if (group.Positions.Count >= 5)
            spawn.SpecialType = (int)SpecialType.Cross;

        return spawn;
    }
}
