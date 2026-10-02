namespace Whiskerfolk.Puzzle;

public readonly record struct GridPos(int X, int Y)
{
    public static GridPos operator +(GridPos a, GridPos b) => new(a.X + b.X, a.Y + b.Y);
}
