using Whiskerfolk.Cats;
using Xunit;

namespace Whiskerfolk.Tests;

public class BondStateTests
{
    [Fact]
    public void TrustProgressesThroughRelationshipLevels()
    {
        var bond = new BondState();
        Assert.Equal(BondLevel.Unknown, bond.Level);

        bond.AddTrust(35);
        Assert.Equal(BondLevel.Testing, bond.Level);

        bond.AddTrust(30);
        Assert.Equal(BondLevel.Settling, bond.Level);

        bond.AddTrust(35);
        Assert.Equal(BondLevel.Bonded, bond.Level);
        Assert.Equal(100, bond.Trust);
    }

    [Fact]
    public void StoryBeatNeverMovesBondBackward()
    {
        var bond = new BondState();
        bond.AddTrust(90);
        var before = bond.Level;
        bond.SetForStoryBeat(BondLevel.Tolerating);
        Assert.Equal(before, bond.Level);
    }
}
