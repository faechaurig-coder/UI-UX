using Godot;
using System;

namespace Whiskerfolk.App;

public partial class MochiActor : Control
{
    private static readonly Color Cream = new("#F7EEDF");
    private static readonly Color CreamShadow = new("#E8D9C2");
    private static readonly Color Caramel = new("#C58A5D");
    private static readonly Color Eye = new("#4D6B55");
    private static readonly Color Nose = new("#9F6C65");
    private static readonly Color Ink = new("#5C514A");

    private readonly Random _random = new(2190);
    private float _time;
    private float _trust;
    private string _mood = "watching";

    private float _nextBlink = 2.2f;
    private float _blinkRemaining;
    private float _nextEarTwitch = 1.6f;
    private float _earTwitchRemaining;

    public float Trust
    {
        get => _trust;
        set
        {
            _trust = Mathf.Clamp(value, 0, 100);
            QueueRedraw();
        }
    }

    public string Mood
    {
        get => _mood;
        set
        {
            _mood = value;
            QueueRedraw();
        }
    }

    public override void _Ready()
    {
        MouseFilter = MouseFilterEnum.Ignore;
        CustomMinimumSize = new Vector2(220, 220);
        SetProcess(true);
    }

    public override void _Process(double delta)
    {
        var dt = (float)delta;
        _time += dt;

        _nextBlink -= dt;
        if (_nextBlink <= 0f)
        {
            _blinkRemaining = 0.11f;
            _nextBlink = 2.4f + (float)_random.NextDouble() * 4.2f;
        }
        _blinkRemaining = Mathf.Max(0f, _blinkRemaining - dt);

        _nextEarTwitch -= dt;
        if (_nextEarTwitch <= 0f)
        {
            _earTwitchRemaining = 0.18f;
            _nextEarTwitch = 3.0f + (float)_random.NextDouble() * 6.0f;
        }
        _earTwitchRemaining = Mathf.Max(0f, _earTwitchRemaining - dt);

        QueueRedraw();
    }

    public override void _Draw()
    {
        var relaxed = _mood == "home";
        var curious = _mood == "curious";
        var hiding = _mood == "hiding";

        var breathAmplitude = relaxed ? 1.6f : 2.2f;
        var breath = Mathf.Sin(_time * (relaxed ? 1.55f : 1.9f)) * breathAmplitude;
        var crouch = hiding ? 8f : 0f;
        var headShift = new Vector2(
            curious ? 3f : 0f,
            crouch + (curious ? -2f : 0f)
        );

        Vector2 H(float x, float y) => new(x + headShift.X, y + headShift.Y);

        var bodyCenter = new Vector2(112, 137 + crouch + breath * 0.35f);
        var headCenter = H(105, 82 + breath * 0.22f);

        var tailEnergy = curious ? 0.16f : relaxed ? 0.05f : 0.09f;
        var tailWave = Mathf.Sin(_time * (curious ? 2.1f : 1.15f)) * tailEnergy;

        // Tail: mood changes the rhythm, but movement stays small and cat-like.
        DrawArc(
            new Vector2(144, 139 + crouch),
            53,
            -1.12f + tailWave,
            0.62f + tailWave,
            26,
            CreamShadow,
            18,
            true
        );
        DrawArc(
            new Vector2(144, 139 + crouch),
            53,
            0.30f + tailWave,
            0.62f + tailWave,
            8,
            Caramel,
            19,
            true
        );

        // Body.
        DrawCircle(bodyCenter, hiding ? 57 : 61, CreamShadow);
        DrawCircle(bodyCenter + new Vector2(-8, -4), hiding ? 51 : 55, Cream);

        var twitch = _earTwitchRemaining > 0f
            ? Mathf.Sin((_earTwitchRemaining / 0.18f) * Mathf.Pi) * 5f
            : 0f;

        // Ears. Mochi's caramel ear carries most of the micro-twitch.
        DrawColoredPolygon(
            new Vector2[] { H(48, 63), H(66, 18), H(89, 68) },
            Cream
        );
        DrawColoredPolygon(
            new Vector2[] { H(123, 62), H(151 + twitch, 17 - twitch), H(161, 73) },
            Caramel
        );
        DrawColoredPolygon(
            new Vector2[] { H(57, 57), H(67, 32), H(80, 61) },
            new Color("#DDB9A7")
        );
        DrawColoredPolygon(
            new Vector2[] { H(133, 58), H(149 + twitch * 0.6f, 31 - twitch * 0.6f), H(153, 63) },
            new Color("#D7A483")
        );

        // Head.
        DrawCircle(headCenter, hiding ? 51 : 53, Cream);

        // Caramel comma marking.
        DrawCircle(H(137, 74), 13, Caramel);
        DrawCircle(H(130, 64), 8, Cream);

        var blinking = _blinkRemaining > 0f;
        var eyeHeight = blinking ? 1.4f : hiding ? 6.8f : relaxed ? 7.6f : 8.5f;
        var gaze = curious ? Mathf.Sin(_time * 0.55f) * 2.0f : 0f;

        DrawEllipse(H(85 + gaze, 87), new Vector2(6.5f, eyeHeight), Eye);
        DrawEllipse(H(124 + gaze, 87), new Vector2(6.5f, eyeHeight), Eye);

        if (!blinking)
        {
            DrawCircle(H(83 + gaze, 84), 2.0f, Colors.White);
            DrawCircle(H(122 + gaze, 84), 2.0f, Colors.White);
        }

        // Nose and mouth: neutral, not a permanent cartoon smile.
        DrawCircle(H(105, 103), 4.8f, Nose);
        DrawLine(H(105, 107), H(105, 112), Ink, 1.6f, true);
        DrawArc(H(99, 111), 7, 0.1f, 1.1f, 8, Ink, 1.4f, true);
        DrawArc(H(111, 111), 7, 2.0f, 3.0f, 8, Ink, 1.4f, true);

        // Whiskers.
        DrawLine(H(83, 104), H(48, 98), Ink, 1.1f, true);
        DrawLine(H(82, 110), H(45, 111), Ink, 1.1f, true);
        DrawLine(H(128, 104), H(164, 98), Ink, 1.1f, true);
        DrawLine(H(128, 110), H(166, 112), Ink, 1.1f, true);

        // Front paws. The second paw becomes visible as trust/comfort increases.
        DrawCircle(new Vector2(82, 181 + crouch), 18, Cream);
        if (_trust > 38 || relaxed)
            DrawCircle(new Vector2(117, 181 + crouch), 18, Cream);

        if (hiding)
        {
            // Soft occlusion cue; the final rig will use actual object layering.
            DrawCircle(new Vector2(108, 148 + crouch), 54, new Color(0.15f, 0.15f, 0.15f, 0.07f));
        }
    }

    private void DrawEllipse(Vector2 center, Vector2 radii, Color color)
    {
        var points = new Vector2[24];
        for (var i = 0; i < points.Length; i++)
        {
            var angle = Mathf.Tau * i / points.Length;
            points[i] = center + new Vector2(
                Mathf.Cos(angle) * radii.X,
                Mathf.Sin(angle) * radii.Y
            );
        }
        DrawColoredPolygon(points, color);
    }
}
