using System.Collections.Generic;

namespace Whiskerfolk.Cats;

public sealed record CatDefinition(
    string Id,
    string DisplayName,
    string Archetype,
    IReadOnlySet<string> TraitTags,
    IReadOnlyDictionary<string, float> BaseAffinities,
    string SignatureBehaviorKey,
    string SignatureSoundKey
);

public static class CatCatalog
{
    public static readonly CatDefinition Mochi = new(
        "mochi",
        "Mochi",
        "Cautious Observer",
        new HashSet<string> { "cautious", "curious", "box-loving", "quiet-playful" },
        new Dictionary<string, float>
        {
            ["box"] = 1.0f,
            ["soft_fabric"] = 0.82f,
            ["window"] = 0.66f,
            ["feather"] = 0.58f,
            ["player"] = 0.18f,
            ["metal_noise"] = -0.8f
        },
        "double_check",
        "mrrp_question"
    );
}
