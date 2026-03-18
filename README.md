# FOREST OF FRAGMENTS

A playable mobile-first Phaser 3 MVP built with TypeScript and Vite.

## Run

```bash
npm install
npm run dev
```

Open the Vite URL in a browser. Portrait orientation is primary, but desktop works as well.

## MVP Features

- Title, profile select, guardian select, gameplay, score, leaderboard, and settings scenes
- Local profile storage with seeded family profiles: Lavi, Yuval, Niv
- Local leaderboard tracking score, guardian, defeats, and run duration
- One playable forest level with corrupted enemies, Green/Orange/Pink destroyer encounters, and a scripted Lion appearance
- Three playable guardians with different stats and specials
- Touch controls plus keyboard support
- Data-driven content configuration under [`/Users/mymacbook/Documents/New project/src/data`](\/Users\/mymacbook\/Documents\/New project\/src\/data)
- Manifest for PWA-ready installation groundwork

## Controls

- Mobile: on-screen `L`, `R`, `Jump`, `Hit`, `Gift`
- Keyboard: `A/D` move, `W` jump, `Space` attack, `Shift` special

## Tech

- TypeScript
- Phaser 3
- Vite

## Structure

- [`/Users/mymacbook/Documents/New project/src/game`](/Users/mymacbook/Documents/New project/src/game)
- [`/Users/mymacbook/Documents/New project/src/scenes`](/Users/mymacbook/Documents/New project/src/scenes)
- [`/Users/mymacbook/Documents/New project/src/entities`](/Users/mymacbook/Documents/New project/src/entities)
- [`/Users/mymacbook/Documents/New project/src/systems`](/Users/mymacbook/Documents/New project/src/systems)
- [`/Users/mymacbook/Documents/New project/src/data`](/Users/mymacbook/Documents/New project/src/data)
- [`/Users/mymacbook/Documents/New project/src/ui`](/Users/mymacbook/Documents/New project/src/ui)
- [`/Users/mymacbook/Documents/New project/src/audio`](/Users/mymacbook/Documents/New project/src/audio)
- [`/Users/mymacbook/Documents/New project/src/assets`](/Users/mymacbook/Documents/New project/src/assets)
- [`/Users/mymacbook/Documents/New project/public`](/Users/mymacbook/Documents/New project/public)
- [`/Users/mymacbook/Documents/New project/docs`](/Users/mymacbook/Documents/New project/docs)

## Notes

- Art is currently procedural placeholder art shaped to preserve the rough hand-drawn DNA.
- Pink Destroyer is intentionally a replaceable placeholder for Yuval’s later drawing.
- Purple Destroyer is reserved in data and architecture for future implementation.
