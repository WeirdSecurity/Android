import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';

interface SkeletonBoxProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

function SkeletonBox({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonBoxProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

/** Pre-built skeleton layout that mimics the Course Detail / Curriculum screen */
export function CurriculumSkeleton() {
  return (
    <View style={styles.container}>
      {/* Hero card skeleton */}
      <SkeletonBox height={180} borderRadius={20} style={{ marginBottom: 24 }} />

      {/* Section title */}
      <SkeletonBox width={160} height={22} borderRadius={6} style={{ marginBottom: 16 }} />

      {/* Module cards */}
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.moduleRow}>
          <SkeletonBox width={40} height={40} borderRadius={20} style={{ marginRight: 12, flexShrink: 0 }} />
          <View style={{ flex: 1 }}>
            <SkeletonBox width="70%" height={16} borderRadius={4} style={{ marginBottom: 8 }} />
            <SkeletonBox width="45%" height={12} borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
  );
}

/** Generic skeleton — pass count for how many rows to show */
export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.moduleRow}>
          <SkeletonBox width={48} height={48} borderRadius={12} style={{ marginRight: 12, flexShrink: 0 }} />
          <View style={{ flex: 1 }}>
            <SkeletonBox width="80%" height={16} borderRadius={4} style={{ marginBottom: 8 }} />
            <SkeletonBox width="50%" height={12} borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
  );
}

export default SkeletonBox;

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e2e8f0',
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  moduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
});
