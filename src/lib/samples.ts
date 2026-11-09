import type { Song } from './types'

const now = new Date().toISOString()

const FULL_BAND = `\\title "Garage Riff"
\\subtitle "Guitar, bass and drums"
\\artist "TabVault"
\\tempo 120
.
\\track "Guitar" "Gtr"
\\instrument 30
\\tuning E4 B3 G3 D3 A2 E2
\\ts 4 4
:8 0.6 0.6 3.6 0.6 5.6 0.6 3.6 0.6 |
0.6 0.6 3.6 0.6 (0.6 2.5).4 r.8 r.8 |
:4 (3.5 5.4 5.3) (3.5 5.4 5.3) (5.5 7.4 7.3) (5.5 7.4 7.3) |
:8 7.3{h} 9.3 7.3 5.3 7.4{b (0 4)} 5.4 7.4 5.4 |
(0.6 2.5 2.4).1

\\track "Bass" "Bass"
\\instrument 33
\\tuning G2 D2 A1 E1
:8 0.4 0.4 3.4 0.4 5.4 0.4 3.4 0.4 |
0.4 0.4 3.4 0.4 0.4.4 r.4 |
:4 3.4 3.4 5.4 5.4 |
:8 5.3 5.3 7.3 5.3 7.4{sl} 5.4 3.4 2.4 |
0.4.1

\\track "Drums" "Drs"
\\instrument percussion
\\articulation defaults
:8 (KickHit HiHatClosed) HiHatClosed (SnareHit HiHatClosed) HiHatClosed (KickHit HiHatClosed) (KickHit HiHatClosed) (SnareHit HiHatClosed) HiHatClosed |
(KickHit HiHatClosed) HiHatClosed (SnareHit HiHatClosed) HiHatClosed (KickHit HiHatClosed) (KickHit HiHatClosed) (SnareHit HiHatClosed) HiHatOpen |
(KickHit RideMiddle) RideMiddle (SnareHit RideMiddle) RideMiddle (KickHit RideMiddle) (KickHit RideMiddle) (SnareHit RideMiddle) RideMiddle |
(KickHit CrashHighHit).4 :16 SnareHit SnareHit HighTomHit HighTomHit MidTomHit MidTomHit LowTomHit LowTomHit (KickHit CrashHighHit).4 |
(KickHit CrashHighHit).1`

const FUNK_GROOVE = `\\title "Pocket Groove"
\\subtitle "Bass and drums"
\\artist "TabVault"
\\tempo 96
.
\\track "Bass" "Bass"
\\instrument 33
\\tuning G2 D2 A1 E1
\\ts 4 4
:8 0.4 0.4 r 0.4 3.4 3.4 r 5.4 |
0.3 0.3 r 0.3 3.3 2.3 0.3 r |
0.4 0.4 r 0.4 3.4 3.4 r 5.4 |
7.3 5.3 7.4{sl} 5.4 3.4 2.4 0.4.4 r.4

\\track "Drums" "Drs"
\\instrument percussion
\\articulation defaults
:16 (KickHit HiHatClosed) HiHatClosed HiHatClosed HiHatClosed (SnareHit HiHatClosed) HiHatClosed HiHatClosed (KickHit HiHatClosed) HiHatClosed HiHatClosed (KickHit HiHatClosed) HiHatClosed (SnareHit HiHatClosed) HiHatClosed HiHatClosed HiHatOpen |
(KickHit HiHatClosed) HiHatClosed HiHatClosed HiHatClosed (SnareHit HiHatClosed) HiHatClosed HiHatClosed (KickHit HiHatClosed) HiHatClosed HiHatClosed (KickHit HiHatClosed) HiHatClosed (SnareHit HiHatClosed) HiHatClosed SnareHit SnareHit |
(KickHit HiHatClosed) HiHatClosed HiHatClosed HiHatClosed (SnareHit HiHatClosed) HiHatClosed HiHatClosed (KickHit HiHatClosed) HiHatClosed HiHatClosed (KickHit HiHatClosed) HiHatClosed (SnareHit HiHatClosed) HiHatClosed HiHatClosed HiHatOpen |
:8 (KickHit CrashHighHit) SnareHit (KickHit HiHatClosed) SnareHit (KickHit HiHatClosed) SnareHit (KickHit CrashHighHit).4`

const SOLO_GUITAR = `\\title "Open Chords"
\\subtitle "Acoustic guitar"
\\artist "TabVault"
\\tempo 80
.
\\track "Guitar" "Gtr"
\\instrument 25
\\tuning E4 B3 G3 D3 A2 E2
\\ts 4 4
:8 3.6 0.4 0.3 0.2 3.1 0.2 0.3 0.4 |
0.5 2.4 2.3 1.2 0.1 1.2 2.3 2.4 |
2.6 2.5 0.4 3.3 3.2 3.3 0.4 2.5 |
(3.6 2.5 0.4 0.3 3.2 3.1).1`

export const SAMPLE_SONGS: Song[] = [
  {
    id: 'sample-garage-riff',
    title: 'Garage Riff',
    artist: 'TabVault',
    instruments: ['guitar', 'bass', 'drums'],
    tags: ['example', 'rock'],
    tex: FULL_BAND,
    tempo: 120,
    notes: 'Three tracks in one song. Pick an instrument above the score to focus on it, or show all.',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'sample-pocket-groove',
    title: 'Pocket Groove',
    artist: 'TabVault',
    instruments: ['bass', 'drums'],
    tags: ['example', 'funk'],
    tex: FUNK_GROOVE,
    tempo: 96,
    notes: 'Bass and drums only. Try the Solo switch to hear just the instrument you are looking at.',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'sample-open-chords',
    title: 'Open Chords',
    artist: 'TabVault',
    instruments: ['guitar'],
    tags: ['example', 'acoustic'],
    tex: SOLO_GUITAR,
    tempo: 80,
    notes: 'Single acoustic guitar track.',
    createdAt: now,
    updatedAt: now,
  },
]

export const NEW_SONG_TEMPLATE = `\\title "New song"
\\artist ""
\\tempo 120
.
\\track "Guitar" "Gtr"
\\instrument 30
\\tuning E4 B3 G3 D3 A2 E2
\\ts 4 4
:4 0.6 2.5 2.4 0.3 |
`

export const TRACK_SNIPPETS: Record<'guitar' | 'bass' | 'drums', string> = {
  guitar: `
\\track "Guitar" "Gtr"
\\instrument 30
\\tuning E4 B3 G3 D3 A2 E2
:4 0.6 2.5 2.4 0.3 |
`,
  bass: `
\\track "Bass" "Bass"
\\instrument 33
\\tuning G2 D2 A1 E1
:8 0.4 0.4 3.4 0.4 5.4 0.4 3.4 0.4 |
`,
  drums: `
\\track "Drums" "Drs"
\\instrument percussion
\\articulation defaults
:8 (KickHit HiHatClosed) HiHatClosed (SnareHit HiHatClosed) HiHatClosed (KickHit HiHatClosed) HiHatClosed (SnareHit HiHatClosed) HiHatClosed |
`,
}
