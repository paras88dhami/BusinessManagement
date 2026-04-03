import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, StatusBar, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from "react-native-svg";
import { colors } from "@/shared/components/theme/colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const BG = "#1A3D2B";
const WORDMARK_TEXT = "e-Lekha";
const TAGLINE_TEXT = "Smart business. Clear accounts.";

const TOTAL_MS = 3200;
const T_TRAIL_END = 0.56;
const T_LOGO_START = 0.5;
const T_LOGO_END = 0.68;
const T_WM_START = 0.66;
const T_WM_END = 0.82;
const T_TAG_START = 0.8;
const T_TAG_END = 0.92;
const T_FADE_OUT_START = 0.93;
const TRAIL_WINDOW = 40;

const DOT_GLOW_RADIUS = 11;
const DOT_CORE_RADIUS = 3.2;

const LOGO_RING_RADIUS = 54;
const LOGO_DIAMETER = (LOGO_RING_RADIUS + 6) * 2;
const LOGO_FILL = colors.accent;
const LOGO_TEXT = colors.primary;

const EX = -22;
const EY = 0;
const ER = 18;
const LX = 14;
const LY = 0;
const LH = 36;
const LFW = 22;

type AnimatedSplashScreenProps = {
  onFinish: () => void;
};

type Point = {
  x: number;
  y: number;
};

type TrailSegment = {
  d: string;
  frac: number;
};

type Geometry = {
  cx: number;
  cy: number;
  ePts: Point[];
  lPts: Point[];
  eTravelPts: Point[];
  lTravelPts: Point[];
  eAll: Point[];
  lAll: Point[];
};

const clamp01 = (value: number): number => Math.min(Math.max(value, 0), 1);

const easeInOut = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3);

const easeOutQ = (t: number): number => 1 - (1 - t) * (1 - t);

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const sampleLine = (p0: Point, p1: Point, sampleCount: number): Point[] => {
  const points: Point[] = [];
  const safeCount = Math.max(2, sampleCount);

  for (let index = 0; index <= safeCount; index += 1) {
    const t = index / safeCount;
    points.push({
      x: lerp(p0.x, p1.x, t),
      y: lerp(p0.y, p1.y, t),
    });
  }

  return points;
};

