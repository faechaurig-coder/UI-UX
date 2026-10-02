using System.Collections.Generic;
using Whiskerfolk.Cats;
using Xunit;

namespace Whiskerfolk.Tests;

public class CatBehaviorControllerTests
{
    [Fact]
    public void MochiStronglyPrefersBoxOverMetalNoise()
    {
        var state = new CatState { CatId = "mochi" };
        var controller = new CatBehaviorController(seed: 12);

        var options = new List<BehaviorOption>
        {
            new("hide_in_box", new HashSet<string>{"box"}, 0.4f),
            new("inspect_metal", new HashSet<string>{"metal_noise"}, 0.4f)
        };

        var selected = controller.Choose(CatCatalog.Mochi, state, options);
        Assert.Equal("hide_in_box", selected);
    }
}
