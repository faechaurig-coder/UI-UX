using Godot;
using System;

namespace Whiskerfolk.Services;

public static class ProceduralAudioFactory
{
    private const int SampleRate = 44100;

    public static AudioStreamWav SoftTone(
        float frequency,
        float durationSeconds,
        float amplitude = 0.16f,
        float harmonic = 0.0f)
    {
        var frames = Math.Max(1, (int)(SampleRate * durationSeconds));
        var data = new byte[frames * 2];

        for (var i = 0; i < frames; i++)
        {
            var t = (float)i / SampleRate;
            var progress = (float)i / Math.Max(1, frames - 1);
            var envelope = SoftEnvelope(progress);
            var sample =
                MathF.Sin(MathF.Tau * frequency * t) +
                MathF.Sin(MathF.Tau * frequency * 2f * t) * harmonic;

            Write16(data, i, sample * envelope * amplitude);
        }

        return Stream(data);
    }

    public static AudioStreamWav RescueChime()
    {
        var duration = 0.72f;
        var frames = (int)(SampleRate * duration);
        var data = new byte[frames * 2];
        var notes = new[] { 392f, 523.25f, 659.25f };

        for (var i = 0; i < frames; i++)
        {
            var t = (float)i / SampleRate;
            var progress = (float)i / frames;
            var envelope = MathF.Pow(1f - progress, 1.7f);
            var sample = 0f;

            for (var n = 0; n < notes.Length; n++)
            {
                var delayed = t - n * 0.085f;
                if (delayed < 0f) continue;
                var noteEnvelope = MathF.Exp(-delayed * 5.4f);
                sample += MathF.Sin(MathF.Tau * notes[n] * delayed) * noteEnvelope;
            }

            Write16(data, i, sample * envelope * 0.10f);
        }

        return Stream(data);
    }

    public static AudioStreamWav QuestionMrrp()
    {
        var duration = 0.34f;
        var frames = (int)(SampleRate * duration);
        var data = new byte[frames * 2];

        for (var i = 0; i < frames; i++)
        {
            var t = (float)i / SampleRate;
            var progress = (float)i / frames;

            // Small upward inflection with a quiet second formant.
            var frequency = 315f + progress * 135f + MathF.Sin(progress * MathF.Pi) * 45f;
            var phase = MathF.Tau * frequency * t;
            var envelope = MathF.Sin(MathF.PI * Math.Clamp(progress, 0f, 1f));
            var sample =
                MathF.Sin(phase) * 0.72f +
                MathF.Sin(phase * 1.74f) * 0.22f +
                MathF.Sin(phase * 0.51f) * 0.10f;

            Write16(data, i, sample * envelope * 0.12f);
        }

        return Stream(data);
    }

    public static AudioStreamWav Purr()
    {
        var duration = 1.6f;
        var frames = (int)(SampleRate * duration);
        var data = new byte[frames * 2];

        for (var i = 0; i < frames; i++)
        {
            var t = (float)i / SampleRate;
            var progress = (float)i / frames;
            var fade = MathF.Min(1f, MathF.Min(progress * 8f, (1f - progress) * 8f));

            var pulse = 0.55f + MathF.Sin(MathF.Tau * 25f * t) * 0.45f;
            var body =
                MathF.Sin(MathF.Tau * 58f * t) * 0.62f +
                MathF.Sin(MathF.Tau * 116f * t) * 0.16f;

            Write16(data, i, body * pulse * fade * 0.09f);
        }

        return Stream(data);
    }

    public static AudioStreamWav Cardboard()
    {
        var duration = 0.23f;
        var frames = (int)(SampleRate * duration);
        var data = new byte[frames * 2];
        var random = new Random(545);

        var filtered = 0f;
        for (var i = 0; i < frames; i++)
        {
            var progress = (float)i / frames;
            var noise = (float)(random.NextDouble() * 2.0 - 1.0);
            filtered = filtered * 0.72f + noise * 0.28f;
            var envelope = MathF.Pow(1f - progress, 1.8f);
            Write16(data, i, filtered * envelope * 0.10f);
        }

        return Stream(data);
    }

    private static float SoftEnvelope(float progress)
    {
        var attack = MathF.Min(1f, progress / 0.08f);
        var release = MathF.Min(1f, (1f - progress) / 0.28f);
        return MathF.Max(0f, MathF.Min(attack, release));
    }

    private static AudioStreamWav Stream(byte[] data) => new()
    {
        Data = data,
        Format = AudioStreamWav.FormatEnum.Format16Bits,
        MixRate = SampleRate,
        Stereo = false,
        LoopMode = AudioStreamWav.LoopModeEnum.Disabled
    };

    private static void Write16(byte[] data, int frame, float value)
    {
        var clamped = Math.Clamp(value, -1f, 1f);
        var sample = (short)(clamped * short.MaxValue);
        data[frame * 2] = (byte)(sample & 0xff);
        data[frame * 2 + 1] = (byte)((sample >> 8) & 0xff);
    }
}
