/**
 * HivePlaceholder — Fullstendig animert bikube-scene med Skia + Reanimated.
 *
 * Animasjoner drives av en Reanimated SharedValue (t: 0→1, 4s loop via
 * withRepeat/withTiming). Alle canvas-oppdateringer kjører på UI-tråden —
 * null React re-renders, null JS-tråd-belastning under animasjon.
 *
 * Bytter ut seg selv med ekte Rive-animasjon når RIVE_ASSET_READY = true i HiveScene.tsx
 */
import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import {
  Canvas,
  Circle,
  Fill,
  Group,
  LinearGradient,
  Path,
  Rect,
  Skia,
  vec,
} from '@shopify/react-native-skia';
import { HiveSceneState, SCENE_LABELS } from '@/constants/hiveScene';

// ─── Fargepalett per scene ───────────────────────────────────────────────────

const SCENE_PALETTE: Record<HiveSceneState, { top: string; bottom: string; hex: string }> = {
  exterior: { top: '#87CEEB', bottom: '#D4A843', hex: '#C4902A' },
  interior: { top: '#5C3A1E', bottom: '#2B1A0D', hex: '#8B5E2A' },
  frames:   { top: '#C4831A', bottom: '#F5C842', hex: '#A0660E' },
  bees:     { top: '#F5C842', bottom: '#E88C1A', hex: '#C4831A' },
};

// Scene zoom: ytre Animated.View skaleres + translateY
const SCENE_ZOOM: Record<HiveSceneState, { scale: number; translateY: number }> = {
  exterior: { scale: 1.0,  translateY: 0  },
  interior: { scale: 1.35, translateY: -22 },
  frames:   { scale: 1.6,  translateY: -38 },
  bees:     { scale: 1.95, translateY: -58 },
};

// ─── Hexagon-hjelper ─────────────────────────────────────────────────────────

function makeHexPath(cx: number, cy: number, r: number) {
  const p = Skia.Path.Make();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    if (i === 0) p.moveTo(x, y); else p.lineTo(x, y);
  }
  p.close();
  return p;
}

// ─── Honningkamre med shimmer ────────────────────────────────────────────────

function HoneycombFilled({
  width, height, color, t,
}: { width: number; height: number; color: string; t: SharedValue<number> }) {
  const { filled, stroked } = useMemo(() => {
    const r = 18;
    const rowH = r * Math.sqrt(3);
    const colW = r * 1.5;
    const cols = Math.ceil(width / (colW * 2)) + 2;
    const rows = Math.ceil(height / rowH) + 2;
    const f: ReturnType<typeof makeHexPath>[] = [];
    const s: ReturnType<typeof makeHexPath>[] = [];
    let idx = 0;
    for (let row = -1; row < rows; row++) {
      for (let col = -1; col < cols; col++) {
        const cx = col * colW * 2 + (row % 2 === 0 ? 0 : colW);
        const cy = row * rowH;
        (idx % 2 === 0 ? f : s).push(makeHexPath(cx, cy, r - 2));
        idx++;
      }
    }
    return { filled: f, stroked: s };
  }, [width, height]);

  // Shimmer kjøres på UI-tråden via worklet
  const shimmer = useDerivedValue(() => 0.3 + Math.sin(t.value * Math.PI * 2) * 0.1);

  return (
    <Group>
      {stroked.map((p, i) => (
        <Path key={`s${i}`} path={p} color={color} style="stroke" strokeWidth={1.5} opacity={0.22} />
      ))}
      {filled.map((p, i) => (
        <Path key={`f${i}`} path={p} color="#F5C842" opacity={shimmer} />
      ))}
    </Group>
  );
}

// ─── Bikube-silhuett (utsiden) ───────────────────────────────────────────────

