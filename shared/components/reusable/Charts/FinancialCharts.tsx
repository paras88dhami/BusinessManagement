import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Line,
  Path,
  Rect,
  Text as SvgText,
} from "react-native-svg";
import { useAppTheme } from "@/shared/components/theme/AppThemeProvider";
import { radius, spacing } from "@/shared/components/theme/spacing";
import { useThemedStyles } from "@/shared/components/theme/useThemedStyles";

export type ChartSeriesPoint = {
  label: string;
  value: number;
};

export type ChartDualSeriesPoint = {
  label: string;
  primaryValue: number;
  secondaryValue: number;
};

export type ChartSegment = {
  label: string;
  value: number;
  color: string;
};

const CHART_WIDTH = 320;
const CHART_HEIGHT = 170;
const PADDING_X = 38;
const PADDING_Y = 18;

const resolveBounds = (values: readonly number[]): { min: number; max: number } => {
  if (values.length === 0) {
    return { min: 0, max: 1 };
  }

  const minValue = Math.min(...values, 0);
  const maxValue = Math.max(...values, 0);

  if (minValue === maxValue) {
    return { min: minValue - 1, max: maxValue + 1 };
  }

  return { min: minValue, max: maxValue };
};

const toYCoordinate = (value: number, bounds: { min: number; max: number }): number => {
  const plotHeight = CHART_HEIGHT - PADDING_Y * 2;
  const ratio = (value - bounds.min) / (bounds.max - bounds.min);
  return CHART_HEIGHT - PADDING_Y - ratio * plotHeight;
};

const formatCompactValue = (value: number, currencyPrefix: string): string => {
  const sign = value < 0 ? "-" : "";
  const absoluteValue = Math.abs(value);

  if (absoluteValue >= 100000) {
    return `${sign}${currencyPrefix}${Math.round(absoluteValue / 1000)}k`;
  }

  if (absoluteValue >= 1000) {
    return `${sign}${currencyPrefix}${Math.round(absoluteValue / 1000)}k`;
  }

  return `${sign}${currencyPrefix}${Math.round(absoluteValue)}`;
};

const buildLinePath = (values: readonly { x: number; y: number }[]): string => {
  if (values.length === 0) {
    return "";
  }

  return values
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
};

const buildAreaPath = (
  values: readonly { x: number; y: number }[],
  baselineY: number,
): string => {
  if (values.length === 0) {
    return "";
  }

  const start = values[0];
  const end = values[values.length - 1];
  return `${buildLinePath(values)} L ${end.x} ${baselineY} L ${start.x} ${baselineY} Z`;
};

const buildArcPath = (params: {
  cx: number;
  cy: number;
  r: number;
  startAngle: number;
  endAngle: number;
}) => {
  const { cx, cy, r, startAngle, endAngle } = params;
  const startX = cx + r * Math.cos(startAngle);
  const startY = cy + r * Math.sin(startAngle);
  const endX = cx + r * Math.cos(endAngle);
  const endY = cy + r * Math.sin(endAngle);
  const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${startX} ${startY} A ${r} ${r} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
};

const normalizePoints = (
  points: readonly ChartSeriesPoint[],
  bounds: { min: number; max: number },
) => {
  return points.map((point, index) => {
    const x =
      PADDING_X +
      (index * (CHART_WIDTH - PADDING_X * 2)) / Math.max(points.length - 1, 1);
    const y = toYCoordinate(point.value, bounds);
    return { x, y };
  });
};

function EmptyChartState({ label }: { label: string }) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.emptyChartState}>
      <Text style={styles.emptyChartStateText}>{label}</Text>
    </View>
  );
}

