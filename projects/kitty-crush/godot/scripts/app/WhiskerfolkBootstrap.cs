using Godot;
using System;
using System.Collections.Generic;
using System.Linq;
using Whiskerfolk.Cats;
using Whiskerfolk.Puzzle;
using Whiskerfolk.Rescue;
using Whiskerfolk.Home;
using Whiskerfolk.Memories;
using Whiskerfolk.Analytics;
using Whiskerfolk.Services;
using Whiskerfolk.Save;

namespace Whiskerfolk.App;

public partial class WhiskerfolkBootstrap : Control
{
    private static readonly Color Ink = new("#27312E");
    private static readonly Color SoftInk = new("#51605B");
    private static readonly Color Milk = new("#FFF9EF");
    private static readonly Color Paper = new("#F5E9D7");
    private static readonly Color Moss = new("#6F8F78");
    private static readonly Color Sage = new("#AFC8B4");
    private static readonly Color Caramel = new("#C88B5A");
    private static readonly Color Rain = new("#7896A6");
    private static readonly Color Night = new("#273B49");

    private readonly Color[] _tileColors =
    {
        new("#C88B5A"),
        new("#8BA892"),
        new("#7896A6"),
        new("#D29E80"),
        new("#7D946D")
    };

    private readonly string[] _tileMarks = { "●", "▦", "◆", "✦", "○" };

    private RescueDirector _rescue = null!;
    private BondState _bond = new();
    private readonly IAnalyticsService _analytics = new DebugAnalyticsService();
    private readonly HapticsService _haptics = new();
    private readonly AudioService _audio = new();
    private readonly SaveService _saveService = new();
    private SaveGame _save = null!;
    private BoardData? _board;
    private ObjectiveProgress? _objective;
    private GridContainer? _grid;
    private Label? _objectiveLabel;
    private Label? _movesLabel;
    private int _moves;
    private Vector2I? _selected;
    private bool _inputLocked;
    private bool _holdingTrust;
    private float _holdProgress;
    private ProgressBar? _trustBar;
    private Label? _trustCopy;
    private MochiActor? _mochi;
    private int _trustApproachPhase;
    private bool _homeActive;
    private float _homeBehaviorTimer;
    private Control? _homeRoomRoot;
    private CatState? _homeCatState;
    private readonly BehaviorScheduler _homeScheduler = new(seed: 20261001);
    private readonly List<HomeObjectDefinition> _homeObjects = new();
    private readonly Random _homeRandom = new(20261001);
    private ColorRect? _activeSheetOverlay;
    private PanelContainer? _activeSheetPanel;

    public override void _Ready()
    {
        SetAnchorsAndOffsetsPreset(LayoutPreset.FullRect);

        AddChild(_audio);
        _audio.Register("match", ProceduralAudioFactory.SoftTone(440f, 0.10f, 0.07f, 0.08f));
        _audio.Register("mrrp", ProceduralAudioFactory.QuestionMrrp());
        _audio.Register("rescue", ProceduralAudioFactory.RescueChime());
        _audio.Register("purr", ProceduralAudioFactory.Purr());
        _audio.Register("cardboard", ProceduralAudioFactory.Cardboard());

        _save = _saveService.LoadOrCreate();
        if (_save.CatTrust.TryGetValue("mochi", out var savedTrust))
            _bond.AddTrust(savedTrust);

        _rescue = new RescueDirector(RescueArc.MochiFirstNight(), _save.CurrentRescueBeat);
        ResumeFromSave();
    }

    public override void _Notification(int what)
    {
        if (what == NotificationApplicationPaused)
        {
            PersistCurrentState();
            return;
        }

        if (what != NotificationWMGoBackRequest)
            return;

        if (CloseActiveSheet())
            return;

        PersistCurrentState();
        GetTree().Quit();
    }

    private void PersistCurrentState()
    {
        if (_save is null)
            return;

        _save.CurrentRescueBeat = _rescue?.BeatIndex ?? _save.CurrentRescueBeat;
        _save.CatTrust["mochi"] = _bond.Trust;
        _saveService.Save(_save);
    }

    private bool CloseActiveSheet()
    {
        if (_activeSheetOverlay is null && _activeSheetPanel is null)
            return false;

        _activeSheetOverlay?.QueueFree();
        _activeSheetPanel?.QueueFree();
        _activeSheetOverlay = null;
        _activeSheetPanel = null;
        return true;
    }

    private void ResumeFromSave()
    {
        switch (_rescue.BeatIndex)
        {
            case 0:
                BuildIntro();
                break;
            case 1:
                BuildFoodPuzzle();
                break;
            case 2:
                BuildTrust();
                break;
            case 3:
                BuildShelterPuzzle();
                break;
            case 4:
                AdvanceStory("water_rises");
                BuildSafePathPuzzle();
                break;
            case 5:
                BuildSafePathPuzzle();
                break;
            case 6:
                BuildRescue();
                break;
            default:
                BuildHome();
                break;
        }
    }

