using System;
using System.Collections.Generic;
using Xunit;
using Whiskerfolk.Puzzle;

namespace Whiskerfolk.Tests;

public class BoardGenerationTests
{
    [Fact]
    public void TestGenerateNoInitialMatches()
    {
        for (var i = 0; i < 20; i++)
        {
            var board = new BoardData(8, 8);
            GenerateNoMatch(board, new Random(100 + i));
            var result = MatchDetector.DetectAll(board);
            Assert.False(result.HasMatches(), "Generated board should have no initial matches");
        }
    }

    [Fact]
    public void TestAllCellsFilled()
    {
        for (var i = 0; i < 10; i++)
        {
            var board = new BoardData(8, 8);
            GenerateNoMatch(board, new Random(200 + i));
            Assert.Equal(0, board.GetEmptyCount());
        }
    }

    private static void GenerateNoMatch(BoardData board, Random random)
    {
        for (var row = 0; row < board.Rows; row++)
        for (var col = 0; col < board.Cols; col++)
        {
            var forbidden = new HashSet<int>();

            if (col >= 2)
            {
                var l1 = board.GetTile(row, col - 1);
                var l2 = board.GetTile(row, col - 2);
                if (!l1.IsEmpty && !l2.IsEmpty && l1.CrystalType == l2.CrystalType)
                    forbidden.Add(l1.CrystalType);
            }

            if (row >= 2)
            {
                var u1 = board.GetTile(row - 1, col);
                var u2 = board.GetTile(row - 2, col);
                if (!u1.IsEmpty && !u2.IsEmpty && u1.CrystalType == u2.CrystalType)
                    forbidden.Add(u1.CrystalType);
            }

            var allowed = new List<int>();
            for (var type = 0; type < board.NumCrystalTypes; type++)
                if (!forbidden.Contains(type))
                    allowed.Add(type);

            board.GetTile(row, col).SetCrystal(allowed[random.Next(allowed.Count)]);
        }
    }
}
