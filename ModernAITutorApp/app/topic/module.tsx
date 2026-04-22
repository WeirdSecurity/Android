import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Markdown from 'react-native-markdown-display';
import { TutorAPI } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

export default function ModuleScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { topicId, topicTitle, moduleIndex, moduleTitle } = useLocalSearchParams<{
    topicId: string;
    topicTitle: string;
    moduleIndex: string;
    moduleTitle: string;
  }>();

  const [lessonContent, setLessonContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    loadLesson();
    // Check current completion state
    if (session?.user?.id && topicId) {
      TutorAPI.getProgress(session.user.id, topicId).then((completed) => {
        setIsCompleted(completed.includes(Number(moduleIndex)));
      });
    }
  }, []);

  const loadLesson = async () => {
    setLoading(true);
    const content = await TutorAPI.generateModuleLesson(topicTitle, moduleTitle);
    setLessonContent(content);
    setLoading(false);
  };

  const handleMarkComplete = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setMarking(true);

    if (session?.user?.id) {
      await TutorAPI.markModuleComplete(session.user.id, topicId, Number(moduleIndex));
    }
    setIsCompleted(true);
    setMarking(false);

    // Short delay so user sees the success state before going back
    setTimeout(() => router.back(), 600);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backIcon}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerSuper} numberOfLines={1}>{topicTitle}</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{moduleTitle}</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Module Badge */}
        <View style={styles.moduleBadgeRow}>
          <View style={styles.moduleBadge}>
            <MaterialIcons name="auto-awesome" size={14} color="#005da7" />
            <Text style={styles.moduleBadgeText}>Module {Number(moduleIndex) + 1} • AI-Generated Lesson</Text>
          </View>
          {isCompleted && (
            <View style={styles.completedBadge}>
              <MaterialIcons name="check-circle" size={14} color="#16a34a" />
              <Text style={styles.completedText}>Completed</Text>
            </View>
          )}
        </View>

        {/* Lesson Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#005da7" />
            <Text style={styles.loadingText}>Generating your lesson...</Text>
            <Text style={styles.loadingSubText}>Guru AI is crafting a personalized lesson for you</Text>
          </View>
        ) : (
          <View style={styles.lessonCard}>
            <Markdown style={markdownStyles}>{lessonContent}</Markdown>
          </View>
        )}
      </ScrollView>

      {/* Bottom CTA */}
      {!loading && (
        <View style={styles.bottomBar}>
          {isCompleted ? (
            <View style={styles.completedCta}>
              <MaterialIcons name="celebration" size={22} color="#16a34a" />
              <Text style={styles.completedCtaText}>Module Complete!</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleMarkComplete}
              disabled={marking}
              activeOpacity={0.85}
            >
              {marking ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <MaterialIcons name="check" size={20} color="#ffffff" />
                  <Text style={styles.completeButtonText}>Mark as Complete</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 8,
  },
  backIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerSuper: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  moduleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  moduleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  moduleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#005da7',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 14,
  },
  loadingText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  loadingSubText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 32,
  },
  lessonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16a34a',
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  completedCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#86efac',
  },
  completedCtaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#16a34a',
  },
});

const markdownStyles: any = {
  body: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 24,
  },
  heading1: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
    marginTop: 8,
    lineHeight: 28,
  },
  heading2: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 10,
    marginTop: 20,
    lineHeight: 24,
  },
  heading3: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    marginTop: 16,
  },
  strong: {
    fontWeight: '700',
    color: '#0f172a',
  },
  em: {
    fontStyle: 'italic',
    color: '#475569',
  },
  code_inline: {
    backgroundColor: '#f1f5f9',
    color: '#005da7',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fence: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  code_block: {
    color: '#e2e8f0',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    lineHeight: 20,
  },
  blockquote: {
    backgroundColor: '#eff6ff',
    borderLeftColor: '#005da7',
    borderLeftWidth: 4,
    paddingLeft: 14,
    paddingVertical: 8,
    borderRadius: 4,
    marginVertical: 8,
  },
  bullet_list: {
    marginVertical: 6,
  },
  ordered_list: {
    marginVertical: 6,
  },
  list_item: {
    marginVertical: 4,
    lineHeight: 22,
  },
  hr: {
    backgroundColor: '#e2e8f0',
    height: 1,
    marginVertical: 16,
  },
  link: {
    color: '#005da7',
    textDecorationLine: 'underline',
  },
};