    private bool AdvanceStory(string completedBeatId)
    {
        if (!_rescue.TryAdvance(completedBeatId))
            return false;

        _save.CurrentRescueBeat = _rescue.BeatIndex;
        _save.CatTrust["mochi"] = _bond.Trust;
        _saveService.Save(_save);
        return true;
    }

    public override void _Process(double delta)
    {
        if (_holdingTrust && _trustBar is not null)
            ProcessTrust((float)delta);

        if (_homeActive)
        {
            _homeBehaviorTimer -= (float)delta;
            if (_homeBehaviorTimer <= 0f)
                RunHomeBehavior();
        }
    }

    private void ProcessTrust(float delta)
    {
        // Deliberately slower than a normal progress meter: this is a relationship beat,
        // not a button-hold skill check.
        _holdProgress = Mathf.Min(100f, _holdProgress + delta * 6.2f);
        _bond.AddTrust(delta * 4.5f);

        if (_trustBar is not null)
            _trustBar.Value = _holdProgress;

        if (_mochi is not null)
            _mochi.Trust = _holdProgress;

        if (_mochi is not null && _trustApproachPhase == 0 && _holdProgress >= 30f)
        {
            _trustApproachPhase = 1;
            MoveMochi(new Vector2(108, 220), 0.7);
            if (_trustCopy is not null)
                _trustCopy.Text = "He moved closer.";
        }
        else if (_mochi is not null && _trustApproachPhase == 1 && _holdProgress >= 52f)
        {
            _trustApproachPhase = 2;
            MoveMochi(new Vector2(84, 220), 0.55);
            if (_trustCopy is not null)
                _trustCopy.Text = "Then he backed away.";
        }
        else if (_mochi is not null && _trustApproachPhase == 2 && _holdProgress >= 72f)
        {
            _trustApproachPhase = 3;
            MoveMochi(new Vector2(132, 220), 0.85);
            _mochi.Mood = "curious";
            if (_trustCopy is not null)
                _trustCopy.Text = "He looked back. Then came closer again.";
        }

        if (_holdProgress < 100f)
            return;

        _holdingTrust = false;
        _bond.SetForStoryBeat(BondLevel.Testing);
        _analytics.Track(AnalyticsEvents.FirstTrustResponse);
        _haptics.Affection();
        AdvanceStory("first_trust");
        BuildShelterPuzzle();
    }

    private void MoveMochi(Vector2 target, double duration)
    {
        if (_mochi is null) return;
        var tween = CreateTween();
        tween.SetTrans(Tween.TransitionType.Cubic);
        tween.SetEase(Tween.EaseType.InOut);
        tween.TweenProperty(_mochi, "position", target, duration);
    }

    private void ClearScreen(Color background)
    {
        _homeActive = false;
        _homeRoomRoot = null;
        _activeSheetOverlay = null;
        _activeSheetPanel = null;

        foreach (var child in GetChildren())
        {
            if (child == _audio)
                continue;

            RemoveChild(child);
            child.QueueFree();
        }

        var bg = new ColorRect
        {
            Color = background,
            MouseFilter = MouseFilterEnum.Ignore
        };
        bg.SetAnchorsAndOffsetsPreset(LayoutPreset.FullRect);
        AddChild(bg);
    }

    private MarginContainer SafeLayer(int horizontal = 28, int vertical = 34)
    {
        var margin = new MarginContainer();
        margin.SetAnchorsAndOffsetsPreset(LayoutPreset.FullRect);
        margin.AddThemeConstantOverride("margin_left", horizontal);
        margin.AddThemeConstantOverride("margin_right", horizontal);
        margin.AddThemeConstantOverride("margin_top", vertical);
        margin.AddThemeConstantOverride("margin_bottom", vertical);
        AddChild(margin);
        return margin;
    }

    private Label Label(string text, int size, Color color, bool bold = false)
    {
        var label = new Label
        {
            Text = text,
            Modulate = color,
            AutowrapMode = TextServer.AutowrapMode.WordSmart
        };
        label.AddThemeFontSizeOverride("font_size", size);
        if (bold)
            label.AddThemeColorOverride("font_shadow_color", new Color(0,0,0,0.04f));
        return label;
    }

    private Button Button(string text, bool primary = true)
    {
        var b = new Button
        {
            Text = text,
            CustomMinimumSize = new Vector2(0, 58),
            FocusMode = FocusModeEnum.None,
            MouseDefaultCursorShape = CursorShape.PointingHand
        };
        b.AddThemeFontSizeOverride("font_size", 18);
        b.AddThemeColorOverride("font_color", primary ? Ink : Milk);
        b.AddThemeColorOverride("font_hover_color", primary ? Ink : Milk);
        b.AddThemeStyleboxOverride("normal", Box(primary ? Milk : new Color(1,1,1,0.08f), 20));
        b.AddThemeStyleboxOverride("hover", Box(primary ? new Color("#FFFDF7") : new Color(1,1,1,0.12f), 20));
        b.AddThemeStyleboxOverride("pressed", Box(primary ? Paper : new Color(1,1,1,0.16f), 20));
        return b;
    }