export function LineAreaChart({
  data,
  currencyPrefix = "Rs",
}: {
  data: readonly ChartSeriesPoint[];
  currencyPrefix?: string;
}) {
  const theme = useAppTheme();

  if (data.length === 0) {
    return <EmptyChartState label="No chart data available." />;
  }

  const bounds = resolveBounds(data.map((point) => point.value));
  const normalized = normalizePoints(data, bounds);
  const baselineY = toYCoordinate(0, bounds);

  const yAxisLabels = [0, 0.33, 0.66, 1].map((ratio) => {
    return bounds.min + ratio * (bounds.max - bounds.min);
  });

  return (
    <View>
      <Svg
        width="100%"
        height={CHART_HEIGHT}
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      >
        {yAxisLabels.map((label, index) => {
          const y = toYCoordinate(label, bounds);
          return (
            <React.Fragment key={`${label}-${index}`}>
              <Line
                x1={PADDING_X}
                y1={y}
                x2={CHART_WIDTH - PADDING_X}
                y2={y}
                stroke={theme.colors.border}
                strokeDasharray="4 4"
              />
              <SvgText
                x={10}
                y={y + 4}
                fontSize={10}
                fill={theme.colors.mutedForeground}
              >
                {formatCompactValue(label, currencyPrefix)}
              </SvgText>
            </React.Fragment>
          );
        })}
        <Line
          x1={PADDING_X}
          y1={baselineY}
          x2={CHART_WIDTH - PADDING_X}
          y2={baselineY}
          stroke={theme.colors.mutedForeground}
          strokeWidth={1}
        />
        {normalized.map((point, index) => (
          <SvgText
            key={data[index]?.label ?? `x-label-${index}`}
            x={point.x - 8}
            y={CHART_HEIGHT - 2}
            fontSize={10}
            fill={theme.colors.mutedForeground}
          >
            {data[index]?.label}
          </SvgText>
        ))}
        <Path
          d={buildAreaPath(normalized, baselineY)}
          fill={theme.isDarkMode ? "rgba(99, 211, 148, 0.18)" : "rgba(31, 99, 64, 0.14)"}
        />
        <Path
          d={buildLinePath(normalized)}
          stroke={theme.colors.success}
          strokeWidth={3}
          fill="none"
        />
        {normalized.map((point, index) => (
          <Circle
            key={data[index]?.label ?? `point-${index}`}
            cx={point.x}
            cy={point.y}
            r={4}
            fill={theme.colors.success}
            stroke={theme.colors.card}
            strokeWidth={2}
          />
        ))}
      </Svg>
    </View>
  );
}

export function GroupedBarChart({
  data,
}: {
  data: readonly ChartDualSeriesPoint[];
}) {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);

  if (data.length === 0) {
    return <EmptyChartState label="No chart data available." />;
  }

  const max = Math.max(
    ...data.flatMap((point) => [point.primaryValue, point.secondaryValue]),
    1,
  );
  const plotHeight = CHART_HEIGHT - PADDING_Y * 2 - 18;
  const groupWidth = (CHART_WIDTH - PADDING_X * 2) / Math.max(data.length, 1);
  const barWidth = Math.max(12, groupWidth * 0.28);

  return (
    <View>
      <Svg
        width="100%"
        height={CHART_HEIGHT}
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      >
        {[0, 0.33, 0.66, 1].map((ratio, index) => {
          const y = CHART_HEIGHT - PADDING_Y - ratio * plotHeight;
          return (
            <Line
              key={index}
              x1={PADDING_X}
              y1={y}
              x2={CHART_WIDTH - PADDING_X}
              y2={y}
              stroke={theme.colors.border}
              strokeDasharray="4 4"
            />
          );
        })}
        {data.map((point, index) => {
          const groupX = PADDING_X + index * groupWidth;
          const primaryHeight = (point.primaryValue / max) * plotHeight;
          const secondaryHeight = (point.secondaryValue / max) * plotHeight;
          return (
            <React.Fragment key={point.label}>
              <Rect
                x={groupX + groupWidth * 0.12}
                y={CHART_HEIGHT - PADDING_Y - primaryHeight}
                width={barWidth}
                height={primaryHeight}
                rx={6}
                fill={theme.colors.success}
              />
              <Rect
                x={groupX + groupWidth * 0.56}
                y={CHART_HEIGHT - PADDING_Y - secondaryHeight}
                width={barWidth}
                height={secondaryHeight}
                rx={6}
                fill={theme.colors.destructive}
              />
              <SvgText
                x={groupX + groupWidth * 0.3}
                y={CHART_HEIGHT - 2}
                fontSize={10}
                fill={theme.colors.mutedForeground}
              >
                {point.label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: theme.colors.success }]}
          />
          <Text style={styles.legendText}>Income</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: theme.colors.destructive },
            ]}
          />
          <Text style={styles.legendText}>Expense</Text>
        </View>
      </View>
    </View>
  );
}

