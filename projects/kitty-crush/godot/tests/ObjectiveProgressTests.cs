using Whiskerfolk.Puzzle;
using Xunit;

namespace Whiskerfolk.Tests;

public class ObjectiveProgressTests
{
    [Fact]
    public void ObjectiveClampsAtTarget()
    {
        var objective = new ObjectiveProgress(MochiObjectives.All["collect_food"]);
        objective.Add(4);
        objective.Add(10);
        Assert.Equal(6, objective.Current);
        Assert.True(objective.Complete);
    }
}
