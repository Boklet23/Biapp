/**
 * HivePlaceholder — Fullstendig animert bikube-scene med Skia + Reanimated.
 *
 * Animasjoner:
 *   - 3 Skia-tegnede bier med slagende vinger og figure-8 flybaner
 *   - Honningdrypp fra rammer (frames-scene)
 *   - Fylt honningkam med shimmer-effekt
 *   - Kamera-zoom-overgang mellom scener (Reanimated Animated.View)
 *
 * Bytter ut seg selv med ekte Rive-animasjon når RIVE_ASSET_READY = true i HiveScene.tsx
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
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
}: { width: number; height: number; color: string; t: number }) {
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

  // Shimmer: subtil puls mellom 0.25–0.4
  const shimmer = 0.3 + Math.sin(t * Math.PI * 2) * 0.1;

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
  const cx = w / 2;
  const baseY = h - 28;
  const bW = 110; const bH = 72;

  const body1 = Skia.Path.Make();
  body1.addRect(Skia.XYWHRect(cx - bW / 2, baseY - bH, bW, bH / 2 - 2));
  const body2 = Skia.Path.Make();
  body2.addRect(Skia.XYWHRect(cx - bW / 2, baseY - bH / 2 + 2, bW, bH / 2 - 2));
  const roof = Skia.Path.Make();
  roof.moveTo(cx - bW / 2 - 10, baseY - bH);
  roof.lineTo(cx, baseY - bH - 20);
  roof.lineTo(cx + bW / 2 + 10, baseY - bH);
  roof.close();
  const landing = Skia.Path.Make();
  landing.addRect(Skia.XYWHRect(cx - bW / 2 - 6, baseY - 6, bW + 12, 8));

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
  const frameW = 30; const frameH = h * 0.56;
  const totalW = frameCount * (frameW + 8);
  const startX = (w - totalW) / 2;
  const startY = (h - frameH) / 2;

  return (
    <Group>
      {Array.from({ length: frameCount }).map((_, i) => {
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
        return (
          <Group key={i}>
            <Path path={frame} color="#8B5E2A" />
            <Path path={cells} color="#F5C842" opacity={0.75} />
            <Path path={frame} color="#3D1A00" style="stroke" strokeWidth={2} />
          </Group>
        );
      })}
    </Group>
  );
}

// ─── Animert bie ─────────────────────────────────────────────────────────────
// Tegnet som kropp + hode + vinger. Posisjon og vinger animeres fra t+phase.

interface BeeProps {
  t: number;
  phase: number;     // 0–1 fase-offset
  baseX: number;
  baseY: number;
  rangeX: number;   // flybane-bredde
  rangeY: number;   // flybane-høyde
}

function SkiaBee({ t, phase, baseX, baseY, rangeX, rangeY }: BeeProps) {
  const p = (t + phase) % 1;

  // Lissajous figure-8 flybane
  const bx = baseX + Math.sin(p * Math.PI * 2) * rangeX;
  const by = baseY + Math.sin(p * Math.PI * 4) * rangeY;

  // Vingeflapp: 12 Hz relativ til animasjonssyklus
  const wing = Math.sin(p * Math.PI * 2 * 48) * 0.5; // rask oscillasjon

  // Banking: liten rotasjon i flyretning
  const bank = Math.sin(p * Math.PI * 2) * 0.25;

  // Pre-bygg stier
  // Kropp (thorax + abdomen som to overlappende cirkler)
  const thorax = Skia.Path.Make();
  thorax.addCircle(0, 0, 4.5);
  const abdomen = Skia.Path.Make();
  abdomen.addCircle(5, 0.5, 5);
  // Hode
  const head = Skia.Path.Make();
  head.addCircle(-5, 0, 3.5);
  // Stripe 1 + 2 på abdomen
  const stripe1 = Skia.Path.Make();
  stripe1.addRect(Skia.XYWHRect(3.5, -2.5, 2, 6));
  const stripe2 = Skia.Path.Make();
  stripe2.addRect(Skia.XYWHRect(6.5, -2.5, 2, 5.5));
  // Venstre vinge
  const lWing = Skia.Path.Make();
  lWing.addOval(Skia.XYWHRect(-6, -12, 13, 7));
  // Høyre vinge
  const rWing = Skia.Path.Make();
  rWing.addOval(Skia.XYWHRect(-6, 5, 13, 7));

  return (
    <Group transform={[{ translateX: bx }, { translateY: by }, { rotate: bank }]}>
      {/* Venstre vinge (øverst) */}
      <Group transform={[{ translateX: 0 }, { rotate: -wing }]}>
        <Path path={lWing} color="rgba(220,240,255,0.5)" />
      </Group>
      {/* Høyre vinge (nederst) */}
      <Group transform={[{ translateX: 0 }, { rotate: wing }]}>
        <Path path={rWing} color="rgba(220,240,255,0.5)" />
      </Group>
      {/* Kropp */}
      <Path path={abdomen} color="#E8A020" />
      <Path path={stripe1} color="#1A1A00" opacity={0.7} />
      <Path path={stripe2} color="#1A1A00" opacity={0.7} />
      <Path path={thorax} color="#D09010" />
      {/* Hode */}
      <Path path={head} color="#C07808" />
    </Group>
  );
}