    private StyleBoxFlat Box(Color color, int radius)
    {
        return new StyleBoxFlat
        {
            BgColor = color,
            CornerRadiusTopLeft = radius,
            CornerRadiusTopRight = radius,
            CornerRadiusBottomLeft = radius,
            CornerRadiusBottomRight = radius,
            ContentMarginLeft = 16,
            ContentMarginRight = 16,
            ContentMarginTop = 12,
            ContentMarginBottom = 12
        };
    }

    private void BuildIntro()
    {
        ClearScreen(Night);
        _analytics.Track(AnalyticsEvents.FirstMochiSeen);
        GetTree().CreateTimer(0.75).Timeout += () => _audio.PlayOneShot("mrrp", -10f);

        var layer = SafeLayer();
        var column = new VBoxContainer
        {
            SizeFlagsVertical = SizeFlags.ExpandFill
        };
        column.AddThemeConstantOverride("separation", 14);
        layer.AddChild(column);

        var brand = Label("WHISKERFOLK", 13, new Color(1,1,1,0.42f), true);
        column.AddChild(brand);
        column.AddChild(Spacer(36));

        var kicker = Label("A RAINY CORNER · 11:47 PM", 12, new Color(1,1,1,0.55f), true);
        column.AddChild(kicker);

        var title = Label("You heard\nsomething.", 50, Milk, true);
        column.AddChild(title);

        var copy = Label("Cardboard shifted under the awning. Then a very small sound.", 17, new Color(1,1,1,0.68f));
        column.AddChild(copy);

        column.AddChild(Spacer(28));

        var stage = new PanelContainer
        {
            CustomMinimumSize = new Vector2(0, 560),
            SizeFlagsVertical = SizeFlags.ExpandFill
        };
        stage.AddThemeStyleboxOverride("panel", Box(new Color("#1D3441"), 34));
        column.AddChild(stage);

        var stageRoot = new Control();
        stage.AddChild(stageRoot);

        var rainGlow = new ColorRect
        {
            Color = new Color("#34525E"),
            Position = new Vector2(28, 40),
            Size = new Vector2(330, 360),
            MouseFilter = MouseFilterEnum.Ignore
        };
        stageRoot.AddChild(rainGlow);

        var boxPanel = new PanelContainer
        {
            Position = new Vector2(86, 260),
            Size = new Vector2(250, 150)
        };
        boxPanel.AddThemeStyleboxOverride("panel", Box(new Color("#8E6B47"), 12));
        stageRoot.AddChild(boxPanel);

        var eyes = Label("•     •", 32, new Color("#9EBC91"), true);
        eyes.HorizontalAlignment = HorizontalAlignment.Center;
        eyes.VerticalAlignment = VerticalAlignment.Center;
        boxPanel.AddChild(eyes);

        var hint = Label("There. Again.", 15, new Color(1,1,1,0.62f));
        column.AddChild(hint);

        var action = Button("Look closer");
        action.Pressed += () =>
        {
            _audio.PlayOneShot("cardboard", -11f);
            AdvanceStory("discover_box");
            BuildFoodPuzzle();
        };
        column.AddChild(action);
    }

    private Control Spacer(float height)
    {
        return new Control { CustomMinimumSize = new Vector2(1, height) };
    }

    private void BuildFoodPuzzle()
    {
        BuildPuzzle(
            MochiObjectives.All["collect_food"],
            "FIRST HELP",
            "Find something he can eat.",
            18,
            () =>
            {
                _bond.SetForStoryBeat(BondLevel.Tolerating);
                AdvanceStory("food_help");
                BuildTrust();
            }
        );
    }

    private void BuildShelterPuzzle()
    {
        BuildPuzzle(
            MochiObjectives.All["collect_blanket"],
            "SHELTER",
            "Give the box a dry cover.",
            16,
            () =>
            {
                AdvanceStory("shelter_help");
                AdvanceStory("water_rises");
                BuildSafePathPuzzle();
            }
        );
    }

