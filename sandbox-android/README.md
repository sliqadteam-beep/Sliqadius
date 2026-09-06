# Sand:Box Android 2.0 — Offline Native

This version is a real native Android game written in Kotlin. It does **not** use WebView and does **not** need an internet connection.

## Included
- 48 elements total (the previous 28 plus 20 new ones)
- Seeds replace the old Plant tool
- Ants that search for and eat seeds
- Liquid nitrogen at about -196 °C; it cools nearby cells and evaporates faster when warm
- Heat view and electricity view
- Battery, wire, copper, metal, lamp, heater, cooler, sparks and conductive salt water
- Temperature-based material colors
- Melting/freezing for ice/snow, wax, metal, copper, glass, stone/lava, sugar and more
- Simple portrait tile UI inspired by the supplied reference image
- Fixed simulation arrays and reduced heat/electric update frequency to keep CPU usage lower

## Build APK
1. Open the `sandbox-android` folder in Android Studio.
2. Wait for Gradle sync to finish.
3. Choose **Build > Build App Bundle(s) / APK(s) > Build APK(s)**.
4. The debug APK is normally at `app/build/outputs/apk/debug/app-debug.apk`.

Package: `org.sliqado.sandbox`
Minimum Android: Android 8.0 / API 26
