import React from 'react';
import Svg, { Path } from 'react-native-svg';

type ChevronRightIconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function ChevronRightIcon({
  size = 18,
  color = '#6b7280',
  strokeWidth = 2,
}: ChevronRightIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18L15 12L9 6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}