    private void BuildPuzzle(
        ObjectiveDefinition definition,
        string kicker,
        string titleText,
        int moves,
        Action onComplete)
    {
        ClearScreen(Milk);
        _objective = new ObjectiveProgress(definition);
        _moves = moves;
        _analytics.Track(AnalyticsEvents.FirstPuzzleStarted, new Dictionary<string, object?> { ["objective"] = definition.Id });
        _selected = null;
        _inputLocked = false;

        var layer = SafeLayer(22, 26);
        var column = new VBoxContainer();
        column.AddThemeConstantOverride("separation", 12);
        layer.AddChild(column);

        var top = new HBoxContainer();
        top.AddThemeConstantOverride("separation", 16);
        column.AddChild(top);

        var head = new VBoxContainer { SizeFlagsHorizontal = SizeFlags.ExpandFill };
        head.AddChild(Label(kicker, 11, Moss, true));
        head.AddChild(Label(titleText, 26, Ink, true));
        top.AddChild(head);

        _movesLabel = Label($"Moves  {_moves}", 15, SoftInk, true);
        top.AddChild(_movesLabel);

        var peek = new PanelContainer { CustomMinimumSize = new Vector2(0, 68) };
        peek.AddThemeStyleboxOverride("panel", Box(Paper, 22));
        var peekText = Label(definition.Id == "collect_food" ? "Two green eyes. He is watching." : "The rain is heavier now.", 14, SoftInk);
        peekText.HorizontalAlignment = HorizontalAlignment.Center;
        peekText.VerticalAlignment = VerticalAlignment.Center;
        peek.AddChild(peekText);
        column.AddChild(peek);

        _objectiveLabel = Label($"0 / {definition.TargetCount}", 16, Ink, true);
        _objectiveLabel.HorizontalAlignment = HorizontalAlignment.Center;
        column.AddChild(_objectiveLabel);

        _grid = new GridContainer
        {
            Columns = 7,
            SizeFlagsHorizontal = SizeFlags.ExpandFill,
            SizeFlagsVertical = SizeFlags.ExpandFill
        };
        _grid.AddThemeConstantOverride("h_separation", 6);
        _grid.AddThemeConstantOverride("v_separation", 6);
        column.AddChild(_grid);

        var tip = Label("Match 3. Every match should change something that matters.", 13, SoftInk);
        tip.HorizontalAlignment = HorizontalAlignment.Center;
        column.AddChild(tip);

        InitializeBoard();
        RenderBoard();

        _objective.Changed += progress =>
        {
            if (_objectiveLabel is not null)
                _objectiveLabel.Text = $"{progress.Current} / {progress.Definition.TargetCount}";

            if (progress.Complete)
            {
                _inputLocked = true;
                _analytics.Track(AnalyticsEvents.FirstPuzzleCompleted, new Dictionary<string, object?> { ["objective"] = progress.Definition.Id });
                _save.CatTrust["mochi"] = _bond.Trust;
                _saveService.Save(_save);
                var complete = Button(definition.Id == "collect_food" ? "He stayed. Keep watching" : "Dry enough. Stay with him");
                complete.Pressed += onComplete;
                column.AddChild(complete);
            }
        };
    }

    private void InitializeBoard()
    {
        _board = new BoardData(7, 7, 5);
        var rng = new RandomNumberGenerator();
        rng.Randomize();

        for (int row = 0; row < 7; row++)
        for (int col = 0; col < 7; col++)
        {
            int type;
            do
            {
                type = rng.RandiRange(0, 4);
            } while (
                (col >= 2 && _board.GetTile(row, col - 1).CrystalType == type && _board.GetTile(row, col - 2).CrystalType == type) ||
                (row >= 2 && _board.GetTile(row - 1, col).CrystalType == type && _board.GetTile(row - 2, col).CrystalType == type)
            );

            _board.GetTile(row, col).SetCrystal(type);
        }

        if (!ValidMoveChecker.HasAnyValidMove(_board))
            InitializeBoard();
    }

    private void RenderBoard()
    {
        if (_grid is null || _board is null) return;

        foreach (var child in _grid.GetChildren())
        {
            _grid.RemoveChild(child);
            child.QueueFree();
        }

        for (int row = 0; row < 7; row++)
        for (int col = 0; col < 7; col++)
        {
            var type = _board.GetTile(row, col).CrystalType;
            var tile = new Button
            {
                Text = _tileMarks[type],
                CustomMinimumSize = new Vector2(58, 58),
                FocusMode = FocusModeEnum.None
            };
            tile.AddThemeFontSizeOverride("font_size", 26);
            tile.AddThemeColorOverride("font_color", Milk);
            tile.AddThemeStyleboxOverride("normal", Box(_tileColors[type], 16));
            tile.AddThemeStyleboxOverride("hover", Box(_tileColors[type].Lightened(0.07f), 16));
            tile.AddThemeStyleboxOverride("pressed", Box(_tileColors[type].Darkened(0.07f), 16));
            var p = new Vector2I(col, row);
            tile.Pressed += () => OnTilePressed(p);
            _grid.AddChild(tile);
        }
    }

