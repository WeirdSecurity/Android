import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ProgressBarProps {
  /** Value between 0 and 1 */
  progress: number;
  /** Bar fill color */
  color?: string;
  /** Track (background) color */
  trackColor?: string;
  /** Height of the bar in pixels */
  height?: number;
  /** Border radius */
  borderRadius?: number;
}

export default function ProgressBar({
  progress,
  color = '#005da7',
  trackColor = '#e2e8f0',
  height = 8,
  borderRadius = 100,
}: ProgressBarProps) {
  const clampedProgress = Math.min(1, Math.max(0, progress));

  return (
    <View style={[styles.track, { backgroundColor: trackColor, height, borderRadius }]}>
      <View
        style={[
          styles.fill,
          {
            backgroundColor: color,
            width: `${clampedProgress * 100}%`,
            height,
            borderRadius,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    // Width is set dynamically
  },
});
