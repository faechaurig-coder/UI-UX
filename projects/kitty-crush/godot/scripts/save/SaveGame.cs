using System;
using System.Collections.Generic;

namespace Whiskerfolk.Save;

public sealed class SaveGame
{
    public const int CurrentSchema = 1;

    public int SchemaVersion { get; init; } = CurrentSchema;
    public DateTimeOffset CreatedAt { get; init; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    public string CurrentRescueArcId { get; set; } = "mochi_first_night";
    public int CurrentRescueBeat { get; set; }
    public HashSet<string> RescuedCats { get; } = new();
    public Dictionary<string, float> CatTrust { get; } = new();
    public HashSet<string> Memories { get; } = new();
    public HashSet<string> OwnedHomeObjects { get; } = new();
    public HashSet<string> OwnedCosmetics { get; } = new();
}
