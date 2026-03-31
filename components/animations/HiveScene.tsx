/**
 * HiveScene — Hoved-animasjonskomponent for BiVokter.
 *
 * Når RIVE_ASSET_READY = false  → viser HivePlaceholder (Skia-tegnet)
 * Når RIVE_ASSET_READY = true   → viser Rive-animasjonen fra assets/bivokter_hive.riv
 *
 * For å aktivere Rive:
 *   1. Legg bivokter_hive.riv i assets/
 *   2. Sett RIVE_ASSET_READY = true nedenfor
 *   3. Bygg ny EAS APK
 */
import { useEffect, useRef } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import {
  HiveSceneState,
  RIVE_ASSET_NAME,
  RIVE_STATE_MACHINE,
  RIVE_SCENE_INPUT,
  SCENE_INDEX,
} from '@/constants/hiveScene';
import { HivePlaceholder } from './HivePlaceholder';

// ─── Flip til true når bivokter_hive.riv er lagt i assets/ ──────────────────
const RIVE_ASSET_READY = false;

// ─── Props ───────────────────────────────────────────────────────────────────

export interface HiveSceneProps {
  scene: HiveSceneState;
  /** Høyde på scene-komponenten (default 220) */
  height?: number;
  /** Border-radius (default 0) */
  borderRadius?: number;
}

// ─── Rive-wrapper (kun aktiv når RIVE_ASSET_READY = true) ───────────────────
// Importeres dynamisk for å unngå kompilerings-feil før .riv-filen er klar

function RiveHiveScene({ scene, height, borderRadius }: Required<HiveSceneProps>) {
  const riveRef = useRef<{ setInputState: (sm: string, name: string, val: number) => void } | null>(null);

  useEffect(() => {
    if (!riveRef.current) return;
    try {
      riveRef.current.setInputState(RIVE_STATE_MACHINE, RIVE_SCENE_INPUT, SCENE_INDEX[scene]);
    } catch {
      // State machine ikke klar ennå
    }
  }, [scene]);

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { default: Rive, Fit, Alignment } = require('rive-react-native');

  return (
    <View style={[styles.riveContainer, { height, borderRadius }]}>
      <Rive
        ref={riveRef}
        resourceName={RIVE_ASSET_NAME}
        stateMachineName={RIVE_STATE_MACHINE}
        fit={Fit.Cover}
        alignment={Alignment.Center}
        autoplay
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

// ─── HiveScene (main export) ─────────────────────────────────────────────────

export function HiveScene({ scene, height = 220, borderRadius = 0 }: HiveSceneProps) {
  const { width: screenWidth } = useWindowDimensions();
  const sceneWidth = Math.min(screenWidth - 32, 400);

  if (RIVE_ASSET_READY) {
    return <RiveHiveScene scene={scene} height={height} borderRadius={borderRadius} />;
  }

  return (
    <View style={[styles.wrapper, { borderRadius, overflow: 'hidden' }]}>
      <HivePlaceholder scene={scene} width={sceneWidth} height={height} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'center',
  },
  riveContainer: {
    overflow: 'hidden',
    alignSelf: 'center',
  },
});
