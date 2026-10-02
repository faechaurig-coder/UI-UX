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
            ["box"] = 1.00f,
            ["soft_fabric"] = 0.82f,
            ["window"] = 0.66f,
            ["feather"] = 0.58f,
            ["player"] = 0.18f,
            ["metal_noise"] = -0.80f
        },
        "double_check",
        "mrrp_question"
    );

    public static readonly CatDefinition Churro = new(
        "churro","Churro","Confident Food Critic",
        new HashSet<string>{"social","food-motivated","dramatic","bold"},
        new Dictionary<string,float>{{"food",1.0f},{"player",0.55f},{"puzzle_feeder",0.9f},{"box",0.2f}},
        "bowl_shuffle","chirrup_short"
    );

    public static readonly CatDefinition Nori = new(
        "nori","Nori","High-Ground Strategist",
        new HashSet<string>{"independent","calm","observant","perch-loving"},
        new Dictionary<string,float>{{"high_perch",1.0f},{"window",0.9f},{"player",0.15f},{"noise",-0.4f}},
        "silent_drop","soft_trill"
    );

    public static readonly CatDefinition Chispa = new(
        "chispa","Chispa","Kinetic Calico",
        new HashSet<string>{"playful","bold","chaotic","curious"},
        new Dictionary<string,float>{{"feather",1.0f},{"spring",0.95f},{"player",0.55f},{"high_perch",0.45f}},
        "pounce_skid","bright_mrrp"
    );

    public static readonly CatDefinition Trufa = new(
        "trufa","Trufa","Soft Giant",
        new HashSet<string>{"calm","tactile","comfort-seeking","patient"},
        new Dictionary<string,float>{{"soft_fabric",1.0f},{"large_cushion",1.0f},{"player",0.52f},{"box",0.4f}},
        "too_small_bed","low_purr"
    );

    public static readonly CatDefinition Luma = new(
        "luma","Luma","Sun Collector",
        new HashSet<string>{"gentle","routine-loving","light-seeking","quiet"},
        new Dictionary<string,float>{{"sun_patch",1.0f},{"window",0.92f},{"woven_mat",0.78f},{"player",0.3f}},
        "follow_the_sun","airy_mew"
    );

    public static readonly CatDefinition Tinta = new(
        "tinta","Tinta","Tiny Engineer",
        new HashSet<string>{"clever","persistent","mischievous","mechanism-curious"},
        new Dictionary<string,float>{{"puzzle_box",1.0f},{"cabinet",0.95f},{"player",0.45f},{"feather",0.25f}},
        "solve_latch","question_chirp"
    );

    public static readonly CatDefinition Pipa = new(
        "pipa","Pipa","Social Bridge",
        new HashSet<string>{"social","adaptable","warm","mediator"},
        new Dictionary<string,float>{{"shared_blanket",1.0f},{"cat_company",1.0f},{"player",0.66f},{"window",0.4f}},
        "settle_between","friendly_trill"
    );

    public static readonly IReadOnlyList<CatDefinition> InitialRoster =
        new List<CatDefinition> { Mochi, Churro, Nori, Chispa, Trufa, Luma, Tinta, Pipa };
}
