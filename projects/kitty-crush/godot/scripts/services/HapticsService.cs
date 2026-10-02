using Godot;

namespace Whiskerfolk.Services;

public sealed class HapticsService
{
    public bool Enabled { get; set; } = true;

    public void Selection() => Vibrate(7);
    public void Match() => Vibrate(10);
    public void Special() => Vibrate(18);
    public void Rescue() => Vibrate(24);
    public void Affection() => Vibrate(12);

    private void Vibrate(int milliseconds)
    {
        if (!Enabled) return;
        Input.VibrateHandheld(milliseconds);
    }
}
