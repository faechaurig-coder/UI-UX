using System.Collections.Generic;

namespace Whiskerfolk.Puzzle;

public sealed class MatchResult
{
    public List<MatchGroup> Groups { get; set; } = new();
    public byte[] MatchedFlags { get; set; } = System.Array.Empty<byte>();
    public List<SpecialSpawn> SpecialSpawns { get; set; } = new();
    public int TotalMatched { get; set; }

    public bool HasMatches() => TotalMatched > 0;

    public List<GridPos> GetAllPositions()
    {
        var all = new List<GridPos>();
        foreach (var group in Groups)
            all.AddRange(group.Positions);
        return all;
    }

    public sealed class MatchGroup
    {
        public int Shape { get; set; }
        public List<GridPos> Positions { get; set; } = new();
        public GridPos Pivot { get; set; } = new(-1, -1);
        public int MatchLength { get; set; }
        public int CrystalType { get; set; } = -1;
        public int Size() => Positions.Count;
    }

    public sealed class SpecialSpawn
    {
        public GridPos Position { get; set; }
        public int SpecialType { get; set; } = -1;
        public int CrystalType { get; set; } = -1;

        public override string ToString() =>
            $"SpecialSpawn(type={SpecialType}, pos={Position})";
    }
}
