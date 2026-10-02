using System;
using System.Collections.Generic;
using System.Linq;

namespace Whiskerfolk.Cats;

public sealed record BehaviorOption(
    string Key,
    IReadOnlySet<string> Tags,
    float BaseWeight,
    string? ObjectId = null,
    float RecencyPenalty = 0f
);

public sealed class CatBehaviorController
{
    private readonly Random _random;

    public CatBehaviorController(int? seed = null)
    {
        _random = seed.HasValue ? new Random(seed.Value) : new Random();
    }

    public string Choose(
        CatDefinition definition,
        CatState state,
        IReadOnlyList<BehaviorOption> options,
        IReadOnlyDictionary<string, float>? context = null)
    {
        if (options.Count == 0) return "idle";

        var scored = new List<(BehaviorOption option, float score)>();

        foreach (var option in options)
        {
            var score = option.BaseWeight;

            foreach (var tag in option.Tags)
            {
                if (definition.BaseAffinities.TryGetValue(tag, out var affinity))
                    score += affinity;

                if (context is not null && context.TryGetValue(tag, out var contextual))
                    score += contextual;
            }

            // Low bond makes player-seeking behaviors rarer.
            if (option.Tags.Contains("player"))
                score += ((float)state.Bond.Level - 4f) * 0.13f;

            // Mochi should never feel like an animation machine.
            if (state.CurrentBehavior == option.Key)
                score -= 0.65f + option.RecencyPenalty;

            score += (float)(_random.NextDouble() * 0.22 - 0.11);
            scored.Add((option, score));
        }

        return scored
            .OrderByDescending(x => x.score)
            .First().option.Key;
    }
}
