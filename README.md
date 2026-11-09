# TabVault

Aplicación web para guardar, escuchar y seguir tablaturas de **guitarra, bajo y batería**.
La partitura suena con instrumentos reales y la hoja avanza sola al ritmo de la música.

Hecha con React + Vite + TypeScript y [alphaTab](https://alphatab.net/). Sin servidor y sin costo.

## Qué hace

- **Biblioteca** con búsqueda por título, artista y etiquetas, y filtro por instrumento.
- **Reproductor** con sonido (sintetizador MIDI incluido), cursor que sigue la música, auto-scroll,
  velocidad (50 % a 150 %), bucle, metrónomo, cuenta de entrada, zoom y diseño horizontal.
- **Multipista**: una misma canción puede tener guitarra, bajo y batería. Cada pista se puede
  ocultar, silenciar o poner en solo.
- **Editor** de tablaturas en formato [alphaTex](https://alphatab.net/docs/alphatex/introduction)
  con vista previa en vivo, botones de inserción rápida y chuleta de sintaxis.
- **Importar** archivos Guitar Pro (.gp3 a .gp8) y MusicXML. Se convierten a alphaTex y quedan editables.
- **Copia de seguridad** en JSON para exportar y restaurar todas tus tablaturas.
- Funciona en móvil desde el navegador.

## Dónde se guardan los datos

Por ahora en **IndexedDB del navegador** (gratis, sin cuenta). Eso significa:

- Cada navegador y cada dispositivo tiene su propia biblioteca.
- Si borras los datos del sitio, se pierden. Usa **Copia de seguridad** de vez en cuando.
- Para compartir entre dispositivos o entre personas, el siguiente paso es implementar la interfaz
  `TabStore` de `src/lib/storage.ts` sobre un backend (Supabase tiene un nivel gratuito). El resto
  de la app no cambia.

## Desarrollo

```bash
npm install
npm run dev
```

Abre http://localhost:5173.

## Publicar gratis en GitHub Pages

El proyecto ya trae el script. Con el repositorio creado en GitHub y el remoto configurado:

```bash
npm run deploy
```

Eso compila con la ruta base `/tabvault/` y sube la carpeta `dist` a la rama `gh-pages`.
Luego en GitHub: Settings → Pages → Source: rama `gh-pages`. La app queda en
`https://<usuario>.github.io/tabvault/`.

Si `npm run deploy` falla con "Filename too long" (pasa cuando la carpeta del proyecto tiene una ruta muy larga en Windows), ejecuta `git config --global core.longpaths true` o mueve el proyecto a una ruta corta como `C:/dev/tabvault`.

La app está publicada en https://angeluch27.github.io/tabvault/.

Si el repositorio se llama distinto, cambia `--base=/tabvault/` en `package.json` por el nombre nuevo.

## Escribir tablaturas (alphaTex en 1 minuto)

```
\title "Mi canción"
\artist "Yo"
\tempo 120
.
\track "Guitarra" "Gtr"
\instrument 30
\tuning E4 B3 G3 D3 A2 E2
\ts 4 4
:8 0.6 0.6 3.6 0.6 5.6 0.6 3.6 0.6 |
:4 (3.5 5.4 5.3) (5.5 7.4 7.3) (0.6 2.5 2.4) r
```

- `traste.cuerda` → `3.5` es traste 3 en la cuerda 5.
- `:8` cambia la duración por defecto a corcheas. `:4` negras, `:16` semicorcheas.
- `(…)` acorde, `r` silencio, `|` fin de compás.
- Efectos tras la nota: `{h}` hammer, `{sl}` slide, `{b (0 4)}` bend, `{pm}` palm mute.
- Batería: `\instrument percussion` y nombres como `KickHit`, `SnareHit`, `HiHatClosed`, `HiHatOpen`,
  `CrashHighHit`, `RideMiddle`, `HighTomHit`, `MidTomHit`, `LowTomHit`.

La referencia completa está en https://alphatab.net/docs/alphatex/introduction.

## Estructura

```
src/
  components/TabViewer.tsx   visor + reproductor (alphaTab)
  pages/Library.tsx          biblioteca, importar, copias de seguridad
  pages/Editor.tsx           editor alphaTex con vista previa
  pages/Player.tsx           página de una tablatura
  lib/alphatab.ts            helpers: analizar alphaTex, convertir Guitar Pro → alphaTex
  lib/storage.ts             capa de datos (IndexedDB) e interfaz TabStore
  lib/samples.ts             tablaturas de ejemplo y plantillas
  lib/types.ts               modelo de datos
```

## Licencias

alphaTab es MPL-2.0. La fuente Bravura es SIL OFL. El soundfont SONiVOX se distribuye con alphaTab
bajo su propia licencia (ver `public/soundfont/LICENSE` tras el primer build).
