using System.Collections.Generic;
using Whiskerfolk.Cats;

namespace Whiskerfolk.Home;

public sealed class BehaviorScheduler
{
    private readonly CatBehaviorController _controller;

    public BehaviorScheduler(int? seed = null)
    {
        _controller = new CatBehaviorController(seed);
    }

    public string SelectHomeBehavior(
        CatDefinition cat,
        CatState state,
        IReadOnlyList<HomeObjectDefinition> objects)
    {
        var options = new List<BehaviorOption>
        {
            new("quiet_idle", new HashSet<string>(), 0.55f),
            new("watch_player", new HashSet<string>{"player"}, 0.18f),
            new("groom", new HashSet<string>{"comfort"}, 0.35f)
        };

        foreach (var obj in objects)
        {
            var objectBoost = obj.CatAffinityOverrides.TryGetValue(cat.Id, out var affinity)
                ? affinity
                : 0f;

            foreach (var slot in obj.Slots)
            {
                // Object identity matters as much as the pose/interaction slot.
                // Mochi should recognize "box" even when a slot is tagged "hide" or "sleep".
                var tags = new HashSet<string>(obj.Tags);
                tags.UnionWith(slot.BehaviorTags);

                options.Add(new BehaviorOption(
                    $"{obj.Id}:{slot.Id}",
                    tags,
                    0.28f + objectBoost,
                    obj.Id,
                    state.CurrentObjectId == obj.Id ? 0.25f : 0f
                ));
            }
        }

        return _controller.Choose(cat, state, options);
    }
}
