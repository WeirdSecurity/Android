import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { TutorAPI } from '../../lib/api';
import { CurriculumSkeleton } from '../../components/ui/SkeletonLoader';
import ProgressBar from '../../components/ui/ProgressBar';
import { useAuth } from '../../hooks/useAuth';

interface Module {
  index: number;
  title: string;
  duration: string;
  description: string;
}

export default function TopicDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { session } = useAuth();

  const [topic, setTopic] = useState<any>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [loadingTopic, setLoadingTopic] = useState(true);
  const [loadingCurriculum, setLoadingCurriculum] = useState(false);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    setLoadingTopic(true);
    const t = await TutorAPI.getTopicById(id as string);
    setTopic(t);
    setLoadingTopic(false);

    if (t) {
      setLoadingCurriculum(true);
      const [curriculum, progress] = await Promise.all([
        TutorAPI.generateCurriculum(t.title),
        session?.user?.id ? TutorAPI.getProgress(session.user.id, id as string) : Promise.resolve([]),
      ]);
      setModules(curriculum);
      setCompletedModules(progress);
      setLoadingCurriculum(false);
    }
  };

  const handleModulePress = async (mod: Module) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/topic/module',
      params: {
        topicId: id as string,
        topicTitle: topic?.title ?? '',
        moduleIndex: mod.index.toString(),
        moduleTitle: mod.title,
      },
    } as any);
  };

  const progressRatio = modules.length > 0 ? completedModules.length / modules.length : 0;
  const isCompleted = (idx: number) => completedModules.includes(idx);

  if (loadingTopic) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <CurriculumSkeleton />
      </SafeAreaView>
    );
  }

  if (!topic) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.centered}>
          <MaterialIcons name="error-outline" size={48} color="#94a3b8" />
          <Text style={styles.errorText}>Topic not found.</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backIcon} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Course Detail</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Topic Hero Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>{topic.title}</Text>
          <Text style={styles.heroDesc}>{topic.description}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MaterialIcons name="schedule" size={16} color="#005da7" />
              <Text style={styles.metaText}>{topic.duration_hrs} hours</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <MaterialIcons name="group" size={16} color="#005da7" />
              <Text style={styles.metaText}>{(topic.enrolled_count / 1000).toFixed(1)}k enrolled</Text>
            </View>
          </View>

          {/* Progress (only if user is signed in and has started) */}
          {session && modules.length > 0 && (
            <View style={styles.progressSection}>
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressLabel}>Your Progress</Text>
                <Text style={styles.progressPercent}>
                  {completedModules.length}/{modules.length} modules
                </Text>
              </View>
              <ProgressBar progress={progressRatio} color="#005da7" height={8} />
            </View>
          )}

          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => modules[0] && handleModulePress(modules[0])}
            activeOpacity={0.85}
          >
            <MaterialIcons name="play-arrow" size={20} color="#ffffff" />
            <Text style={styles.ctaButtonText}>
              {completedModules.length > 0 ? 'Continue Learning' : 'Start Learning'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Curriculum */}
        <View style={styles.curriculumSection}>
          <Text style={styles.curriculumTitle}>Curriculum</Text>
          <Text style={styles.curriculumSubtitle}>
            {loadingCurriculum ? 'Generating your personalized curriculum with AI...' : `${modules.length} modules • AI-generated`}
          </Text>

          {loadingCurriculum ? (
            <CurriculumSkeleton />
          ) : (
            modules.map((mod) => {
              const done = isCompleted(mod.index);
              return (
                <TouchableOpacity
                  key={mod.index}
                  style={[styles.moduleCard, done && styles.moduleCardDone]}
                  onPress={() => handleModulePress(mod)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.moduleNumber, done && styles.moduleNumberDone]}>
                    {done ? (
                      <MaterialIcons name="check" size={16} color="#ffffff" />
                    ) : (
                      <Text style={styles.moduleNumberText}>{mod.index + 1}</Text>
                    )}
                  </View>

                  <View style={styles.moduleInfo}>
                    <Text style={[styles.moduleTitle, done && styles.moduleTitleDone]}>
                      {mod.title}
                    </Text>
                    <Text style={styles.moduleDesc} numberOfLines={2}>
                      {mod.description}
                    </Text>
                    <View style={styles.moduleMeta}>
                      <MaterialIcons name="schedule" size={13} color="#94a3b8" />
                      <Text style={styles.moduleMetaText}>{mod.duration}</Text>
                    </View>
                  </View>

                  <MaterialIcons
                    name={done ? 'check-circle' : 'chevron-right'}
                    size={22}
                    color={done ? '#22c55e' : '#cbd5e1'}
                  />
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* Ask Tutor CTA */}
        {!loadingCurriculum && (
          <TouchableOpacity
            style={styles.tutorCta}
            onPress={() => router.push('/')}
            activeOpacity={0.85}
          >
            <MaterialIcons name="forum" size={20} color="#005da7" />
            <Text style={styles.tutorCtaText}>Ask Guru about this course</Text>
            <MaterialIcons name="arrow-forward" size={18} color="#005da7" />
          </TouchableOpacity>
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },

  heroCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
    lineHeight: 30,
  },
  heroDesc: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#005da7',
    fontWeight: '600',
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 12,
  },
  progressSection: {
    marginBottom: 20,
    gap: 8,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  progressPercent: {
    fontSize: 13,
    color: '#005da7',
    fontWeight: '700',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#005da7',
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: '#005da7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },

  curriculumSection: {
    paddingHorizontal: 16,
  },
  curriculumTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  curriculumSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 16,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    gap: 12,
  },
  moduleCardDone: {
    borderColor: '#dcfce7',
    backgroundColor: '#f0fdf4',
  },
  moduleNumber: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#bfdbfe',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  moduleNumberDone: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  moduleNumberText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#005da7',
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  moduleTitleDone: {
    color: '#166534',
  },
  moduleDesc: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 17,
    marginBottom: 6,
  },
  moduleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  moduleMetaText: {
    fontSize: 12,
    color: '#94a3b8',
  },

  tutorCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    margin: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#bfdbfe',
  },
  tutorCtaText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#005da7',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#94a3b8',
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#005da7',
    borderRadius: 100,
  },
  backBtnText: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
