# South Korea Travel Companion

Offline-first Daegu-focused travel guide: live map with landmarks and bike routes,
transit info, a staycation/residency pin, SOS emergency tools, a currency converter,
and a Korean phrasebook. All guide data (landmarks, transit, phrases, emergency
contacts, currency table) and a vector map of South Korea are bundled into the app
itself, so it opens and works fully with **no internet connection**. When online, it
also shows live map tiles, live currency rates, and live Daegu weather.

This is a native app, not a website — there's nothing to host. It ships as:
- **Windows / Mac / Linux desktop app** (Electron)
- **Android app** (Capacitor)

## Android — get the APK

This project can't be turned into an APK without Google's Android SDK, which isn't
available in the environment that built this project. Instead, a GitHub Actions
workflow (`.github/workflows/android-build.yml`) does the build for you, for free,
using GitHub's own servers:

1. Push this project to a new GitHub repository.
2. Go to the repo's **Actions** tab → **Build Android APK** → **Run workflow**.
   (It also runs automatically on every push to `main`.)
3. When the run finishes (a few minutes), open it and download the
   **korea-travel-companion-apk** artifact at the bottom of the page. Unzip it to get
   `app-release.apk`.
4. Copy the APK to your phone and open it to install. Android will warn that it's from
   an unknown source (normal for an app not on the Play Store) — allow the install.

The workflow signs the APK automatically (it generates its own signing key on first
run and reuses it after), so the APK is installable and can be updated in place by
installing a newer build over it.

### Building it yourself instead, with Android Studio

If you'd rather build locally:
1. Install [Android Studio](https://developer.android.com/studio) (includes the SDK).
2. `npm install`
3. `npm run android:open` — builds the web app, syncs it into the `android/` project,
   and opens it in Android Studio.
4. In Android Studio: **Build → Build App Bundle(s) / APK(s) → Build APK(s)**.

## Desktop app (Windows / Mac / Linux)

```
npm install
npm run package:win     # -> release/Korea Travel Companion-win32-x64/
npm run package:mac     # -> release/Korea Travel Companion-darwin-arm64/
npm run package:linux   # -> release/Korea Travel Companion-linux-x64/
```

Each produces a stand-alone app folder — run the app inside it directly, no installer
needed. Zip the folder to share it.

To run it without packaging, during development: `npm run desktop`.

## Web dev server (for making changes)

```
npm install
npm run dev
```

## Project layout

- `src/` — the app (React + TypeScript), all UI, data and logic
- `src/data/` — bundled offline data: landmarks, transit, phrases, emergency contacts,
  currency rates
- `src/data/offlineBasemap.json` — bundled offline vector map of South Korea
  (province/city/district borders and names), shown whenever live map tiles aren't
  reachable
- `electron/` — the desktop app shell
- `android/` — the Android app project (Capacitor)
- `public/tile-sw.js` — caches map tiles you've viewed so they're available again
  offline