    private void OnTilePressed(Vector2I position)
    {
        if (_inputLocked || _board is null || _objective is null)
            return;

        if (_selected is null)
        {
            _selected = position;
            return;
        }

        var first = _selected.Value;
        _selected = null;

        if (Math.Abs(first.X - position.X) + Math.Abs(first.Y - position.Y) != 1)
        {
            _selected = position;
            return;
        }

        _board.Swap(first.Y, first.X, position.Y, position.X);
        var matches = MatchDetector.DetectAll(_board);

        if (!matches.HasMatches())
        {
            _board.Swap(first.Y, first.X, position.Y, position.X);
            RenderBoard();
            return;
        }

        _moves--;
        _haptics.Selection();
        if (_movesLabel is not null)
            _movesLabel.Text = $"Moves  {_moves}";

        ResolveBoard(matches);

        if (_moves <= 0 && !_objective.Complete)
        {
            _moves += 6;
            if (_movesLabel is not null)
                _movesLabel.Text = $"Moves  {_moves}";
        }
    }

    private void ResolveBoard(MatchResult match)
    {
        if (_board is null || _objective is null) return;

        var objectiveType = _objective.Definition.TargetKey switch
        {
            "food" => 0,
            "blanket" => 1,
            "flood" => 2,
            _ => -1
        };

        int cascadeGuard = 0;
        var current = match;

        while (current.HasMatches() && cascadeGuard++ < 12)
        {
            var positions = current.GetAllPositions().Distinct().ToList();
            _haptics.Match();
            _audio.PlayOneShot("match", -15f);

            foreach (var pos in positions)
            {
                var cell = _board.GetTile(pos.Y, pos.X);
                if (cell.CrystalType == objectiveType)
                    _objective.Add();

                cell.Clear();
            }

            GravitySystem.ApplyGravity(_board);
            SpawnSystem.FillEmpty(_board);
            current = MatchDetector.DetectAll(_board);
        }

        RenderBoard();
    }

    private void BuildTrust()
    {
        ClearScreen(Night);
        _holdProgress = 8;
        _holdingTrust = false;
        _trustApproachPhase = 0;

        var layer = SafeLayer(28, 34);
        var column = new VBoxContainer
        {
            SizeFlagsVertical = SizeFlags.ExpandFill
        };
        column.AddThemeConstantOverride("separation", 14);
        layer.AddChild(column);

        column.AddChild(Label("TRUST", 12, Sage, true));
        column.AddChild(Label("Don’t reach for him.", 44, Milk, true));
        _trustCopy = Label("Stay close. Let him make the next move.", 17, new Color(1,1,1,0.7f));
        column.AddChild(_trustCopy);

        var stage = new Control
        {
            CustomMinimumSize = new Vector2(0, 650),
            SizeFlagsVertical = SizeFlags.ExpandFill
        };
        column.AddChild(stage);

        var box = new PanelContainer
        {
            Position = new Vector2(20, 310),
            Size = new Vector2(220, 135)
        };
        box.AddThemeStyleboxOverride("panel", Box(new Color("#79593B"), 12));
        stage.AddChild(box);

        _mochi = new MochiActor
        {
            Position = new Vector2(70, 220),
            Size = new Vector2(220, 220),
            Trust = _holdProgress
        };
        stage.AddChild(_mochi);

        _trustBar = new ProgressBar
        {
            MinValue = 0,
            MaxValue = 100,
            Value = _holdProgress,
            ShowPercentage = false,
            CustomMinimumSize = new Vector2(0, 8)
        };
        _trustBar.AddThemeStyleboxOverride("background", Box(new Color(1,1,1,0.12f), 8));
        _trustBar.AddThemeStyleboxOverride("fill", Box(Sage, 8));
        column.AddChild(_trustBar);

        var hold = Button("Hold still", false);
        hold.ButtonDown += () => _holdingTrust = true;
        hold.ButtonUp += () =>
        {
            if (_holdProgress < 100)
            {
                _holdingTrust = false;
                _holdProgress = Mathf.Max(8, _holdProgress - 6);
                if (_trustBar is not null) _trustBar.Value = _holdProgress;
                if (_trustCopy is not null) _trustCopy.Text = "Too soon. Try again, slowly.";
            }
        };
        column.AddChild(hold);
    }

    private void BuildSafePathPuzzle()
    {
        BuildPuzzle(
            MochiObjectives.All["safe_path_carrier"],
            "SAFE PATH",
            "Clear the water from his way.",
            14,
            () =>
            {
                AdvanceStory("safe_path");
                BuildRescue();
            }
        );
    }

