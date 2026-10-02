using Godot;
using System.Collections.Generic;

namespace Whiskerfolk.Services;

public partial class AudioService : Node
{
    public bool Enabled { get; set; } = true;

    private readonly Dictionary<string, AudioStream> _streams = new();

    public void Register(string key, AudioStream stream) => _streams[key] = stream;

    public void PlayOneShot(string key, float volumeDb = 0f)
    {
        if (!Enabled || !_streams.TryGetValue(key, out var stream))
            return;

        var player = new AudioStreamPlayer
        {
            Stream = stream,
            VolumeDb = volumeDb
        };
        AddChild(player);
        player.Finished += player.QueueFree;
        player.Play();
    }
}
