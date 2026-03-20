# CONTENT PIPELINE

This MVP is built so the Keren family can keep expanding the world without rewriting core systems.

## Add a New Guardian

1. Add a new entry to [`/Users/mymacbook/Documents/New project/src/data/guardians.ts`](/Users/mymacbook/Documents/New project/src/data/guardians.ts).
2. Add the guardian's special ability in [`/Users/mymacbook/Documents/New project/src/data/abilities.ts`](/Users/mymacbook/Documents/New project/src/data/abilities.ts) if needed.
3. Extend special handling in [`/Users/mymacbook/Documents/New project/src/scenes/GameScene.ts`](/Users/mymacbook/Documents/New project/src/scenes/GameScene.ts) if the new guardian needs a new ability type.
4. If using custom art instead of procedural placeholders, load the texture in [`/Users/mymacbook/Documents/New project/src/scenes/BootScene.ts`](/Users/mymacbook/Documents/New project/src/scenes/BootScene.ts).

## Replace Placeholder Art With Real Children Drawings

1. Export the drawing as a transparent `.png` or `.webp`.
2. Put the file under [`/Users/mymacbook/Documents/New project/public/art`](/Users/mymacbook/Documents/New project/public/art).
3. Keep the same texture key currently used by scenes and entities. Example:
   - `guardian-tamar-root`
   - `destroyer-pink-destroyer`
4. Recommended filenames for direct replacement:
   - `public/art/green-destroyer.png`
   - `public/art/orange-destroyer.png`
   - `public/art/pink-destroyer.png`
   - `public/art/lion.png`
   - `public/art/title-collage.png`
5. In [`/Users/mymacbook/Documents/New project/src/scenes/BootScene.ts`](/Users/mymacbook/Documents/New project/src/scenes/BootScene.ts), swap the procedural creator for `this.load.image(...)` using the existing key names.
6. Avoid over-cleaning the art. Preserve rough outlines, uneven edges, strange proportions, paper grain, and scan texture.

## Replace the Pink Placeholder Destroyer

1. Keep the data entry id as `pink-destroyer` in [`/Users/mymacbook/Documents/New project/src/data/destroyers.ts`](/Users/mymacbook/Documents/New project/src/data/destroyers.ts).
2. Swap the texture source in [`/Users/mymacbook/Documents/New project/src/scenes/BootScene.ts`](/Users/mymacbook/Documents/New project/src/scenes/BootScene.ts).
3. If Yuval's final drawing suggests different movement or attacks, update the spawn or behavior rules in [`/Users/mymacbook/Documents/New project/src/scenes/GameScene.ts`](/Users/mymacbook/Documents/New project/src/scenes/GameScene.ts) without changing menu or storage systems.

## Add a New Destroyer

1. Add its config to [`/Users/mymacbook/Documents/New project/src/data/destroyers.ts`](/Users/mymacbook/Documents/New project/src/data/destroyers.ts).
2. Add wave entries in [`/Users/mymacbook/Documents/New project/src/data/levels.ts`](/Users/mymacbook/Documents/New project/src/data/levels.ts).
3. If it needs unique behavior, branch on destroyer id in [`/Users/mymacbook/Documents/New project/src/scenes/GameScene.ts`](/Users/mymacbook/Documents/New project/src/scenes/GameScene.ts).

## Add Enemies or Levels

1. Enemies live in [`/Users/mymacbook/Documents/New project/src/data/enemies.ts`](/Users/mymacbook/Documents/New project/src/data/enemies.ts).
2. Level wave scripting lives in [`/Users/mymacbook/Documents/New project/src/data/levels.ts`](/Users/mymacbook/Documents/New project/src/data/levels.ts).
3. The current gameplay scene reads those configs directly, so expanding content is mostly data entry unless new mechanics are required.

## Audio Hook Replacement

1. Keep cue ids stable in [`/Users/mymacbook/Documents/New project/src/data/audio.ts`](/Users/mymacbook/Documents/New project/src/data/audio.ts).
2. Replace placeholder hooks inside [`/Users/mymacbook/Documents/New project/src/systems/AudioSystem.ts`](/Users/mymacbook/Documents/New project/src/systems/AudioSystem.ts) with real loaded audio.
3. Do not rename cues used by scenes unless you update all call sites.