const buildTrailSegments = (
  points: Point[],
  fromIndex: number,
  toIndex: number,
): TrailSegment[] => {
  const segmentCount = toIndex - fromIndex;
  if (segmentCount < 2) {
    return [];
  }

  const segments: TrailSegment[] = [];

  for (let index = 1; index <= segmentCount; index += 1) {
    const p0 = points[fromIndex + index - 1];
    const p1 = points[fromIndex + index];
    if (!p0 || !p1) {
      continue;
    }

    segments.push({
      d: `M${p0.x.toFixed(2)} ${p0.y.toFixed(2)} L${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
      frac: index / segmentCount,
    });
  }

  return segments;
};

const buildGeometry = (width: number, height: number): Geometry => {
  const cx = width / 2;
  const cy = height / 2 - 82;

  const ex = cx + EX;
  const ey = cy + EY;

  const ePts: Point[] = [];
  const arcSteps = 80;
  const startAngle = 0.32;
  const endAngle = startAngle + 2 * Math.PI * 0.92;

  for (let index = 0; index <= arcSteps; index += 1) {
    const angle = startAngle + (endAngle - startAngle) * (index / arcSteps);
    ePts.push({
      x: ex + ER * Math.cos(angle),
      y: ey - ER * Math.sin(angle),
    });
  }

  const barSteps = 24;
  for (let index = 0; index <= barSteps; index += 1) {
    const t = index / barSteps;
    ePts.push({
      x: ex - ER + 2 * ER * t,
      y: ey,
    });
  }

  const lx = cx + LX;
  const ly = cy + LY;
  const lTop = { x: lx, y: ly - LH / 2 };
  const lBottom = { x: lx, y: ly + LH / 2 };
  const lFoot = { x: lx + LFW, y: ly + LH / 2 };
  const lPts = [...sampleLine(lTop, lBottom, 40), ...sampleLine(lBottom, lFoot, 24)];

  const lStart = lPts[0];
  const eStart = ePts[0];

  const eTravelPts: Point[] = [];
  const snakeStepsA = 90;
  for (let index = 0; index <= snakeStepsA; index += 1) {
    const t = index / snakeStepsA;
    const et = easeOut(t);
    const wave = Math.sin(t * Math.PI * 2.2) * height * 0.08 * (1 - Math.pow(t, 2));
    eTravelPts.push({
      x: lerp(-20, lStart.x, et),
      y: lerp(cy - height * 0.05, lStart.y, et) + wave,
    });
  }

  const lTravelPts: Point[] = [];
  const snakeStepsB = 90;
  for (let index = 0; index <= snakeStepsB; index += 1) {
    const t = index / snakeStepsB;
    const et = easeOut(t);
    const wave =
      Math.sin(t * Math.PI * 2.2 + Math.PI) * height * 0.08 * (1 - Math.pow(t, 2));
    lTravelPts.push({
      x: lerp(width + 20, eStart.x, et),
      y: lerp(cy + height * 0.05, eStart.y, et) + wave,
    });
  }

  return {
    cx,
    cy,
    ePts,
    lPts,
    eTravelPts,
    lTravelPts,
    eAll: [...eTravelPts, ...ePts],
    lAll: [...lTravelPts, ...lPts],
  };
};

export function AnimatedSplashScreen({ onFinish }: AnimatedSplashScreenProps) {
  const geometry = useMemo(() => buildGeometry(SCREEN_WIDTH, SCREEN_HEIGHT), []);

  const [elapsedMs, setElapsedMs] = useState(0);
  const animationFrameRef = useRef<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const hasFinishedRef = useRef(false);

  useEffect(() => {
    const frame = (timestamp: number) => {
      if (startedAtRef.current === null) {
        startedAtRef.current = timestamp;
      }

      const elapsed = timestamp - startedAtRef.current;
      setElapsedMs(Math.min(elapsed, TOTAL_MS + 240));

      if (elapsed < TOTAL_MS + 240) {
        animationFrameRef.current = requestAnimationFrame(frame);
      }
    };

    animationFrameRef.current = requestAnimationFrame(frame);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = null;
      startedAtRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (hasFinishedRef.current || elapsedMs < TOTAL_MS + 200) {
      return;
    }
    hasFinishedRef.current = true;
    onFinish();
  }, [elapsedMs, onFinish]);

  const globalProgress = clamp01(elapsedMs / TOTAL_MS);
  const drawPhase = Math.min(globalProgress / T_TRAIL_END, 1);

  const eIdx = Math.floor(easeInOut(drawPhase) * (geometry.eAll.length - 1));
  const lIdx = Math.floor(easeInOut(drawPhase) * (geometry.lAll.length - 1));

  const eTrailSegments = useMemo(
    () => buildTrailSegments(geometry.eAll, Math.max(0, eIdx - TRAIL_WINDOW), eIdx),
    [eIdx, geometry.eAll],
  );
  const lTrailSegments = useMemo(
    () => buildTrailSegments(geometry.lAll, Math.max(0, lIdx - TRAIL_WINDOW), lIdx),
    [geometry.lAll, lIdx],
  );

  const eDot = geometry.eAll[Math.max(0, Math.min(eIdx, geometry.eAll.length - 1))];
  const lDot = geometry.lAll[Math.max(0, Math.min(lIdx, geometry.lAll.length - 1))];

  const trailVisibility =
    globalProgress <= T_LOGO_START
      ? 1
      : 1 - clamp01((globalProgress - T_LOGO_START) / (T_LOGO_END - T_LOGO_START));

  const dotVisibility = trailVisibility * (drawPhase < 0.97 ? 1 : clamp01(1 - (drawPhase - 0.97) / 0.03));

  const logoReveal =
    globalProgress < T_LOGO_START
      ? 0
      : easeOut(
          clamp01((globalProgress - T_LOGO_START) / (T_LOGO_END - T_LOGO_START)),
        );

  const wordmarkProgress =
    globalProgress < T_WM_START
      ? 0
      : easeOutQ(clamp01((globalProgress - T_WM_START) / (T_WM_END - T_WM_START)));

  const taglineProgress =
    globalProgress < T_TAG_START
      ? 0
      : easeOutQ(clamp01((globalProgress - T_TAG_START) / (T_TAG_END - T_TAG_START)));

  const overlayOpacity =
    globalProgress <= T_FADE_OUT_START
      ? 1
      : clamp01(1 - (globalProgress - T_FADE_OUT_START) / (1 - T_FADE_OUT_START));

  return (
    <View style={[styles.container, { opacity: overlayOpacity }]}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      <Svg
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      >
        <Defs>
          <RadialGradient id="dotGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="rgba(210,255,225,0.65)" />
            <Stop offset="35%" stopColor="rgba(70,200,120,0.24)" />
            <Stop offset="100%" stopColor="rgba(26,61,43,0)" />
          </RadialGradient>

          <RadialGradient id="logoAura" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="rgba(231,242,236,0.30)" />
            <Stop offset="70%" stopColor="rgba(231,242,236,0.08)" />
            <Stop offset="100%" stopColor="rgba(231,242,236,0)" />
          </RadialGradient>
        </Defs>

        {eTrailSegments.map((segment, index) => (
          <Path
            key={`e-dark-${index}`}
            d={segment.d}
            stroke={`rgba(60,190,100,${(segment.frac * 0.45 * trailVisibility).toFixed(3)})`}
            strokeWidth={8}
            strokeLinecap="round"
            fill="none"
          />
        ))}

        {eTrailSegments.map((segment, index) => (
          <Path
            key={`e-core-${index}`}
            d={segment.d}
            stroke={`rgba(180,255,210,${(segment.frac * 0.25 * trailVisibility).toFixed(3)})`}
            strokeWidth={2.2}
            strokeLinecap="round"
            fill="none"
          />
        ))}

        {lTrailSegments.map((segment, index) => (
          <Path
            key={`l-dark-${index}`}
            d={segment.d}
            stroke={`rgba(60,190,100,${(segment.frac * 0.45 * trailVisibility).toFixed(3)})`}
            strokeWidth={8}
            strokeLinecap="round"
            fill="none"
          />
        ))}

        {lTrailSegments.map((segment, index) => (
          <Path
            key={`l-core-${index}`}
            d={segment.d}
            stroke={`rgba(180,255,210,${(segment.frac * 0.25 * trailVisibility).toFixed(3)})`}
            strokeWidth={2.2}
            strokeLinecap="round"
            fill="none"
          />
        ))}

        <Circle
          cx={eDot.x}
          cy={eDot.y}
          r={DOT_GLOW_RADIUS}
          fill="url(#dotGlow)"
          opacity={dotVisibility * 0.62}
        />
        <Circle
          cx={eDot.x}
          cy={eDot.y}
          r={DOT_CORE_RADIUS}
          fill={`rgba(230,255,240,${(dotVisibility * 0.85).toFixed(3)})`}
        />

        <Circle
          cx={lDot.x}
          cy={lDot.y}
          r={DOT_GLOW_RADIUS}
          fill="url(#dotGlow)"
          opacity={dotVisibility * 0.62}
        />
        <Circle
          cx={lDot.x}
          cy={lDot.y}
          r={DOT_CORE_RADIUS}
          fill={`rgba(230,255,240,${(dotVisibility * 0.85).toFixed(3)})`}
        />

        {logoReveal > 0 ? (
          <Circle
            cx={geometry.cx}
            cy={geometry.cy}
            r={LOGO_RING_RADIUS + 28}
            fill="url(#logoAura)"
            opacity={logoReveal}
          />
        ) : null}

        {logoReveal > 0 ? (
          <Circle
            cx={geometry.cx}
            cy={geometry.cy}
            r={LOGO_RING_RADIUS + 6}
            fill={LOGO_FILL}
            opacity={logoReveal}
          />
        ) : null}

        {logoReveal > 0 ? (
          <Circle
            cx={geometry.cx}
            cy={geometry.cy}
            r={LOGO_RING_RADIUS + 6}
            stroke={`rgba(255,255,255,${(0.2 * logoReveal).toFixed(3)})`}
            strokeWidth={2}
            fill="none"
          />
        ) : null}
      </Svg>

      <View
        pointerEvents="none"
        style={[
          styles.logoWrap,
          {
            top: geometry.cy - LOGO_DIAMETER / 2,
            left: geometry.cx - LOGO_DIAMETER / 2,
            opacity: logoReveal,
            transform: [{ scale: 0.92 + 0.08 * logoReveal }],
          },
        ]}
      >
        <Text style={styles.logoText}>eL</Text>
      </View>

      <View
        pointerEvents="none"
        style={[
          styles.belowWrap,
          {
            top: geometry.cy + LOGO_RING_RADIUS + 52,
            opacity: wordmarkProgress,
            transform: [{ translateY: (1 - wordmarkProgress) * 8 }],
          },
        ]}
      >
        <Text style={styles.wordmark}>{WORDMARK_TEXT}</Text>
        <Text
          style={[
            styles.tagline,
            {
              opacity: taglineProgress,
              transform: [{ translateY: (1 - taglineProgress) * 6 }],
            },
          ]}
        >
          {TAGLINE_TEXT}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
    backgroundColor: BG,
  },
  logoWrap: {
    position: "absolute",
    width: LOGO_DIAMETER,
    height: LOGO_DIAMETER,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    color: LOGO_TEXT,
    fontSize: 50,
    lineHeight: 54,
    fontFamily: "InterSemiBold",
    includeFontPadding: false,
    textAlign: "center",
    textAlignVertical: "center",
  },
  belowWrap: {
    position: "absolute",
    width: "100%",
    alignItems: "center",
    gap: 10,
  },
  wordmark: {
    color: "rgba(244,255,248,0.97)",
    fontSize: 36,
    lineHeight: 40,
    fontFamily: "InterMedium",
    letterSpacing: 1.2,
  },
  tagline: {
    color: "rgba(218,242,228,0.80)",
    fontSize: 12,
    lineHeight: 16,
    fontFamily: "InterRegular",
    letterSpacing: 0.6,
  },
});
