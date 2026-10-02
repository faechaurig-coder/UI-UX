namespace Whiskerfolk.Cats;

public enum BondLevel
{
    Unknown = 0,
    Watching = 1,
    Tolerating = 2,
    Testing = 3,
    TrustingAction = 4,
    NewHome = 5,
    Settling = 6,
    Initiating = 7,
    Familiar = 8,
    Bonded = 9
}

public sealed class BondState
{
    public BondLevel Level { get; private set; } = BondLevel.Unknown;
    public float Trust { get; private set; } = 0f;

    public void AddTrust(float amount)
    {
        Trust = System.Math.Clamp(Trust + amount, 0f, 100f);
        Level = Trust switch
        {
            < 6f => BondLevel.Unknown,
            < 16f => BondLevel.Watching,
            < 28f => BondLevel.Tolerating,
            < 42f => BondLevel.Testing,
            < 55f => BondLevel.TrustingAction,
            < 64f => BondLevel.NewHome,
            < 73f => BondLevel.Settling,
            < 83f => BondLevel.Initiating,
            < 94f => BondLevel.Familiar,
            _ => BondLevel.Bonded
        };
    }

    public void SetForStoryBeat(BondLevel minimum)
    {
        if (Level >= minimum) return;
        Level = minimum;
        Trust = minimum switch
        {
            BondLevel.Unknown => 0,
            BondLevel.Watching => 8,
            BondLevel.Tolerating => 20,
            BondLevel.Testing => 34,
            BondLevel.TrustingAction => 49,
            BondLevel.NewHome => 60,
            BondLevel.Settling => 68,
            BondLevel.Initiating => 78,
            BondLevel.Familiar => 89,
            BondLevel.Bonded => 100,
            _ => Trust
        };
    }
}
