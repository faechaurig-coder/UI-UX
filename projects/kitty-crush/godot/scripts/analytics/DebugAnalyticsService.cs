using Godot;
using System.Collections.Generic;
using System.Text.Json;

namespace Whiskerfolk.Analytics;

public sealed class DebugAnalyticsService : IAnalyticsService
{
    public void Track(string eventName, IReadOnlyDictionary<string, object?>? payload = null)
    {
        var suffix = payload is null ? string.Empty : " " + JsonSerializer.Serialize(payload);
        GD.Print($"[analytics] {eventName}{suffix}");
    }
}