export function DualLineChart({
  data,
}: {
  data: readonly ChartDualSeriesPoint[];
}) {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);

  if (data.length === 0) {
    return <EmptyChartState label="No chart data available." />;
  }

  const max = Math.max(
    ...data.flatMap((point) => [point.primaryValue, point.secondaryValue]),
    1,
  );
  const primary = data.map((point, index) => ({
    x:
      PADDING_X +
      (index * (CHART_WIDTH - PADDING_X * 2)) / Math.max(data.length - 1, 1),
    y:
      CHART_HEIGHT -
      PADDING_Y -
      (point.primaryValue / max) * (CHART_HEIGHT - PADDING_Y * 2),
  }));
  const secondary = data.map((point, index) => ({
    x:
      PADDING_X +
      (index * (CHART_WIDTH - PADDING_X * 2)) / Math.max(data.length - 1, 1),
    y:
      CHART_HEIGHT -
      PADDING_Y -
      (point.secondaryValue / max) * (CHART_HEIGHT - PADDING_Y * 2),
  }));

  return (
    <View>
      <Svg
        width="100%"
        height={CHART_HEIGHT}
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      >
        {[0, 0.33, 0.66, 1].map((ratio, index) => {
          const y = CHART_HEIGHT - PADDING_Y - ratio * (CHART_HEIGHT - PADDING_Y * 2);
          return (
            <Line
              key={index}
              x1={PADDING_X}
              y1={y}
              x2={CHART_WIDTH - PADDING_X}
              y2={y}
              stroke={theme.colors.border}
              strokeDasharray="4 4"
            />
          );
        })}
        {data.map((point, index) => (
          <SvgText
            key={point.label}
            x={primary[index].x - 8}
            y={CHART_HEIGHT - 2}
            fontSize={10}
            fill={theme.colors.mutedForeground}
          >
            {point.label}
          </SvgText>
        ))}
        <Path
          d={buildLinePath(primary)}
          stroke={theme.colors.success}
          strokeWidth={3}
          fill="none"
        />
        <Path
          d={buildLinePath(secondary)}
          stroke={theme.colors.destructive}
          strokeWidth={3}
          fill="none"
        />
      </Svg>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: theme.colors.success }]}
          />
          <Text style={styles.legendText}>Inflow</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: theme.colors.destructive },
            ]}
          />
          <Text style={styles.legendText}>Outflow</Text>
        </View>
      </View>
    </View>
  );
}

