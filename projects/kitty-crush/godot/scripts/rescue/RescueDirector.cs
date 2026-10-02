using System;

namespace Whiskerfolk.Rescue;

public sealed class RescueDirector
{
    public RescueArc Arc { get; }
    public int BeatIndex { get; private set; }
    public RescueBeat Current => Arc.Beats[BeatIndex];
    public bool IsComplete => BeatIndex >= Arc.Beats.Count - 1;

    public event Action<RescueBeat>? BeatChanged;

    public RescueDirector(RescueArc arc, int startBeatIndex = 0)
    {
        Arc = arc;
        BeatIndex = Math.Clamp(startBeatIndex, 0, Math.Max(0, arc.Beats.Count - 1));
    }

    public bool TryAdvance(string completedBeatId)
    {
        if (!string.Equals(Current.Id, completedBeatId, StringComparison.Ordinal))
            return false;

        if (IsComplete) return false;

        BeatIndex++;
        BeatChanged?.Invoke(Current);
        return true;
    }

    public void RestoreBeat(int beatIndex)
    {
        BeatIndex = Math.Clamp(beatIndex, 0, Math.Max(0, Arc.Beats.Count - 1));
        BeatChanged?.Invoke(Current);
    }

    public void Reset()
    {
        BeatIndex = 0;
        BeatChanged?.Invoke(Current);
    }
}
