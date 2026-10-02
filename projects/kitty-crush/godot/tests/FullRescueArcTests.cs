using Whiskerfolk.Rescue;
using Xunit;

namespace Whiskerfolk.Tests;

public class FullRescueArcTests
{
    [Fact]
    public void MochiFirstNightHasIntentionalTenBeatArc()
    {
        var arc = RescueArc.MochiFirstNight();
        Assert.Equal(10, arc.Beats.Count);
        Assert.Equal("discover_box", arc.Beats[0].Id);
        Assert.Equal("first_home", arc.Beats[^1].Id);
    }

    [Fact]
    public void FullArcCanAdvanceInAuthoredOrder()
    {
        var director = new RescueDirector(RescueArc.MochiFirstNight());
        var completed = 0;

        while (!director.IsComplete)
        {
            var current = director.Current.Id;
            Assert.True(director.TryAdvance(current));
            completed++;
        }

        Assert.Equal(9, completed);
        Assert.Equal("first_home", director.Current.Id);
    }
}