    private void BuildRescue()
    {
        ClearScreen(new Color("#20353F"));
        _analytics.Track(AnalyticsEvents.RescueStarted);

        var layer = SafeLayer();
        var column = new VBoxContainer
        {
            SizeFlagsVertical = SizeFlags.ExpandFill
        };
        column.AddThemeConstantOverride("separation", 14);
        layer.AddChild(column);

        column.AddChild(Label("ONE LAST THING", 12, Sage, true));
        column.AddChild(Label("Open it.\nThen wait.", 46, Milk, true));
        column.AddChild(Label("The water is getting closer. He has to choose the safe place himself.", 17, new Color(1,1,1,0.7f)));

        var stage = new PanelContainer
        {
            CustomMinimumSize = new Vector2(0, 620),
            SizeFlagsVertical = SizeFlags.ExpandFill
        };
        stage.AddThemeStyleboxOverride("panel", Box(new Color("#294550"), 30));
        column.AddChild(stage);

        var stageRoot = new Control();
        stage.AddChild(stageRoot);

        _mochi = new MochiActor
        {
            Position = new Vector2(30, 285),
            Size = new Vector2(220, 220),
            Trust = 52
        };
        stageRoot.AddChild(_mochi);

        var carrier = new PanelContainer
        {
            Position = new Vector2(245, 310),
            Size = new Vector2(180, 145)
        };
        carrier.AddThemeStyleboxOverride("panel", Box(new Color("#C8B898"), 22));
        stageRoot.AddChild(carrier);

        var bars = Label("│ │ │ │", 28, new Color("#454D4B"), true);
        bars.HorizontalAlignment = HorizontalAlignment.Center;
        bars.VerticalAlignment = VerticalAlignment.Center;
        carrier.AddChild(bars);

        var open = Button("Open the carrier");
        open.Pressed += () =>
        {
            _bond.SetForStoryBeat(BondLevel.TrustingAction);
            _analytics.Track(AnalyticsEvents.RescueCompleted);
            _haptics.Rescue();
            _audio.PlayOneShot("rescue", -9f);
            AdvanceStory("carrier_choice");
            open.Text = "Wait…";
            open.Disabled = true;
            GetTree().CreateTimer(1.3).Timeout += () =>
            {
                if (_mochi is not null)
                {
                    var tween = CreateTween();
                    tween.SetTrans(Tween.TransitionType.Cubic);
                    tween.SetEase(Tween.EaseType.InOut);
                    tween.TweenProperty(_mochi, "position", new Vector2(228, 292), 1.5);
                    tween.Parallel().TweenProperty(_mochi, "modulate:a", 0.0f, 1.5);
                    tween.Finished += BuildHome;
                }
            };
        };
        column.AddChild(open);
    }

