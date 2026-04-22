import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Switch,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Auth from '../../components/auth';
import { useAuth } from '../../hooks/useAuth';
import { TutorAPI } from '../../lib/api';

const SETTINGS = [
  { id: 'notifications', icon: 'notifications', label: 'Push Notifications' },
  { id: 'security', icon: 'security', label: 'Account Security' },
  { id: 'help', icon: 'help-outline', label: 'Help & Support' },
];

export default function ProfileScreen() {
  const { session, loading, signOut } = useAuth();
  const [totalCompleted, setTotalCompleted] = useState<number | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      TutorAPI.getTotalCompletedModules(session.user.id).then(setTotalCompleted);
    }
  }, [session]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#005da7" />
        </View>
      </SafeAreaView>
    );
  }

  if (!session) {
    return <Auth />;
  }

  const userEmail = session?.user?.email ?? 'Student';
  const userInitial = userEmail[0].toUpperCase();
  const memberSince = new Date(session.user.created_at ?? Date.now()).getFullYear();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>Profile</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>{userInitial}</Text>
            </View>
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
            </View>
          </View>
          <Text style={styles.userEmail}>{userEmail}</Text>
          <Text style={styles.userMeta}>Lifelong Learner · Member since {memberSince}</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalCompleted ?? '—'}</Text>
            <Text style={styles.statLabel}>Modules{'\n'}Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>🔥 7</Text>
            <Text style={styles.statLabel}>Day{'\n'}Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>14.5</Text>
            <Text style={styles.statLabel}>Hours{'\n'}This Week</Text>
          </View>
        </View>

        {/* Milestones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Milestones</Text>
          <View style={styles.milestonesGrid}>
            <TouchableOpacity 
              style={[styles.milestoneCard, { backgroundColor: '#fef3c7' }]}
              onPress={() => Alert.alert('7-Day Streak', 'You have logged in and learned for 7 consecutive days! Keep it up!')}
            >
              <MaterialIcons name="local-fire-department" size={28} color="#d97706" />
              <Text style={styles.milestoneName}>7-Day Streak</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.milestoneCard, { backgroundColor: '#eff6ff' }]}
              onPress={() => Alert.alert('Code Master', 'Awarded for completing your first advanced programming module.')}
            >
              <MaterialIcons name="terminal" size={28} color="#005da7" />
              <Text style={styles.milestoneName}>Code Master</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.milestoneCard, { backgroundColor: '#f0fdf4' }]}
              onPress={() => Alert.alert('First Module', 'You completed your very first learning module!')}
            >
              <MaterialIcons name="emoji-events" size={28} color="#16a34a" />
              <Text style={styles.milestoneName}>First Module</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.milestoneCard, { backgroundColor: '#fdf4ff' }]}
              onPress={() => Alert.alert('Top Learner', 'You are in the top 10% of learners this week.')}
            >
              <MaterialIcons name="star" size={28} color="#9333ea" />
              <Text style={styles.milestoneName}>Top Learner</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.settingsCard}>
            {SETTINGS.map((item, idx) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.settingsRow,
                  idx < SETTINGS.length - 1 && styles.settingsRowBorder,
                ]}
                activeOpacity={0.7}
                onPress={() => {
                  if (item.id === 'notifications') {
                    setNotificationsEnabled(!notificationsEnabled);
                  } else if (item.id === 'security') {
                    Alert.alert('Account Security', 'Your account is secured with end-to-end Supabase encryption.');
                  } else if (item.id === 'help') {
                    Alert.alert('Help & Support', 'For assistance, please email support@modernaitutor.com');
                  }
                }}
              >
                <View style={styles.settingsLeft}>
                  <View style={styles.settingsIcon}>
                    <MaterialIcons name={item.icon as any} size={20} color="#475569" />
                  </View>
                  <Text style={styles.settingsLabel}>{item.label}</Text>
                </View>
                {item.id === 'notifications' ? (
                  <Switch
                    value={notificationsEnabled}
                    onValueChange={setNotificationsEnabled}
                    trackColor={{ false: '#cbd5e1', true: '#005da7' }}
                  />
                ) : (
                  <MaterialIcons name="chevron-right" size={22} color="#cbd5e1" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity onPress={signOut} style={styles.signOutBtn} activeOpacity={0.8}>
            <MaterialIcons name="logout" size={18} color="#dc2626" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 100 },

  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#005da7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#005da7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e',
  },
  userEmail: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  userMeta: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#005da7',
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 15,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#f1f5f9',
    alignSelf: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },
  milestonesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  milestoneCard: {
    width: '47%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  milestoneName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
  },
  settingsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingsRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fecaca',
    backgroundColor: '#fff5f5',
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#dc2626',
  },
});
