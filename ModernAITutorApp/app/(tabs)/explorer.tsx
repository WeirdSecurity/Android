import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TutorAPI } from '../../lib/api';
import TopicCard from '../../components/ui/TopicCard';

export default function ExplorerScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [featuredTopics, setFeaturedTopics] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadTopics();
  }, [selectedCategory]);

  const loadInitialData = async () => {
    setLoading(true);
    const [cats, featured] = await Promise.all([
      TutorAPI.getCategories(),
      TutorAPI.getFeaturedTopics(),
    ]);
    setCategories(cats);
    setFeaturedTopics(featured);
    await loadTopics();
    setLoading(false);
  };

  const loadTopics = async () => {
    const data = await TutorAPI.getTrendingTopics(selectedCategory || undefined);
    setTopics(data);
  };

  const filteredTopics = topics.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryName = (categoryId: string) =>
    categories.find((c) => c.id === categoryId)?.name;

  const renderHeader = () => (
    <View>
      {/* Hero Search */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>What do you want{'\n'}to learn today?</Text>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={22} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search subjects, courses..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={18} color="#94a3b8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Featured Courses (horizontal scroll) */}
      {!searchQuery && featuredTopics.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Featured</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
            data={featuredTopics}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TopicCard
                topic={item}
                categoryName={getCategoryName(item.category_id)}
                variant="featured"
                onPress={() => router.push(('/topic/' + item.id) as any)}
              />
            )}
          />
        </View>
      )}

      {/* Category Filter */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browse Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          <TouchableOpacity
            onPress={() => setSelectedCategory(null)}
            style={[styles.categoryChip, selectedCategory === null && styles.categoryChipActive]}
          >
            <MaterialIcons
              name="grid-view"
              size={16}
              color={selectedCategory === null ? '#ffffff' : '#334155'}
            />
            <Text style={[styles.categoryChipText, selectedCategory === null && styles.categoryChipTextActive]}>
              All
            </Text>
          </TouchableOpacity>

          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]}
            >
              <MaterialIcons
                name={cat.icon as any}
                size={16}
                color={selectedCategory === cat.id ? '#ffffff' : '#334155'}
              />
              <Text style={[styles.categoryChipText, selectedCategory === cat.id && styles.categoryChipTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Section Header before main list */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {searchQuery ? 'Search Results' : selectedCategory ? 'Topics' : 'Trending Now'}
        </Text>
        <Text style={styles.sectionCount}>{filteredTopics.length} courses</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <View style={styles.appBarBrand}>
          <View style={styles.brandIcon}>
            <Text style={styles.brandIconText}>GT</Text>
          </View>
          <Text style={styles.brandTitle}>Explore</Text>
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <MaterialIcons name="tune" size={20} color="#005da7" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredTopics}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="search-off" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>No topics found.</Text>
            <Text style={styles.emptySubText}>Try a different search or category.</Text>
          </View>
        }
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
            <TopicCard
              topic={item}
              categoryName={getCategoryName(item.category_id)}
              variant="default"
              onPress={() => router.push(('/topic/' + item.id) as any)}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  appBarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#005da7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIconText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 36,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 14,
  },
  sectionCount: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  featuredList: {
    paddingRight: 8,
  },
  categoryList: {
    gap: 8,
    paddingRight: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: '#f1f5f9',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  categoryChipActive: {
    backgroundColor: '#005da7',
    borderColor: '#005da7',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
  },
  emptySubText: {
    fontSize: 14,
    color: '#cbd5e1',
  },
});
