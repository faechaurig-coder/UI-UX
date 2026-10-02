using System.Collections.Generic;

namespace Whiskerfolk.Cats;

public sealed class CatState
{
    public string CatId { get; init; } = string.Empty;
    public BondState Bond { get; } = new();
    public string CurrentBehavior { get; set; } = "idle";
    public string? CurrentObjectId { get; set; }
    public HashSet<string> DiscoveredPreferences { get; } = new();
    public HashSet<string> SeenBehaviors { get; } = new();
    public Dictionary<string, float> ObjectFamiliarity { get; } = new();
}
