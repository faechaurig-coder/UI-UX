using Godot;

namespace Whiskerfolk.App;

public partial class MochiActor : Control
{
    private static readonly Color Cream = new("#F7EEDF");
    private static readonly Color CreamShadow = new("#E8D9C2");
    private static readonly Color Caramel = new("#C58A5D");
    private static readonly Color Eye = new("#4D6B55");
    private static readonly Color Nose = new("#9F6C65");
    private static readonly Color Ink = new("#5C514A");

    private float _time;
    private float _trust;
    private bool _blink;
    private string _mood = "watching";

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
        _time += (float)delta;
        _blink = Mathf.Sin(_time * 1.17f) > 0.985f;
        QueueRedraw();
    }

    public override void _Draw()
    {
        var breath = Mathf.Sin(_time * 2.0f) * 2.3f;
        var bodyCenter = new Vector2(112, 137 + breath * 0.35f);
        var headCenter = new Vector2(105, 82 + breath * 0.22f);

        // Tail: broad soft stroke + caramel tip.
        DrawArc(new Vector2(144, 139), 53, -1.12f, 0.62f, 26, CreamShadow, 18, true);
        DrawArc(new Vector2(144, 139), 53, 0.30f, 0.62f, 8, Caramel, 19, true);

        // Body + chest.
        DrawCircle(bodyCenter, 61, CreamShadow);
        DrawCircle(bodyCenter + new Vector2(-8, -4), 55, Cream);

        // Ears behind head.
        DrawColoredPolygon(
            new Vector2[] { new(48, 63), new(66, 18), new(89, 68) },
            Cream
        );
        DrawColoredPolygon(
            new Vector2[] { new(123, 62), new(151, 17), new(161, 73) },
            Caramel
        );
        DrawColoredPolygon(
            new Vector2[] { new(57, 57), new(67, 32), new(80, 61) },
            new Color("#DDB9A7")
        );
        DrawColoredPolygon(
            new Vector2[] { new(133, 58), new(149, 31), new(153, 63) },
            new Color("#D7A483")
        );

        // Head.
        DrawCircle(headCenter, 53, Cream);

        // Caramel comma marking.
        DrawCircle(new Vector2(137, 74), 13, Caramel);
        DrawCircle(new Vector2(130, 64), 8, Cream);

        // Eyes.
        var eyeHeight = _blink ? 1.5f : 8.5f;
        DrawSetTransform(new Vector2(0, 0), 0, Vector2.One);
        DrawEllipse(new Vector2(85, 87), new Vector2(6.5f, eyeHeight), Eye);
        DrawEllipse(new Vector2(124, 87), new Vector2(6.5f, eyeHeight), Eye);

        if (!_blink)
        {
            DrawCircle(new Vector2(83, 84), 2.0f, Colors.White);
            DrawCircle(new Vector2(122, 84), 2.0f, Colors.White);
        }

        // Nose and tiny mouth.
        DrawCircle(new Vector2(105, 103), 4.8f, Nose);
        DrawLine(new Vector2(105, 107), new Vector2(105, 112), Ink, 1.6f, true);
        DrawArc(new Vector2(99, 111), 7, 0.1f, 1.1f, 8, Ink, 1.4f, true);
        DrawArc(new Vector2(111, 111), 7, 2.0f, 3.0f, 8, Ink, 1.4f, true);

        // Whiskers.
        DrawLine(new Vector2(83, 104), new Vector2(48, 98), Ink, 1.1f, true);
        DrawLine(new Vector2(82, 110), new Vector2(45, 111), Ink, 1.1f, true);
        DrawLine(new Vector2(128, 104), new Vector2(164, 98), Ink, 1.1f, true);
        DrawLine(new Vector2(128, 110), new Vector2(166, 112), Ink, 1.1f, true);

        // Front paws. Low trust keeps one paw pulled in.
        DrawCircle(new Vector2(82, 181), 18, Cream);
        if (_trust > 38 || _mood == "home")
            DrawCircle(new Vector2(117, 181), 18, Cream);

        // Mood cue: slight question head-tilt is represented by ear/eye asymmetry later in rig.
        if (_mood == "hiding")
            DrawCircle(new Vector2(108, 145), 53, new Color(0.15f, 0.15f, 0.15f, 0.08f));
    }

    private void DrawEllipse(Vector2 center, Vector2 radii, Color color)
    {
        var points = new Vector2[24];
        for (int i = 0; i < points.Length; i++)
        {
            var angle = Mathf.Tau * i / points.Length;
            points[i] = center + new Vector2(Mathf.Cos(angle) * radii.X, Mathf.Sin(angle) * radii.Y);
        }
        DrawColoredPolygon(points, color);
    }
}
