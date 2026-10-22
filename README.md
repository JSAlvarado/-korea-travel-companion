# South Korea Travel Companion

An offline-first travel guide for South Korea, focused on Daegu, built by Johnstheward S. Alvarado. Everything a
visitor needs (a map with landmarks and bike routes, transit information, emergency tools, a currency converter and
a Korean phrasebook) is bundled into the app, so it works fully with **no internet connection**. When online, it adds
live map tiles, live currency rates and live Daegu weather.

## Features

| Feature | What it does |
|---|---|
| **Map** | Landmarks and bike routes on a live map, with a bundled offline vector map of South Korea (province, city and district borders and names) whenever live tiles can't be reached |
| **Transit** | Bundled transit information for getting around |
| **Residency pin** | Marks where you are staying, so you can always find your way back |
| **SOS** | Emergency tools and contacts |
| **Currency converter** | A bundled rate table, updated with live rates when online |
| **Korean phrasebook** | Useful phrases for daily situations |
| **Weather** | Live Daegu weather when online |
| **Offline map tiles** | A service worker caches the map tiles you have viewed so they are available again offline |

## Tech stack

- **React 19 + TypeScript**, built with **Vite** and styled with **Tailwind CSS**
- **Leaflet** maps, with Google Maps support
- **Capacitor** for the Android app and **Electron** for the Windows, Mac and Linux desktop app
- **GitHub Actions** builds and signs the Android APK on GitHub's servers (`.github/workflows/android-build.yml`)

---

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
