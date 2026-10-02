# Android Build — Whiskerfolk Vertical Slice

## Godot baseline
- Godot 4.6 .NET
- .NET 8
- Android target uses ARM64 only for the vertical slice.

## Local prerequisites for Godot 4.6 Android export
Based on the official Godot 4.6 Android export documentation:
- OpenJDK 17
- Android SDK Platform-Tools 35.0.0+
- Android SDK Build-Tools 35.0.1
- Android SDK Platform 35
- Android command-line tools (latest)
- CMake 3.10.2.4988404
- NDK r28b / 28.1.13356709

## Godot editor settings
Set:
- Java SDK Path
- Android SDK Path

Do not commit machine-specific SDK paths.

## Haptics
`HapticsService` uses `Input.VibrateHandheld()`.

The Android preset explicitly enables:
```
permissions/vibrate=true
```

Without that permission, Android handheld vibration will not run.

## Build
From Godot:
1. Open `project.godot`.
2. Allow C# restore/build.
3. Project → Export.
4. Select **Android Vertical Slice**.
5. Export debug APK for device testing.

CLI after Android/Godot setup:
```bash
godot --path . --export-debug "Android Vertical Slice" build/Whiskerfolk-vertical-slice.apk
```

## Play Store later
Do NOT store release keystore/passwords in this repository.

For release builds, credentials belong in Godot's local export credentials configuration / secure CI secrets.

The production release should be AAB, signed with the final EchauriApps/Play Console signing setup.

## C# Android caution
Godot 4.6 documentation still labels C# Android export support as experimental. Device QA is therefore a mandatory release gate, not optional.
