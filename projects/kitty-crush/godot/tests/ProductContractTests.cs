using System.Linq;
using Whiskerfolk.Cats;
using Whiskerfolk.Home;
using Xunit;

namespace Whiskerfolk.Tests;

public class ProductContractTests
{
    [Fact]
    public void InitialRosterContainsEightDistinctCats()
    {
        Assert.Equal(8, CatCatalog.InitialRoster.Count);
        Assert.Equal(8, CatCatalog.InitialRoster.Select(x => x.Id).Distinct().Count());
        Assert.Equal(8, CatCatalog.InitialRoster.Select(x => x.SignatureBehaviorKey).Distinct().Count());
    }

    [Fact]
    public void MochiKeepsHisIdentityInvariants()
    {
        Assert.Equal("mochi", CatCatalog.Mochi.Id);
        Assert.Contains("box-loving", CatCatalog.Mochi.TraitTags);
        Assert.Equal("double_check", CatCatalog.Mochi.SignatureBehaviorKey);
        Assert.True(CatCatalog.Mochi.BaseAffinities["box"] > CatCatalog.Mochi.BaseAffinities["player"]);
    }

    [Fact]
    public void HomeCatalogGivesMochiStrongBoxAffinity()
    {
        Assert.True(HomeCatalog.CardboardBox.CatAffinityOverrides["mochi"] >= 1f);
        Assert.Contains(HomeCatalog.CardboardBox.Slots, slot => slot.Id == "inside");
        Assert.Contains(HomeCatalog.CardboardBox.Slots, slot => slot.Id == "peek");
    }
}
