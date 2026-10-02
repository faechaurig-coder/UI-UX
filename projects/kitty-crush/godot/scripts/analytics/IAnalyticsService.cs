using System.Collections.Generic;

namespace Whiskerfolk.Analytics;

public interface IAnalyticsService
{
    void Track(string eventName, IReadOnlyDictionary<string, object?>? payload = null);
}

public static class AnalyticsEvents
{
    public const string FirstMochiSeen = "first_mochi_seen";
    public const string FirstHelpAction = "first_help_action";
    public const string FirstPuzzleStarted = "first_puzzle_started";
    public const string FirstPuzzleCompleted = "first_puzzle_completed";
    public const string FirstTrustResponse = "first_trust_response";
    public const string RescueStarted = "rescue_started";
    public const string RescueCompleted = "rescue_completed";
    public const string BoxMomentStarted = "box_moment_started";
    public const string BoxMomentCompleted = "box_moment_completed";
    public const string HomeFirstEntry = "home_first_entry";
    public const string FirstAffection = "first_affection";
    public const string FirstObjectInteraction = "first_object_interaction";
    public const string FirstMemoryCreated = "first_memory_created";
    public const string FirstCosmeticEquipped = "first_cosmetic_equipped";
}