function HiveBoxSkia({ w, h }: { w: number; h: number }) {
  const { body1, body2, roof, landing } = useMemo(() => {
    const cx = w / 2;
    const baseY = h - 28;
    const bW = 110;
    const bH = 72;
    const b1 = Skia.Path.Make();
    b1.addRect(Skia.XYWHRect(cx - bW / 2, baseY - bH, bW, bH / 2 - 2));
    const b2 = Skia.Path.Make();
    b2.addRect(Skia.XYWHRect(cx - bW / 2, baseY - bH / 2 + 2, bW, bH / 2 - 2));
    const rf = Skia.Path.Make();
    rf.moveTo(cx - bW / 2 - 10, baseY - bH);
    rf.lineTo(cx, baseY - bH - 20);
    rf.lineTo(cx + bW / 2 + 10, baseY - bH);
    rf.close();
    const lnd = Skia.Path.Make();
    lnd.addRect(Skia.XYWHRect(cx - bW / 2 - 6, baseY - 6, bW + 12, 8));
    return { body1: b1, body2: b2, roof: rf, landing: lnd };
  }, [w, h]);

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

// ─── Rammer med honningkamre ─────────────────────────────────────────────────

function FramesSkia({ w, h }: { w: number; h: number }) {
  const frameCount = 5;
  const frameW = 30;
  const frameH = h * 0.56;
  const totalW = frameCount * (frameW + 8);
  const startX = (w - totalW) / 2;
  const startY = (h - frameH) / 2;

  const frames = useMemo(() => {
    return Array.from({ length: frameCount }).map((_, i) => {
      const x = startX + i * (frameW + 8);
      const frame = Skia.Path.Make();
      frame.addRect(Skia.XYWHRect(x, startY, frameW, frameH));
      const cells = Skia.Path.Make();
      const cellR = 6;
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 2; col++) {
          const cx2 = x + 8 + col * 14 + (row % 2 === 0 ? 0 : 7);
          const cy2 = startY + 10 + row * 16;
          for (let k = 0; k < 6; k++) {
            const a = (Math.PI / 3) * k - Math.PI / 6;
            const hx = cx2 + cellR * Math.cos(a);
            const hy = cy2 + cellR * Math.sin(a);
            if (k === 0) cells.moveTo(hx, hy); else cells.lineTo(hx, hy);
          }
          cells.close();
        }
      }
      return { frame, cells };
    });
  }, [startX, startY, frameW, frameH]);

  return (
    <Group>
      {frames.map(({ frame, cells }, i) => (
        <Group key={i}>
          <Path path={frame} color="#8B5E2A" />
          <Path path={cells} color="#F5C842" opacity={0.75} />
          <Path path={frame} color="#3D1A00" style="stroke" strokeWidth={2} />
        </Group>
      ))}
    </Group>
  );
}

// ─── Animert bie ─────────────────────────────────────────────────────────────

interface BeeProps {
  t: SharedValue<number>;
  phase: number;
  baseX: number;
  baseY: number;
  rangeX: number;
  rangeY: number;
}

function SkiaBee({ t, phase, baseX, baseY, rangeX, rangeY }: BeeProps) {
  // Statiske stier — memoized, opprettes kun én gang
  const { thorax, abdomen, head, stripe1, stripe2, lWing, rWing } = useMemo(() => {
    const th = Skia.Path.Make();
    th.addCircle(0, 0, 4.5);
    const ab = Skia.Path.Make();
    ab.addCircle(5, 0.5, 5);
    const hd = Skia.Path.Make();
    hd.addCircle(-5, 0, 3.5);
    const s1 = Skia.Path.Make();
    s1.addRect(Skia.XYWHRect(3.5, -2.5, 2, 6));
    const s2 = Skia.Path.Make();
    s2.addRect(Skia.XYWHRect(6.5, -2.5, 2, 5.5));
    const lw = Skia.Path.Make();
    lw.addOval(Skia.XYWHRect(-6, -12, 13, 7));
    const rw = Skia.Path.Make();
    rw.addOval(Skia.XYWHRect(-6, 5, 13, 7));
    return { thorax: th, abdomen: ab, head: hd, stripe1: s1, stripe2: s2, lWing: lw, rWing: rw };
  }, []);

  // Kropp-transform: Lissajous figure-8 + banking — UI-tråd via worklet
  const beeTransform = useDerivedValue(() => {
    const p = (t.value + phase) % 1;
    const bx = baseX + Math.sin(p * Math.PI * 2) * rangeX;
    const by = baseY + Math.sin(p * Math.PI * 4) * rangeY;
    const bank = Math.sin(p * Math.PI * 2) * 0.25;
    return [{ translateX: bx }, { translateY: by }, { rotate: bank }];
  });

  // Vinge-transformasjoner (rask oscillasjon ~12 Hz)
  const leftWingT = useDerivedValue(() => {
    const p = (t.value + phase) % 1;
    const wing = Math.sin(p * Math.PI * 2 * 48) * 0.5;
    return [{ rotate: -wing }];
  });

  const rightWingT = useDerivedValue(() => {
    const p = (t.value + phase) % 1;
    const wing = Math.sin(p * Math.PI * 2 * 48) * 0.5;
    return [{ rotate: wing }];
  });

  return (
    <Group transform={beeTransform}>
      <Group transform={leftWingT}>
        <Path path={lWing} color="rgba(220,240,255,0.5)" />
      </Group>
      <Group transform={rightWingT}>
        <Path path={rWing} color="rgba(220,240,255,0.5)" />
      </Group>
      <Path path={abdomen} color="#E8A020" />
      <Path path={stripe1} color="#1A1A00" opacity={0.7} />
      <Path path={stripe2} color="#1A1A00" opacity={0.7} />
      <Path path={thorax} color="#D09010" />
      <Path path={head} color="#C07808" />
    </Group>
  );
}

// ─── Honningdrypp ─────────────────────────────────────────────────────────────

