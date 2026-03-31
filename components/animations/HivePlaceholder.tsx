/**
 * HivePlaceholder — Vises til Rive-filen er klar.
 * Bruker @shopify/react-native-skia for å tegne en bikube-scene.
 * Skifter visuell stil basert på HiveSceneState.
 */
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  Canvas,
  Fill,
  Group,
  Path,
  Skia,
  LinearGradient,
  vec,
  Circle,
  Rect,
} from '@shopify/react-native-skia';
import { Colors } from '@/constants/colors';
import { HiveSceneState, SCENE_LABELS } from '@/constants/hiveScene';
import { BeeParticles } from '@/components/animations/BeeParticles';

// ─── Fargepalett per scene ───────────────────────────────────────────────────

const SCENE_PALETTE: Record<HiveSceneState, { top: string; bottom: string; hex: string }> = {
  exterior: { top: '#87CEEB', bottom: '#D4A843',  hex: '#C4902A' },
  interior: { top: '#5C3A1E', bottom: '#2B1A0D',  hex: '#8B5E2A' },
  frames:   { top: '#C4831A', bottom: '#F5C842',  hex: '#A0660E' },
  bees:     { top: '#F5C842', bottom: '#E88C1A',  hex: '#C4831A' },
};

// ─── Hexagon-hjelper ─────────────────────────────────────────────────────────

function makeHexPath(cx: number, cy: number, r: number): ReturnType<typeof Skia.Path.Make> {
  const path = Skia.Path.Make();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  }
  path.close();
  return path;
}

// ─── Honningkamre-bakgrunn ───────────────────────────────────────────────────

function HoneycombLayer({ width, height, color }: { width: number; height: number; color: string }) {
  const paths = useMemo(() => {
    const result: ReturnType<typeof Skia.Path.Make>[] = [];
    const r = 18;
    const rowH = r * Math.sqrt(3);
    const colW = r * 1.5;
    const cols = Math.ceil(width / colW) + 2;
    const rows = Math.ceil(height / rowH) + 2;
    for (let row = -1; row < rows; row++) {
      for (let col = -1; col < cols; col++) {
        const cx = col * colW * 2 + (row % 2 === 0 ? 0 : colW);
        const cy = row * rowH;
        result.push(makeHexPath(cx, cy, r - 2));
      }
    }
    return result;
  }, [width, height]);

  return (
    <Group opacity={0.25}>
      {paths.map((p, i) => (
        <Path key={i} path={p} color={color} style="stroke" strokeWidth={1.5} />
      ))}
    </Group>
  );
}

// ─── Bikube-silhuett (utsiden) ───────────────────────────────────────────────

function HiveBoxSkia({ w, h }: { w: number; h: number }) {
  const cx = w / 2;
  const baseY = h - 32;
  const boxW = 100;
  const boxH = 70;

  // Enkle rektangler som representerer kubebokser
  const body1 = Skia.Path.Make();
  body1.addRect(Skia.XYWHRect(cx - boxW / 2, baseY - boxH, boxW, boxH / 2 - 2));

  const body2 = Skia.Path.Make();
  body2.addRect(Skia.XYWHRect(cx - boxW / 2, baseY - boxH / 2 + 2, boxW, boxH / 2 - 2));

  const roof = Skia.Path.Make();
  roof.moveTo(cx - boxW / 2 - 8, baseY - boxH);
  roof.lineTo(cx, baseY - boxH - 18);
  roof.lineTo(cx + boxW / 2 + 8, baseY - boxH);
  roof.close();

  const landing = Skia.Path.Make();
  landing.addRect(Skia.XYWHRect(cx - boxW / 2 - 6, baseY - 6, boxW + 12, 8));

  return (
    <Group>
      <Path path={body1} color="#8B5E2A" />
      <Path path={body1} color="#3D1A00" style="stroke" strokeWidth={1.5} />
      <Path path={body2} color="#A0742A" />
      <Path path={body2} color="#3D1A00" style="stroke" strokeWidth={1.5} />
      <Path path={roof} color="#5C3A1E" />
      <Path path={landing} color="#6B4423" />
    </Group>
  );
}

// ─── Ramme-visning (innside/frames) ──────────────────────────────────────────

function FramesSkia({ w, h }: { w: number; h: number }) {
  const frameCount = 5;
  const frameW = 28;
  const frameH = h * 0.55;
  const totalW = frameCount * (frameW + 8);
  const startX = (w - totalW) / 2;
  const startY = (h - frameH) / 2;

  return (
    <Group>
      {Array.from({ length: frameCount }).map((_, i) => {
        const x = startX + i * (frameW + 8);
        const frame = Skia.Path.Make();
        frame.addRect(Skia.XYWHRect(x, startY, frameW, frameH));

        // Honningceller på rammen
        const cells = Skia.Path.Make();
        const cellR = 6;
        for (let row = 0; row < 4; row++) {
          for (let col = 0; col < 2; col++) {
            const cx2 = x + 7 + col * 14 + (row % 2 === 0 ? 0 : 7);
            const cy2 = startY + 10 + row * 16;
            for (let k = 0; k < 6; k++) {
              const angle = (Math.PI / 3) * k - Math.PI / 6;
              const hx = cx2 + cellR * Math.cos(angle);
              const hy = cy2 + cellR * Math.sin(angle);
              if (k === 0) cells.moveTo(hx, hy);
              else cells.lineTo(hx, hy);
            }
            cells.close();
          }
        }

        return (
          <Group key={i}>
            <Path path={frame} color="#8B5E2A" />
            <Path path={cells} color="#F5C842" opacity={0.7} />
            <Path path={frame} color="#3D1A00" style="stroke" strokeWidth={2} />
          </Group>
        );
      })}
    </Group>
  );
}

// ─── HivePlaceholder ─────────────────────────────────────────────────────────

interface HivePlaceholderProps {
  scene: HiveSceneState;
  width: number;
  height: number;
}

export function HivePlaceholder({ scene, width, height }: HivePlaceholderProps) {
  const palette = SCENE_PALETTE[scene];

  return (
    <View style={[styles.container, { width, height }]}>
      <Canvas style={StyleSheet.absoluteFill}>
        {/* Gradient-bakgrunn */}
        <Fill>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, height)}
            colors={[palette.top, palette.bottom]}
          />
        </Fill>

        {/* Honningkamre-bakgrunn */}
        <HoneycombLayer width={width} height={height} color={palette.hex} />

        {/* Scene-spesifikt element */}
        {(scene === 'exterior') && <HiveBoxSkia w={width} h={height} />}
        {(scene === 'frames' || scene === 'interior') && <FramesSkia w={width} h={height} />}
        {scene === 'bees' && (
          <Group>
            {/* Noen store honningceller i nærbilde */}
            {[0.2, 0.5, 0.8].map((fx, i) => (
              <Circle key={i} cx={width * fx} cy={height * 0.5} r={36} color="#F5C842" opacity={0.6} />
            ))}
          </Group>
        )}

        {/* Gress-stripe nederst (utsiden) */}
        {scene === 'exterior' && (
          <Rect x={0} y={height - 24} width={width} height={24} color="#4A7C40" />
        )}
      </Canvas>

      {/* Bie-partikler overlay */}
      <BeeParticles height={height} />

      {/* Scene-etikett */}
      <View style={styles.labelWrap} pointerEvents="none">
        <Text style={styles.label}>{SCENE_LABELS[scene]}</Text>
        <Text style={styles.sublabel}>🎨 Animasjon kommer snart</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', position: 'relative' },
  labelWrap: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: '#00000060',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  sublabel: {
    fontSize: 10,
    color: '#FFFFFF90',
  },
});
