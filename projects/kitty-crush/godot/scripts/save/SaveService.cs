using Godot;
using System;
using System.Text.Json;

namespace Whiskerfolk.Save;

public sealed class SaveService
{
    private const string Path = "user://whiskerfolk_save.json";
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = false
    };

    public SaveGame LoadOrCreate()
    {
        if (!FileAccess.FileExists(Path))
            return new SaveGame();

        using var file = FileAccess.Open(Path, FileAccess.ModeFlags.Read);
        var json = file.GetAsText();

        try
        {
            var save = JsonSerializer.Deserialize<SaveGame>(json, JsonOptions);
            if (save is null)
                return new SaveGame();

            return Migrate(save);
        }
        catch (Exception ex)
        {
            GD.PushWarning($"[Whiskerfolk] Save could not be parsed. Starting safe fallback. {ex.Message}");
            return new SaveGame();
        }
    }

    public void Save(SaveGame save)
    {
        save.SchemaVersion = SaveGame.CurrentSchema;
        save.UpdatedAt = DateTimeOffset.UtcNow;
        var json = JsonSerializer.Serialize(save, JsonOptions);

        using var file = FileAccess.Open(Path, FileAccess.ModeFlags.Write);
        file.StoreString(json);
        file.Flush();
    }

    private SaveGame Migrate(SaveGame save)
    {
        // Schema 1 is current. Future migrations must be explicit and sequential.
        if (save.SchemaVersion > SaveGame.CurrentSchema)
        {
            GD.PushWarning("[Whiskerfolk] Save schema is newer than this build.");
            return save;
        }

        save.SchemaVersion = SaveGame.CurrentSchema;
        return save;
    }
}
