using System;
using System.Collections.Generic;

namespace Whiskerfolk.Puzzle;

public enum ObjectiveKind
{
    CollectItem,
    ClearBlocker,
    RevealPath,
    DropObject,
    ProtectObject,
    ChargeObject
}

public sealed record ObjectiveDefinition(
    string Id,
    ObjectiveKind Kind,
    string TargetKey,
    int TargetCount,
    string WorldResultKey
);

public sealed class ObjectiveProgress
{
    public ObjectiveDefinition Definition { get; }
    public int Current { get; private set; }
    public bool Complete => Current >= Definition.TargetCount;

    public event Action<ObjectiveProgress>? Changed;

    public ObjectiveProgress(ObjectiveDefinition definition)
    {
        Definition = definition;
    }

    public void Add(int amount = 1)
    {
        if (Complete) return;
        Current = Math.Min(Definition.TargetCount, Current + Math.Max(0, amount));
        Changed?.Invoke(this);
    }
}

public static class MochiObjectives
{
    public static readonly IReadOnlyDictionary<string, ObjectiveDefinition> All =
        new Dictionary<string, ObjectiveDefinition>
        {
            ["collect_food"] = new("collect_food", ObjectiveKind.CollectItem, "food", 6, "place_food"),
            ["collect_blanket"] = new("collect_blanket", ObjectiveKind.CollectItem, "blanket", 8, "cover_box"),
            ["safe_path_carrier"] = new("safe_path_carrier", ObjectiveKind.RevealPath, "flood", 10, "open_carrier_path")
        };
}