function HoneyDrip({
  t, cx, cy, phaseOffset,
}: { t: SharedValue<number>; cx: number; cy: number; phaseOffset: number }) {
  // Fast stam-sti (full lengde) — opprettes kun én gang
  const stemPath = useMemo(() => {
    const p = Skia.Path.Make();
    p.moveTo(cx, cy);
    p.cubicTo(cx - 2, cy + 7, cx + 2, cy + 14, cx, cy + 18);
    return p;
  }, [cx, cy]);

  // Stam fades inn mens dryppet vokser, deretter ut
  const stemOpacity = useDerivedValue(() => {
    const d = ((t.value * 1.6) + phaseOffset) % 1;
    if (d < 0.3) return 0;
    if (d < 0.65) return (d - 0.3) / 0.35;
    if (d < 0.85) return 1;
    return 0;
  });

  // Dråpen faller fra cy+18 → cy+54 mens den fader ut
  const dropCy = useDerivedValue(() => {
    const d = ((t.value * 1.6) + phaseOffset) % 1;
    if (d < 0.65 || d > 0.85) return cy + 18;
    return cy + 18 + ((d - 0.65) / 0.2) * 36;
  });

  const dropOpacity = useDerivedValue(() => {
    const d = ((t.value * 1.6) + phaseOffset) % 1;
    if (d < 0.65 || d > 0.85) return 0;
    return 1 - (d - 0.65) / 0.2;
  });

  return (
    <Group>
      <Path path={stemPath} color="#D4890A" style="stroke" strokeWidth={2.5} strokeCap="round" opacity={stemOpacity} />
      <Circle cx={cx} cy={dropCy} r={4} color="#F5C842" opacity={dropOpacity} />
    </Group>
  );
}

// ─── HivePlaceholder ─────────────────────────────────────────────────────────

interface HivePlaceholderProps {
  scene: HiveSceneState;
  width: number;
  height: number;
}

const BEE_DEFS = [
  { phase: 0.00, bxR: 0.35, byR: 0.38, rxR: 0.14, ryR: 0.10 },
  { phase: 0.33, bxR: 0.62, byR: 0.28, rxR: 0.12, ryR: 0.08 },
  { phase: 0.67, bxR: 0.50, byR: 0.55, rxR: 0.10, ryR: 0.07 },
];

export function HivePlaceholder({ scene, width, height }: HivePlaceholderProps) {
  const palette = SCENE_PALETTE[scene];

  // ── Reanimated timing loop (UI-tråd, ingen React re-renders) ───────────────
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.linear }),
      -1,
      false,
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Scene-zoom (Reanimated Animated.View) ───────────────────────────────────
  const scaleVal = useSharedValue(1);
  const tyVal = useSharedValue(0);

  useEffect(() => {
    const target = SCENE_ZOOM[scene];
    scaleVal.value = withTiming(target.scale, { duration: 800, easing: Easing.inOut(Easing.cubic) });
    tyVal.value = withTiming(target.translateY, { duration: 800, easing: Easing.inOut(Easing.cubic) });
  }, [scene, scaleVal, tyVal]);

  const zoomStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleVal.value }, { translateY: tyVal.value }],
  }));

  // Memoized store celler (bees-scene)
  const bigCellPaths = useMemo(() =>
    [0.18, 0.50, 0.82].map((fx) => {
      const p = Skia.Path.Make();
      p.addCircle(width * fx, height * 0.5, 38);
      return p;
    }), [width, height]);

  return (
    <View style={[styles.container, { width, height }]}>
      <Animated.View style={[StyleSheet.absoluteFill, zoomStyle]}>
        <Canvas style={StyleSheet.absoluteFill}>

          {/* Gradient-bakgrunn */}
          <Fill>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(0, height)}
              colors={[palette.top, palette.bottom]}
            />
          </Fill>

          {/* Fylt honningkam med shimmer */}
          <HoneycombFilled width={width} height={height} color={palette.hex} t={t} />

          {/* Scene-innhold */}
          {scene === 'exterior' && (
            <>
              <HiveBoxSkia w={width} h={height} />
              <Rect x={0} y={height - 26} width={width} height={26} color="#4A7C40" />
            </>
          )}
          {(scene === 'frames' || scene === 'interior') && (
            <FramesSkia w={width} h={height} />
          )}
          {scene === 'bees' && (
            <Group>
              {bigCellPaths.map((p, i) => (
                <Path key={i} path={p} color="#F5C842" opacity={0.55} />
              ))}
            </Group>
          )}

          {/* Honningdrypp (kun frames-scene) */}
          {scene === 'frames' && (
            <>
              <HoneyDrip t={t} cx={width * 0.36} cy={height * 0.42} phaseOffset={0} />
              <HoneyDrip t={t} cx={width * 0.58} cy={height * 0.46} phaseOffset={0.5} />
            </>
          )}

          {/* Animerte bier — alle scener */}
          {BEE_DEFS.map((b, i) => (
            <SkiaBee
              key={i}
              t={t}
              phase={b.phase}
              baseX={width * b.bxR}
              baseY={height * b.byR}
              rangeX={width * b.rxR}
              rangeY={height * b.ryR}
            />
          ))}

        </Canvas>
      </Animated.View>

      {/* Scene-etikett */}
      <View style={styles.labelWrap} pointerEvents="none">
        <Text style={styles.label}>{SCENE_LABELS[scene]}</Text>
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
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: '#00000070',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