    private void BuildHome()
    {
        var returningHome = _save.RescuedCats.Contains("mochi") || _rescue.BeatIndex >= 9;

        ClearScreen(new Color("#E9D8C0"));
        _bond.SetForStoryBeat(BondLevel.NewHome);

        if (!returningHome && _rescue.Current.Id == "ride_home")
            AdvanceStory("ride_home");

        if (!returningHome)
            _analytics.Track(AnalyticsEvents.BoxMomentStarted);
        else
        {
            // Repair older/partially written saves without replaying first-time analytics.
            _save.RescuedCats.Add("mochi");
            _save.Memories.Add(MochiMemories.FirstNight.Id);
            _saveService.Save(_save);
        }

        var layer = SafeLayer();
        var column = new VBoxContainer
        {
            SizeFlagsVertical = SizeFlags.ExpandFill
        };
        column.AddThemeConstantOverride("separation", 12);
        layer.AddChild(column);

        column.AddChild(Label("HOME", 12, Moss, true));
        var homeTitle = Label(
            returningHome ? "Mochi is\nhome." : "Give him\na moment.",
            46,
            Ink,
            true
        );
        column.AddChild(homeTitle);

        var homeCopy = Label(
            returningHome
                ? "He has already started choosing his favorite places."
                : "New room. New sounds. Let him decide when to come out.",
            16,
            SoftInk
        );
        column.AddChild(homeCopy);

        var room = new PanelContainer
        {
            CustomMinimumSize = new Vector2(0, 650),
            SizeFlagsVertical = SizeFlags.ExpandFill
        };
        room.AddThemeStyleboxOverride("panel", Box(new Color("#F2E5D1"), 32));
        column.AddChild(room);

        var roomRoot = new Control();
        room.AddChild(roomRoot);
        _homeRoomRoot = roomRoot;

        var sofa = new PanelContainer
        {
            Position = new Vector2(26, 215),
            Size = new Vector2(300, 170)
        };
        sofa.AddThemeStyleboxOverride("panel", Box(new Color("#94AA96"), 36));
        roomRoot.AddChild(sofa);

        var homeBox = new PanelContainer
        {
            Position = new Vector2(295, 360),
            Size = new Vector2(150, 105)
        };
        homeBox.AddThemeStyleboxOverride("panel", Box(new Color("#9B724B"), 10));
        roomRoot.AddChild(homeBox);

        PanelContainer? carrier = null;
        if (!returningHome)
        {
            carrier = new PanelContainer
            {
                Position = new Vector2(300, 285),
                Size = new Vector2(165, 130)
            };
            carrier.AddThemeStyleboxOverride("panel", Box(new Color("#C8B898"), 20));
            roomRoot.AddChild(carrier);

            var bars = Label("│ │ │ │", 24, new Color("#565B54"), true);
            bars.HorizontalAlignment = HorizontalAlignment.Center;
            bars.VerticalAlignment = VerticalAlignment.Center;
            carrier.AddChild(bars);
        }

        _mochi = new MochiActor
        {
            Position = returningHome ? new Vector2(170, 300) : new Vector2(265, 300),
            Size = new Vector2(220, 220),
            Trust = 64,
            Mood = returningHome ? "home" : "curious",
            Modulate = returningHome ? Colors.White : new Color(1,1,1,0)
        };
        roomRoot.AddChild(_mochi);

        _homeObjects.Clear();
        _homeObjects.Add(HomeCatalog.CardboardBox);
        _homeCatState = new CatState { CatId = "mochi" };
        _homeCatState.Bond.AddTrust(_bond.Trust);

        if (_save.OwnedHomeObjects.Contains(HomeCatalog.FoldedBlanket.Id))
        {
            AddBlanketVisual(roomRoot);
            _homeObjects.Add(HomeCatalog.FoldedBlanket);
        }

        var actions = new HBoxContainer();
        actions.AddThemeConstantOverride("separation", 8);
        column.AddChild(actions);

        var catbook = Button("Catbook");
        catbook.SizeFlagsHorizontal = SizeFlags.ExpandFill;
        catbook.Pressed += () => ShowSheet(
            "MOCHI · 01",
            "Cautious observer",
            "He approaches twice before he trusts once.\n\nLikes: cardboard, soft fabric, sun patches.\nDiscovered tonight: the double-check."
        );
        actions.AddChild(catbook);

        var memory = Button("First memory");
        memory.SizeFlagsHorizontal = SizeFlags.ExpandFill;
        memory.Pressed += () => ShowSheet(
            "FIRST NIGHT",
            MochiMemories.FirstNight.Title,
            MochiMemories.FirstNight.Description
        );
        actions.AddChild(memory);

        var blanket = Button(
            _save.OwnedHomeObjects.Contains(HomeCatalog.FoldedBlanket.Id)
                ? "Blanket placed"
                : "Place his blanket"
        );
        blanket.Disabled = _save.OwnedHomeObjects.Contains(HomeCatalog.FoldedBlanket.Id);
        blanket.Pressed += () =>
        {
            if (_homeRoomRoot is null) return;

            blanket.Disabled = true;
            blanket.Text = "Blanket placed";
            AddBlanketVisual(_homeRoomRoot);

            if (!_homeObjects.Contains(HomeCatalog.FoldedBlanket))
                _homeObjects.Add(HomeCatalog.FoldedBlanket);

            _save.OwnedHomeObjects.Add(HomeCatalog.FoldedBlanket.Id);
            _saveService.Save(_save);
            _analytics.Track(AnalyticsEvents.FirstObjectInteraction,
                new Dictionary<string, object?> { ["object"] = HomeCatalog.FoldedBlanket.Id });
            _haptics.Affection();

            if (_mochi is not null)
            {
                _mochi.Mood = "curious";
                MoveMochi(new Vector2(38, 335), 1.4);
            }
        };
        column.AddChild(blanket);

        if (returningHome)
        {
            StartHomeLife();
        }
        else
        {
            PlayBoxMoment(carrier!, homeTitle, homeCopy);
        }
    }

    private void PlayBoxMoment(PanelContainer carrier, Label homeTitle, Label homeCopy)
    {
        if (_mochi is null) return;

        // Peek → retreat → second look → choose the room → settle near the familiar box.
        var sequence = CreateTween();
        sequence.SetTrans(Tween.TransitionType.Cubic);
        sequence.SetEase(Tween.EaseType.InOut);
        sequence.TweenInterval(0.9);
        sequence.TweenProperty(_mochi, "modulate:a", 1.0f, 0.45);
        sequence.TweenProperty(_mochi, "position", new Vector2(235, 300), 0.7);
        sequence.TweenInterval(0.45);
        sequence.TweenProperty(_mochi, "position", new Vector2(262, 300), 0.4);
        sequence.TweenInterval(0.5);
        sequence.TweenProperty(_mochi, "position", new Vector2(220, 305), 0.75);
        sequence.TweenProperty(_mochi, "position", new Vector2(238, 330), 1.05);
        sequence.Parallel().TweenProperty(carrier, "modulate:a", 0.35f, 0.9);
        sequence.Finished += () => CompleteBoxMoment(homeTitle, homeCopy);
    }

