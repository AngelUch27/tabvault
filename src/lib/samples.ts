import type { Tab } from './types'

const now = new Date().toISOString()

const GUITAR = `\\title "Riff de ejemplo"
\\subtitle "Guitarra eléctrica"
\\artist "TabVault"
\\tempo 120
.
\\track "Guitarra" "Gtr"
\\instrument 30
\\tuning E4 B3 G3 D3 A2 E2
\\ts 4 4
:8 0.6 0.6 3.6 0.6 5.6 0.6 3.6 0.6 |
0.6 0.6 3.6 0.6 (0.6 2.5).4 r.8 r.8 |
:4 (3.5 5.4 5.3) (3.5 5.4 5.3) (5.5 7.4 7.3) (5.5 7.4 7.3) |
:8 7.3{h} 9.3 7.3 5.3 7.4{b (0 4)} 5.4 7.4 5.4 |
(0.6 2.5 2.4).1`

const BASS = `\\title "Groove de ejemplo"
\\subtitle "Bajo"
\\artist "TabVault"
\\tempo 96
.
\\track "Bajo" "Bass"
\\instrument 33
\\tuning G2 D2 A1 E1
\\ts 4 4
:8 0.4 0.4 r 0.4 3.4 3.4 r 5.4 |
0.3 0.3 r 0.3 3.3 2.3 0.3 r |
0.4 0.4 r 0.4 3.4 3.4 r 5.4 |
7.3 5.3 7.4{sl} 5.4 3.4 2.4 0.4.4 r.4`

const DRUMS = `\\title "Ritmo básico"
\\subtitle "Batería"
\\artist "TabVault"
\\tempo 110
.
\\track "Batería" "Drs"
\\instrument percussion
\\articulation defaults
\\ts 4 4
:8 (KickHit HiHatClosed) HiHatClosed (SnareHit HiHatClosed) HiHatClosed (KickHit HiHatClosed) (KickHit HiHatClosed) (SnareHit HiHatClosed) HiHatClosed |
(KickHit HiHatClosed) HiHatClosed (SnareHit HiHatClosed) HiHatClosed (KickHit HiHatClosed) (KickHit HiHatClosed) (SnareHit HiHatClosed) HiHatOpen |
(KickHit HiHatClosed) HiHatClosed (SnareHit HiHatClosed) HiHatClosed (KickHit HiHatClosed) (KickHit HiHatClosed) (SnareHit HiHatClosed) HiHatClosed |
(KickHit CrashHighHit).4 :16 SnareHit SnareHit HighTomHit HighTomHit MidTomHit MidTomHit LowTomHit LowTomHit (KickHit CrashHighHit).4`

const BAND = `\\title "Banda completa"
\\subtitle "Guitarra, bajo y batería"
\\artist "TabVault"
\\tempo 120
.
\\track "Guitarra" "Gtr"
\\instrument 30
\\tuning E4 B3 G3 D3 A2 E2
\\ts 4 4
:8 0.6 0.6 3.6 0.6 5.6 0.6 3.6 0.6 |
0.6 0.6 3.6 0.6 5.6 0.6 3.6 0.6 |
:4 (3.5 5.4 5.3) (3.5 5.4 5.3) (5.5 7.4 7.3) (5.5 7.4 7.3) |
(0.6 2.5 2.4).1

\\track "Bajo" "Bass"
\\instrument 33
\\tuning G2 D2 A1 E1
:8 0.4 0.4 3.4 0.4 5.4 0.4 3.4 0.4 |
0.4 0.4 3.4 0.4 5.4 0.4 3.4 0.4 |
:4 3.4 3.4 5.4 5.4 |
0.4.1

\\track "Batería" "Drs"
\\instrument percussion
\\articulation defaults
:8 (KickHit HiHatClosed) HiHatClosed (SnareHit HiHatClosed) HiHatClosed (KickHit HiHatClosed) (KickHit HiHatClosed) (SnareHit HiHatClosed) HiHatClosed |
(KickHit HiHatClosed) HiHatClosed (SnareHit HiHatClosed) HiHatClosed (KickHit HiHatClosed) (KickHit HiHatClosed) (SnareHit HiHatClosed) HiHatOpen |
:4 (KickHit CrashHighHit) SnareHit KickHit SnareHit |
(KickHit CrashHighHit).1`

export const SAMPLE_TABS: Tab[] = [
  {
    id: 'sample-guitar',
    title: 'Riff de ejemplo',
    artist: 'TabVault',
    instrument: 'guitar',
    tags: ['ejemplo', 'rock'],
    tex: GUITAR,
    tempo: 120,
    notes: 'Ejemplo incluido con la app. Puedes editarlo o borrarlo.',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'sample-bass',
    title: 'Groove de ejemplo',
    artist: 'TabVault',
    instrument: 'bass',
    tags: ['ejemplo', 'funk'],
    tex: BASS,
    tempo: 96,
    notes: 'Ejemplo incluido con la app.',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'sample-drums',
    title: 'Ritmo básico',
    artist: 'TabVault',
    instrument: 'drums',
    tags: ['ejemplo', 'rock'],
    tex: DRUMS,
    tempo: 110,
    notes: 'Ejemplo incluido con la app.',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'sample-band',
    title: 'Banda completa',
    artist: 'TabVault',
    instrument: 'multi',
    tags: ['ejemplo', 'banda'],
    tex: BAND,
    tempo: 120,
    notes: 'Tres pistas en una misma partitura. Usa el menú Pistas para silenciar o aislar cada una.',
    createdAt: now,
    updatedAt: now,
  },
]

export const NEW_TAB_TEMPLATE: Record<string, string> = {
  guitar: `\\title "Nueva canción"
\\artist ""
\\tempo 120
.
\\track "Guitarra" "Gtr"
\\instrument 30
\\tuning E4 B3 G3 D3 A2 E2
\\ts 4 4
:4 0.6 2.5 2.4 0.3 |
`,
  bass: `\\title "Nueva canción"
\\artist ""
\\tempo 100
.
\\track "Bajo" "Bass"
\\instrument 33
\\tuning G2 D2 A1 E1
\\ts 4 4
:8 0.4 0.4 3.4 0.4 5.4 0.4 3.4 0.4 |
`,
  drums: `\\title "Nueva canción"
\\artist ""
\\tempo 110
.
\\track "Batería" "Drs"
\\instrument percussion
\\articulation defaults
\\ts 4 4
:8 (KickHit HiHatClosed) HiHatClosed (SnareHit HiHatClosed) HiHatClosed (KickHit HiHatClosed) HiHatClosed (SnareHit HiHatClosed) HiHatClosed |
`,
}
