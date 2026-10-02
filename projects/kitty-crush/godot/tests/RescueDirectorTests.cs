using Whiskerfolk.Rescue;
using Xunit;

namespace Whiskerfolk.Tests;

public class RescueDirectorTests
{
    [Fact]
    public void ArcAdvancesOnlyWhenCurrentBeatCompletes()
    {
        var director = new RescueDirector(RescueArc.MochiFirstNight());
        Assert.Equal("discover_box", director.Current.Id);

        Assert.False(director.TryAdvance("food_help"));
        Assert.Equal("discover_box", director.Current.Id);

        Assert.True(director.TryAdvance("discover_box"));
        Assert.Equal("food_help", director.Current.Id);
    }

    [Fact]
    public void ResetReturnsToDiscovery()
    {
        var director = new RescueDirector(RescueArc.MochiFirstNight());
        director.TryAdvance("discover_box");
        director.Reset();
        Assert.Equal("discover_box", director.Current.Id);
    }
}