export function SingleBarChart({
  data,
  color,
}: {
  data: readonly ChartSeriesPoint[];
  color: string;
}) {
  const theme = useAppTheme();

  if (data.length === 0) {
    return <EmptyChartState label="No chart data available." />;
  }

  const max = Math.max(...data.map((point) => point.value), 1);
  const plotHeight = CHART_HEIGHT - PADDING_Y * 2 - 18;
  const groupWidth = (CHART_WIDTH - PADDING_X * 2) / Math.max(data.length, 1);
  const barWidth = Math.max(16, groupWidth * 0.58);

  return (
    <View>
      <Svg
        width="100%"
        height={CHART_HEIGHT}
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      >
        {[0, 0.33, 0.66, 1].map((ratio, index) => {
          const y = CHART_HEIGHT - PADDING_Y - ratio * plotHeight;
          return (
            <Line
              key={index}
              x1={PADDING_X}
              y1={y}
              x2={CHART_WIDTH - PADDING_X}
              y2={y}
              stroke={theme.colors.border}
              strokeDasharray="4 4"
            />
          );
        })}
        {data.map((point, index) => {
          const groupX = PADDING_X + index * groupWidth;
          const barHeight = (point.value / max) * plotHeight;
          return (
            <React.Fragment key={point.label}>
              <Rect
                x={groupX + groupWidth * 0.2}
                y={CHART_HEIGHT - PADDING_Y - barHeight}
                width={barWidth}
                height={barHeight}
                rx={6}
                fill={color}
              />
              <SvgText
                x={groupX + groupWidth * 0.33}
                y={CHART_HEIGHT - 2}
                fontSize={10}
                fill={theme.colors.mutedForeground}
              >
                {point.label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

export function SemiDonutChart({
  segments,
  currencyPrefix = "Rs",
}: {
  segments: readonly ChartSegment[];
  currencyPrefix?: string;
}) {
  const theme = useAppTheme();
  const styles = useThemedStyles(createStyles);

  if (segments.length === 0) {
    return <EmptyChartState label="No chart data available." />;
  }

  const total = Math.max(
    segments.reduce((sum, segment) => sum + segment.value, 0),
    1,
  );
  const cx = 160;
  const cy = 130;
  const r = 68;
  const circumference = Math.PI;
  let startAngle = Math.PI;

  return (
    <View>
      <Svg width="100%" height={190} viewBox="0 0 320 190">
        <Path
          d={buildArcPath({
            cx,
            cy,
            r,
            startAngle: Math.PI,
            endAngle: 2 * Math.PI,
          })}
          stroke={theme.colors.border}
          strokeWidth={18}
          fill="none"
          strokeLinecap="round"
        />
        {segments.map((segment) => {
          const angleSpan = (segment.value / total) * circumference;
          const endAngle = Math.min(startAngle + angleSpan, 2 * Math.PI);
          const path = buildArcPath({ cx, cy, r, startAngle, endAngle });
          startAngle = endAngle;
          return (
            <Path
              key={segment.label}
              d={path}
              stroke={segment.color}
              strokeWidth={18}
              fill="none"
              strokeLinecap="butt"
            />
          );
        })}
      </Svg>
      <View style={styles.segmentList}>
        {segments.map((segment) => (
          <View key={segment.label} style={styles.segmentItem}>
            <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
            <Text style={styles.segmentLabel}>{segment.label}</Text>
            <Text style={styles.segmentValue}>
              {formatCompactValue(segment.value, currencyPrefix)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) => StyleSheet.create({
  emptyChartState: {
    minHeight: theme.scaleSpace(120),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.scaleSpace(spacing.md),
  },
  emptyChartStateText: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(12),
    textAlign: "center",
  },
  legendRow: {
    marginTop: theme.scaleSpace(spacing.sm),
    flexDirection: "row",
    justifyContent: "center",
    gap: theme.scaleSpace(spacing.md),
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.scaleSpace(spacing.xs),
  },
  legendDot: {
    width: theme.scaleSpace(10),
    height: theme.scaleSpace(10),
    borderRadius: radius.pill,
  },
  legendText: {
    color: theme.colors.mutedForeground,
    fontSize: theme.scaleText(12),
  },
  segmentList: {
    gap: theme.scaleSpace(spacing.xs),
  },
  segmentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.scaleSpace(spacing.xs),
  },
  segmentLabel: {
    flex: 1,
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(12),
    fontFamily: "InterMedium",
  },
  segmentValue: {
    color: theme.colors.cardForeground,
    fontSize: theme.scaleText(12),
    fontFamily: "InterBold",
  },
});
