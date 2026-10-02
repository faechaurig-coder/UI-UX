using System;
using System.Collections.Generic;
using Xunit;
using Whiskerfolk.Puzzle;

namespace Whiskerfolk.Tests;

public class ReshuffleTests
{
    [Fact]
    public void TestReshuffleCanBePerformedWithoutEngineCollections()
    {
        var board = new BoardData(8, 8);
        for (var row = 0; row < 8; row++)
        for (var col = 0; col < 8; col++)
            board.GetTile(row, col).SetCrystal((row + col) % 5);

        var values = new List<int>();
        foreach (var tile in board.Tiles)
            values.Add(tile.CrystalType);

        Shuffle(values, new Random(42));

        for (var i = 0; i < board.Tiles.Length; i++)
            board.Tiles[i].SetCrystal(values[i]);

        Assert.Equal(0, board.GetEmptyCount());
        Assert.Equal(64, values.Count);
    }

    private static void Shuffle<T>(IList<T> list, Random random)
    {
        for (var i = list.Count - 1; i > 0; i--)
        {
            var j = random.Next(i + 1);
            (list[i], list[j]) = (list[j], list[i]);
        }
    }
}
