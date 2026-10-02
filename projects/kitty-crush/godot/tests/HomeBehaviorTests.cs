using System.Collections.Generic;
using Whiskerfolk.Cats;
using Whiskerfolk.Home;
using Xunit;

namespace Whiskerfolk.Tests;

public class HomeBehaviorTests
{
    [Fact]
    public void LowBondMochiStillPrefersHisBoxToSeekingPlayer()
    {
        var state = new CatState { CatId = "mochi" };
        var scheduler = new BehaviorScheduler(seed: 7);

        var selected = scheduler.SelectHomeBehavior(
            CatCatalog.Mochi,
            state,
            new List<HomeObjectDefinition> { HomeCatalog.CardboardBox }
        );

        Assert.Contains("cardboard_box_01", selected);
    }
}
