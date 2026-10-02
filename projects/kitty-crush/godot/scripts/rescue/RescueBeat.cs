namespace Whiskerfolk.Rescue;

public enum RescueBeatType
{
    Discover,
    Puzzle,
    Trust,
    Threat,
    Rescue,
    Transition,
    HomeArrival,
    FreeObserve
}

public sealed record RescueBeat(
    string Id,
    RescueBeatType Type,
    string Title,
    string? PuzzleObjectiveId = null,
    string? RequiredMemoryId = null,
    float MinimumDurationSeconds = 0f,
    bool CanSkip = false
);