// ─── Honningdrypp ─────────────────────────────────────────────────────────────

function HoneyDrip({ t, cx, cy, phaseOffset }: { t: number; cx: number; cy: number; phaseOffset: number }) {
  // 2.5s syklus per drypp (t er 4s, så 2.5s ≈ 1.6 rotasjoner av t)
  const d = ((t * 1.6) + phaseOffset) % 1;

  // Drypp-forlengelse: vokser fra 0 → 18px mellom d=0.3..0.65
  const dripLen = d < 0.3 ? 0 : d < 0.65 ? ((d - 0.3) / 0.35) * 18 : 18;

  // Dråpe faller: d=0.65..0.85 → translateY 0→36, opacity 1→0
  const fallProgress = d < 0.65 ? 0 : d > 0.85 ? 1 : (d - 0.65) / 0.2;
  const dropY = fallProgress * 36;
  const dropOpacity = d >= 0.65 && d <= 0.85 ? 1 - fallProgress : 0;

  if (dripLen === 0 && dropOpacity === 0) return null;

  const stem = Skia.Path.Make();
  if (dripLen > 0) {
    stem.moveTo(cx, cy);
    stem.cubicTo(cx - 2, cy + dripLen * 0.4, cx + 2, cy + dripLen * 0.7, cx, cy + dripLen);
  }

  return (
    <Group>
      {dripLen > 0 && (
        <Path path={stem} color="#D4890A" style="stroke" strokeWidth={2.5} strokeCap="round" />
      )}
      {dropOpacity > 0 && (
        <Circle cx={cx} cy={cy + 18 + dropY} r={4} color="#F5C842" opacity={dropOpacity} />
      )}
    </Group>
  );
}

// ─── HivePlaceholder ─────────────────────────────────────────────────────────

interface HivePlaceholderProps {
  scene: HiveSceneState;
  width: number;
  height: number;
}

// Bee-definisjoner: baseX/Y er relative (0–1 av w/h)
const BEE_DEFS = [
  { phase: 0.00, bxR: 0.35, byR: 0.38, rxR: 0.14, ryR: 0.10 },
  { phase: 0.33, bxR: 0.62, byR: 0.28, rxR: 0.12, ryR: 0.08 },
  { phase: 0.67, bxR: 0.50, byR: 0.55, rxR: 0.10, ryR: 0.07 },
];

export function HivePlaceholder({ scene, width, height }: HivePlaceholderProps) {
  const palette = SCENE_PALETTE[scene];

  // ── RAF-animasjon (0→1 loop, 4s syklus) ────────────────────────────────────
  const [t, setT] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      setT(((ts - startRef.current) / 4000) % 1);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, []);

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
              {[0.18, 0.50, 0.82].map((fx, i) => {
                const bigCell = Skia.Path.Make();
                bigCell.addCircle(width * fx, height * 0.5, 38);
                return <Path key={i} path={bigCell} color="#F5C842" opacity={0.55} />;
              })}
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
