/**
 * splashPaths.ts
 * Pure geometry engine for the eLekha splash animation.
 * No React Native imports - safe to unit-test or reuse.
 */

export interface Point {
  x: number;
  y: number;
}

interface BezSeg {
  type: "bez";
  p0: Point;
  p1: Point;
  p2: Point;
  p3: Point;
}

interface LineSeg {
  type: "lin";
  p0: Point;
  p1: Point;
}

type Seg = BezSeg | LineSeg;

function cbez(t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

function llin(t: number, p0: Point, p1: Point): Point {
  return {
    x: p0.x + (p1.x - p0.x) * t,
    y: p0.y + (p1.y - p0.y) * t,
  };
}

export function sampleSegments(segs: Seg[], sampleCount: number): Point[] {
  const pts: Point[] = [];
  const perSeg = Math.max(2, Math.ceil(sampleCount / segs.length));

  for (const seg of segs) {
    for (let index = 0; index <= perSeg; index += 1) {
      const t = index / perSeg;
      pts.push(
        seg.type === "bez"
          ? cbez(t, seg.p0, seg.p1, seg.p2, seg.p3)
          : llin(t, seg.p0, seg.p1),
      );
    }
  }

  return pts;
}

export function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

export interface LetterPaths {
  eDotPts: Point[];
  lDotPts: Point[];
  eTravelEnd: number;
  lTravelEnd: number;
  logoCenter: Point;
  logoRadius: number;
}

export function buildPaths(screenWidth: number, screenHeight: number): LetterPaths {
  const cx = screenWidth / 2;
  const cy = screenHeight / 2 - screenHeight * 0.1;

  const letterSize = Math.min(screenWidth, screenHeight) * 0.075;
  const letterWidth = letterSize * 0.75;

  const ex = cx - letterWidth * 1.4;
  const ey = cy;
  const er = letterSize * 0.9;

  const eTravelSegs: Seg[] = [
    {
      type: "bez",
      p0: { x: screenWidth + 30, y: cy + letterSize * 2.0 },
      p1: { x: screenWidth * 0.78, y: cy + letterSize * 3.8 },
      p2: { x: cx + letterWidth * 2.5, y: cy - letterSize * 3.0 },
      p3: { x: ex + er, y: ey },
    },
  ];

  const eLetterSegs: Seg[] = [
    {
      type: "bez",
      p0: { x: ex + er, y: ey },
      p1: { x: ex + er * 0.3, y: ey },
      p2: { x: ex - er * 0.3, y: ey },
      p3: { x: ex - er, y: ey },
    },
    {
      type: "bez",
      p0: { x: ex - er, y: ey },
      p1: { x: ex - er, y: ey - er * 0.45 },
      p2: { x: ex - er * 0.5, y: ey - er },
      p3: { x: ex, y: ey - er },
    },
    {
      type: "bez",
      p0: { x: ex, y: ey - er },
      p1: { x: ex + er * 0.5, y: ey - er },
      p2: { x: ex + er, y: ey - er * 0.5 },
      p3: { x: ex + er, y: ey },
    },
    {
      type: "bez",
      p0: { x: ex + er, y: ey },
      p1: { x: ex + er * 0.3, y: ey + er * 0.08 },
      p2: { x: ex - er * 0.3, y: ey + er * 0.08 },
      p3: { x: ex - er, y: ey + er * 0.05 },
    },
    {
      type: "bez",
      p0: { x: ex - er, y: ey + er * 0.05 },
      p1: { x: ex - er, y: ey + er * 0.5 },
      p2: { x: ex - er * 0.5, y: ey + er },
      p3: { x: ex, y: ey + er },
    },
    {
      type: "bez",
      p0: { x: ex, y: ey + er },
      p1: { x: ex + er * 0.55, y: ey + er },
      p2: { x: ex + er * 0.88, y: ey + er * 0.55 },
      p3: { x: ex + er * 0.82, y: ey + er * 0.22 },
    },
  ];

  const lx = cx + letterWidth * 1.4;
  const ly = cy;
  const lh = letterSize * 1.75;
  const lfw = letterSize * 1.1;

  const lTravelSegs: Seg[] = [
    {
      type: "bez",
      p0: { x: -30, y: cy - letterSize * 2.0 },
      p1: { x: screenWidth * 0.22, y: cy - letterSize * 3.8 },
      p2: { x: cx - letterWidth * 2.5, y: cy + letterSize * 3.0 },
      p3: { x: lx, y: ly - lh * 0.5 },
    },
  ];

  const lLetterSegs: Seg[] = [
    {
      type: "bez",
      p0: { x: lx, y: ly - lh * 0.5 },
      p1: { x: lx, y: ly - lh * 0.15 },
      p2: { x: lx, y: ly + lh * 0.18 },
      p3: { x: lx, y: ly + lh * 0.5 },
    },
    {
      type: "bez",
      p0: { x: lx, y: ly + lh * 0.5 },
      p1: { x: lx + lfw * 0.3, y: ly + lh * 0.5 },
      p2: { x: lx + lfw * 0.7, y: ly + lh * 0.5 },
      p3: { x: lx + lfw, y: ly + lh * 0.5 },
    },
  ];

  const travelSamples = 70;
  const letterSamples = 120;

  const eTravelPts = sampleSegments(eTravelSegs, travelSamples);
  const eLetterPts = sampleSegments(eLetterSegs, letterSamples);
  const lTravelPts = sampleSegments(lTravelSegs, travelSamples);
  const lLetterPts = sampleSegments(lLetterSegs, letterSamples);

  const logoCenter: Point = { x: (ex + lx + lfw) / 2, y: cy };
  const logoRadius = ((lx + lfw - ex) / 2) * 1.1;

  return {
    eDotPts: [...eTravelPts, ...eLetterPts],
    lDotPts: [...lTravelPts, ...lLetterPts],
    eTravelEnd: eTravelPts.length,
    lTravelEnd: lTravelPts.length,
    logoCenter,
    logoRadius,
  };
}
