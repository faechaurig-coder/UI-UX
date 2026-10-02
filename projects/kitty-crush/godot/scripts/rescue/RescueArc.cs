using System.Collections.Generic;

namespace Whiskerfolk.Rescue;

public sealed class RescueArc
{
    public string Id { get; init; } = string.Empty;
    public string CatId { get; init; } = string.Empty;
    public IReadOnlyList<RescueBeat> Beats { get; init; } = new List<RescueBeat>();

    public static RescueArc MochiFirstNight() => new()
    {
        Id = "mochi_first_night",
        CatId = "mochi",
        Beats = new List<RescueBeat>
        {
            new("discover_box", RescueBeatType.Discover, "You heard something.", MinimumDurationSeconds: 6f),
            new("food_help", RescueBeatType.Puzzle, "Find something he can eat.", "collect_food"),
            new("first_trust", RescueBeatType.Trust, "Let him make the next move.", MinimumDurationSeconds: 18f),
            new("shelter_help", RescueBeatType.Puzzle, "Give the box a dry cover.", "collect_blanket"),
            new("water_rises", RescueBeatType.Threat, "The water is getting closer.", MinimumDurationSeconds: 8f),
            new("safe_path", RescueBeatType.Puzzle, "Make a safe path.", "safe_path_carrier"),
            new("carrier_choice", RescueBeatType.Rescue, "Open it. Then wait.", MinimumDurationSeconds: 10f),
            new("ride_home", RescueBeatType.Transition, "Almost home.", MinimumDurationSeconds: 7f),
            new("box_moment", RescueBeatType.HomeArrival, "Mochi lives here now.", MinimumDurationSeconds: 18f),
            new("first_home", RescueBeatType.FreeObserve, "Let him explore.", MinimumDurationSeconds: 45f)
        }
    };
}
