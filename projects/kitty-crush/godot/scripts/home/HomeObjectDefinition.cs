using System.Collections.Generic;

namespace Whiskerfolk.Home;

public sealed record InteractionSlot(
    string Id,
    IReadOnlySet<string> BehaviorTags,
    string AnimationKey,
    string? SoundKey = null
);

public sealed record HomeObjectDefinition(
    string Id,
    string DisplayName,
    IReadOnlySet<string> Tags,
    IReadOnlyList<InteractionSlot> Slots,
    IReadOnlyDictionary<string, float> CatAffinityOverrides
);

public static class HomeCatalog
{
    public static readonly HomeObjectDefinition CardboardBox = new(
        "cardboard_box_01",
        "The Box",
        new HashSet<string> { "box", "hide", "sleep", "curious" },
        new List<InteractionSlot>
        {
            new("inside", new HashSet<string>{"hide","sleep"}, "box_inside"),
            new("peek", new HashSet<string>{"curious"}, "box_peek"),
            new("top", new HashSet<string>{"sit"}, "box_top")
        },
        new Dictionary<string, float> { ["mochi"] = 1.0f }
    );

    public static readonly HomeObjectDefinition FoldedBlanket = new(
        "folded_blanket_01",
        "Folded Blanket",
        new HashSet<string> { "soft_fabric", "sleep", "comfort" },
        new List<InteractionSlot>
        {
            new("center", new HashSet<string>{"sleep","rest"}, "blanket_settle")
        },
        new Dictionary<string, float> { ["mochi"] = 0.82f }
    );
}
