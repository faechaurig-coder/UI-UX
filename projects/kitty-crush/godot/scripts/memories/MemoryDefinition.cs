namespace Whiskerfolk.Memories;

public sealed record MemoryDefinition(
    string Id,
    string CatId,
    string Title,
    string Description,
    string TriggerKey,
    bool Shareable
);

public static class MochiMemories
{
    public static readonly MemoryDefinition FirstNight = new(
        "mochi_first_night_home",
        "mochi",
        "The warm corner",
        "Mochi left the carrier on his own and chose the box beside the sofa.",
        "box_moment_complete",
        true
    );
}
