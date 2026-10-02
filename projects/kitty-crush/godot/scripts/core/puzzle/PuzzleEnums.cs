namespace Whiskerfolk.Puzzle;

public enum CrystalType
{
    Food = 0,
    Blanket = 1,
    Water = 2,
    Pawprint = 3,
    Nature = 4,
    Empty = -1
}

public enum SpecialType
{
    None = -1,
    Bomb = 0,
    Rainbow = 1,
    Cross = 2,

    // Compatibility aliases for the adapted MIT test suite.
    NONE = None,
    BOMB = Bomb,
    RAINBOW = Rainbow,
    CROSS = Cross
}

public enum MatchShape
{
    Horizontal = 0,
    Vertical = 1,
    LShape = 2,
    TShape = 3,
    Cross = 4,

    // Compatibility aliases for the adapted MIT test suite.
    H_LINE = Horizontal,
    V_LINE = Vertical,
    L_SHAPE = LShape,
    T_SHAPE = TShape,
    CROSS = Cross
}