    private void CompleteBoxMoment(Label homeTitle, Label homeCopy)
    {
        if (_rescue.Current.Id == "box_moment")
            AdvanceStory("box_moment");

        _save.RescuedCats.Add("mochi");
        _save.Memories.Add(MochiMemories.FirstNight.Id);
        _save.CatTrust["mochi"] = _bond.Trust;
        _saveService.Save(_save);

        _analytics.Track(AnalyticsEvents.BoxMomentCompleted);
        _analytics.Track(AnalyticsEvents.HomeFirstEntry);
        _analytics.Track(AnalyticsEvents.FirstMemoryCreated);
        _haptics.Affection();
        _audio.PlayOneShot("purr", -10f);

        homeTitle.Text = "Mochi lives\nhere now.";
        homeCopy.Text = "No reward chest. No score screen. He chose the warm corner.";
        if (_mochi is not null)
            _mochi.Mood = "home";

        StartHomeLife();
    }

    private void AddBlanketVisual(Control roomRoot)
    {
        var cloth = new PanelContainer
        {
            Position = new Vector2(46, 410),
            Size = new Vector2(170, 70),
            MouseFilter = MouseFilterEnum.Ignore
        };
        cloth.AddThemeStyleboxOverride("panel", Box(new Color("#D8B99A"), 28));
        roomRoot.AddChild(cloth);
    }

    private void StartHomeLife()
    {
        if (_homeCatState is null || _mochi is null)
            return;

        _homeActive = true;
        _homeBehaviorTimer = 3.5f;
    }

    private void RunHomeBehavior()
    {
        if (!_homeActive || _mochi is null || _homeCatState is null)
            return;

        var behavior = _homeScheduler.SelectHomeBehavior(
            CatCatalog.Mochi,
            _homeCatState,
            _homeObjects
        );

        _homeCatState.CurrentBehavior = behavior;
        _homeCatState.SeenBehaviors.Add(behavior);

        Vector2? target = null;
        var mood = "home";

        if (behavior.StartsWith($"{HomeCatalog.CardboardBox.Id}:"))
        {
            _homeCatState.CurrentObjectId = HomeCatalog.CardboardBox.Id;
            if (behavior.EndsWith(":inside"))
            {
                target = new Vector2(244, 338);
                mood = "hiding";
            }
            else if (behavior.EndsWith(":peek"))
            {
                target = new Vector2(232, 323);
                mood = "curious";
            }
            else
            {
                target = new Vector2(255, 286);
            }
        }
        else if (behavior.StartsWith($"{HomeCatalog.FoldedBlanket.Id}:"))
        {
            _homeCatState.CurrentObjectId = HomeCatalog.FoldedBlanket.Id;
            target = new Vector2(36, 336);
            mood = "home";
        }
        else if (behavior == "watch_player")
        {
            _homeCatState.CurrentObjectId = null;
            target = new Vector2(128, 310);
            mood = "curious";
        }
        else if (behavior == "groom")
        {
            _homeCatState.CurrentObjectId = null;
            target = new Vector2(155, 315);
            mood = "home";
        }
        else
        {
            _homeCatState.CurrentObjectId = null;
        }

        _mochi.Mood = mood;

        if (target.HasValue)
            MoveMochi(target.Value, 1.2);

        _homeBehaviorTimer = 5.0f + (float)_homeRandom.NextDouble() * 4.5f;
    }

    private void ShowSheet(string kicker, string title, string copy)
    {
        CloseActiveSheet();

        var overlay = new ColorRect
        {
            Color = new Color(0.05f,0.07f,0.07f,0.36f),
            MouseFilter = MouseFilterEnum.Stop
        };
        overlay.SetAnchorsAndOffsetsPreset(LayoutPreset.FullRect);
        AddChild(overlay);
        _activeSheetOverlay = overlay;

        var panel = new PanelContainer
        {
            AnchorLeft = 0.04f,
            AnchorRight = 0.96f,
            AnchorTop = 0.48f,
            AnchorBottom = 0.98f,
            OffsetLeft = 0,
            OffsetRight = 0,
            OffsetTop = 0,
            OffsetBottom = 0
        };
        panel.AddThemeStyleboxOverride("panel", Box(Milk, 30));
        AddChild(panel);
        _activeSheetPanel = panel;

        var margin = new MarginContainer();
        margin.AddThemeConstantOverride("margin_left", 24);
        margin.AddThemeConstantOverride("margin_right", 24);
        margin.AddThemeConstantOverride("margin_top", 24);
        margin.AddThemeConstantOverride("margin_bottom", 24);
        panel.AddChild(margin);

        var col = new VBoxContainer();
        col.AddThemeConstantOverride("separation", 10);
        margin.AddChild(col);
        col.AddChild(Label(kicker, 11, Moss, true));
        col.AddChild(Label(title, 33, Ink, true));
        col.AddChild(Label(copy, 16, SoftInk));

        var close = Button("Close");
        close.Pressed += () => CloseActiveSheet();
        col.AddChild(close);
    }
}
