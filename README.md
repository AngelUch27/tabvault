# TabVault

Store, play and follow your **guitar, bass and drum** tabs. Each song can hold several
tracks; pick the instrument you want to see while the whole band plays, and the sheet
scrolls along with the music.

Live: https://angeluch27.github.io/tabvault/

Built with React + Vite + TypeScript and [alphaTab](https://alphatab.net/). No server, no cost.

## Features

- **Songs library** with search by title, artist or tag, and instrument filters.
- **Multi-track songs**: guitar, bass and drums live in the same song. A segmented control above
  the score picks which instrument to display (or all). **Solo** lets you hear only the instrument
  you are looking at; the **Mixer** mutes individual tracks.
- **Player** with real instrument sounds (built-in MIDI synthesizer), a cursor that follows the
  music, auto-scroll, speed from 50 % to 150 %, loop, metronome, count-in, zoom and horizontal layout.
- **Editor** in [alphaTex](https://alphatab.net/docs/alphatex/introduction) with live preview,
  one-click track templates (add a guitar, bass or drums track), snippets and a syntax cheat sheet.
- **Import** Guitar Pro (.gp3 to .gp8) and MusicXML files. They are converted to editable alphaTex.
- **Backup** and restore everything as a JSON file.
- Works on phones from the browser.

## Where the data lives

In the browser's **IndexedDB** (free, no account). That means:

- Every browser and device has its own library.
- Clearing site data deletes it. Export a backup from time to time (⋯ menu → Export backup).
- To sync across devices or let other people upload songs, implement the `SongStore` interface
  in `src/lib/storage.ts` on top of a backend (Supabase has a free tier). Nothing else changes.

## Development

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Deploy for free on GitHub Pages

```bash
npm run deploy
```

This builds with base path `/tabvault/` and pushes the `dist` folder to the `gh-pages` branch.
GitHub Pages is already configured to serve that branch. If `npm run deploy` fails with
"Filename too long" (very long project paths on Windows), run `git config --global core.longpaths true`
or move the project to a short path such as `C:/dev/tabvault`.

If you rename the repository, change `--base=/tabvault/` in `package.json`.

## Writing tabs (alphaTex in one minute)

```
\title "My song"
\artist "Me"
\tempo 120
.
\track "Guitar" "Gtr"
\instrument 30
\tuning E4 B3 G3 D3 A2 E2
\ts 4 4
:8 0.6 0.6 3.6 0.6 5.6 0.6 3.6 0.6 |
:4 (3.5 5.4 5.3) (5.5 7.4 7.3) (0.6 2.5 2.4) r

\track "Drums" "Drs"
\instrument percussion
\articulation defaults
:8 (KickHit HiHatClosed) HiHatClosed (SnareHit HiHatClosed) HiHatClosed |
```

- `fret.string` → `3.5` is fret 3 on string 5.
- `:8` sets the default duration to eighth notes. `:4` quarters, `:16` sixteenths.
- `(…)` chord, `r` rest, `|` end of bar. Add another `\track` block for each instrument.
- Effects after the note: `{h}` hammer, `{sl}` slide, `{b (0 4)}` bend, `{pm}` palm mute.
- Drums: `\instrument percussion` and names such as `KickHit`, `SnareHit`, `HiHatClosed`,
  `HiHatOpen`, `CrashHighHit`, `RideMiddle`, `HighTomHit`, `MidTomHit`, `LowTomHit`.

Full reference: https://alphatab.net/docs/alphatex/introduction.

## Project layout

```
src/
  components/TabViewer.tsx   score viewer + player, instrument selector, mixer (alphaTab)
  components/Icons.tsx       inline SVG icons
  pages/Library.tsx          songs library, import, backups
  pages/Editor.tsx           alphaTex editor with live preview
  pages/Player.tsx           single song page
  lib/alphatab.ts            helpers: parse alphaTex, Guitar Pro → alphaTex, instrument detection
  lib/storage.ts             data layer (IndexedDB) and the SongStore interface
  lib/samples.ts             example songs and track templates
  lib/types.ts               data model
```

## Licenses

alphaTab is MPL-2.0. The Bravura font is SIL OFL. The SONiVOX soundfont ships with alphaTab under
its own license (see `public/soundfont/LICENSE` after the first build).
