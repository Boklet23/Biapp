/**
 * BiVokter — HiveScene state machine constants.
 *
 * These values map directly to the Rive state machine inputs the designer
 * must implement. When the .riv file is delivered, set RIVE_ASSET_READY = true
 * in components/animations/HiveScene.tsx and drop bivokter_hive.riv into assets/.
 */

export type HiveSceneState =
  | 'exterior'   // Outside view — default on home screen
  | 'interior'   // Camera panning into hive — inspection step 1 & 2
  | 'frames'     // Frames view with honey dripping — inspection step 3
  | 'bees';      // Close-up of bees on comb — inspection step 4 / bee health

/** Human-readable label shown in placeholder and for debugging */
export const SCENE_LABELS: Record<HiveSceneState, string> = {
  exterior: 'Utsiden av kuben',
  interior: 'Innsiden av kuben',
  frames:   'Rammer med honning',
  bees:     'Nærbilde av biene',
};

/** Rive asset filename (without .riv extension) — place file in assets/ */
export const RIVE_ASSET_NAME = 'bivokter_hive';

/** Rive state machine name — must match what designer names it */
export const RIVE_STATE_MACHINE = 'HiveNavigation';

/** Rive input name for scene selection — designer must create a Number input */
export const RIVE_SCENE_INPUT = 'sceneIndex';

/** Maps HiveSceneState → numeric index for Rive Number input */
export const SCENE_INDEX: Record<HiveSceneState, number> = {
  exterior: 0,
  interior: 1,
  frames:   2,
  bees:     3,
};

/** Which scene maps to each inspection wizard step (1-indexed) */
export const INSPECTION_STEP_SCENE: Record<number, HiveSceneState> = {
  1: 'exterior',
  2: 'interior',
  3: 'frames',
  4: 'bees',
};
