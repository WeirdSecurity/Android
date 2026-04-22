import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Gradient-like accent colors per category
const CATEGORY_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  '1': { bg: '#1e3a5f', text: '#a4c9ff', accent: '#2976c7' }, // CS — deep blue
  '2': { bg: '#1a3a2e', text: '#6ee7b7', accent: '#059669' }, // Math — emerald
  '3': { bg: '#2d1b4e', text: '#c4b5fd', accent: '#7c3aed' }, // Physics — violet
  '4': { bg: '#3d1f00', text: '#fcd34d', accent: '#d97706' }, // History — amber
  default: { bg: '#1e293b', text: '#94a3b8', accent: '#475569' },
};

interface TopicCardProps {
  topic: {
    id: string;
    title: string;
    description: string;
    duration_hrs: number;
    enrolled_count: number;
    category_id?: string;
    is_featured?: boolean;
  };
  categoryName?: string;
  onPress: () => void;
  /** Compact horizontally-scrollable card for the Featured section */
  variant?: 'default' | 'featured';
}

export default function TopicCard({ topic, categoryName, onPress, variant = 'default' }: TopicCardProps) {
  const colors = CATEGORY_COLORS[topic.category_id ?? 'default'] ?? CATEGORY_COLORS.default;

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  if (variant === 'featured') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handlePress}
        style={[styles.featuredCard, { backgroundColor: colors.bg }]}
      >
        <View style={[styles.accentDot, { backgroundColor: colors.accent }]} />
        <Text style={[styles.featuredCategory, { color: colors.text }]} numberOfLines={1}>
          {categoryName ?? 'Course'}
        </Text>
        <Text style={styles.featuredTitle} numberOfLines={2}>
          {topic.title}
        </Text>
        <View style={styles.featuredMeta}>
          <MaterialIcons name="schedule" size={13} color="rgba(255,255,255,0.6)" />
          <Text style={styles.featuredMetaText}>{topic.duration_hrs} hrs</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handlePress}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.badge, { backgroundColor: colors.text + '22' }]}>
          <Text style={[styles.badgeText, { color: colors.accent }]}>
            {categoryName ?? 'Course'}
          </Text>
        </View>
        <View style={styles.arrowButton}>
          <MaterialIcons name="arrow-forward" size={18} color="#414751" />
        </View>
      </View>

      <Text style={styles.cardTitle}>{topic.title}</Text>
      <Text style={styles.cardDescription} numberOfLines={2}>
        {topic.description}
      </Text>

      <View style={styles.cardMeta}>
        <View style={styles.metaItem}>
          <MaterialIcons name="schedule" size={14} color="#717783" />
          <Text style={styles.metaText}>{topic.duration_hrs} hrs</Text>
        </View>
        <View style={styles.metaDivider} />
        <View style={styles.metaItem}>
          <MaterialIcons name="group" size={14} color="#717783" />
          <Text style={styles.metaText}>{(topic.enrolled_count / 1000).toFixed(1)}k enrolled</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Default card
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#191c1e',
    marginBottom: 8,
    lineHeight: 26,
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 14,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#717783',
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 10,
  },

  // Featured card (horizontal scroll)
  featuredCard: {
    width: 200,
    borderRadius: 20,
    padding: 20,
    marginRight: 12,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 150,
    justifyContent: 'flex-end',
  },
  accentDot: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.3,
  },
  featuredCategory: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    opacity: 0.8,
  },
  featuredTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
    lineHeight: 22,
    marginBottom: 12,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredMetaText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
});
