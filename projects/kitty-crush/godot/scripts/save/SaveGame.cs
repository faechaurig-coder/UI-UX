using System;
using System.Collections.Generic;

namespace Whiskerfolk.Save;

public sealed class SaveGame
{
    public const int CurrentSchema = 1;

    public int SchemaVersion { get; set; } = CurrentSchema;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    public string CurrentRescueArcId { get; set; } = "mochi_first_night";
    public int CurrentRescueBeat { get; set; }
    public HashSet<string> RescuedCats { get; set; } = new();
    public Dictionary<string, float> CatTrust { get; set; } = new();
    public HashSet<string> Memories { get; set; } = new();
    public HashSet<string> OwnedHomeObjects { get; set; } = new();
    public HashSet<string> OwnedCosmetics { get; set; } = new();
    public Dictionary<string, string> Settings { get; set; } = new();
}
