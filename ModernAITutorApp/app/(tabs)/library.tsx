import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, SectionList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { TutorAPI } from '../../lib/api';

export default function LibraryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [libraryItems, setLibraryItems] = useState<any[]>([]);
  const [recentLessons, setRecentLessons] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const items = await TutorAPI.getLibraryItems();
    setLibraryItems(items.filter(i => i.type === 'resource'));
    setRecentLessons(items.filter(i => i.type === 'lesson'));
  };

  const filteredLibrary = libraryItems.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredRecent = recentLessons.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sections = [];
  if (filteredRecent.length > 0 || !searchQuery) {
    sections.push({ title: 'Recent Lessons', data: filteredRecent, type: 'recent' });
  }
  if (filteredLibrary.length > 0 || !searchQuery) {
    sections.push({ title: 'Saved Resources', data: filteredLibrary, type: 'saved' });
  }

  const renderItem = ({ item, section, index }: any) => {
    if (section.type === 'recent') {
      return (
        <TouchableOpacity className="bg-surface-container-lowest rounded-[24px] p-6 flex-col shadow-sm mb-6 mx-6">
          <View className={`w-12 h-12 rounded-[16px] flex items-center justify-center mb-4 ${index % 2 === 0 ? 'bg-secondary-container' : 'bg-surface-container-high'}`}>
            <MaterialIcons name={item.icon as any} size={24} color="#005da7" />
          </View>
          <Text className="font-body text-lg font-medium text-on-surface mb-1">{item.title}</Text>
          <Text className="font-label text-sm text-on-surface-variant">Last accessed: {item.accessed}</Text>
        </TouchableOpacity>
      );
    }

    if (section.type === 'saved') {
      return index === 0 ? (
        <TouchableOpacity className="bg-surface-container-lowest rounded-[24px] p-8 flex-col justify-between shadow-sm min-h-[200px] overflow-hidden mb-6 mx-6">
          <View className="flex-row items-start justify-between z-10 w-full mb-6">
            <View className="w-12 h-12 rounded-[16px] bg-surface-container flex items-center justify-center">
              <MaterialIcons name={item.icon as any} size={24} color="#005da7" />
            </View>
            <MaterialIcons name="bookmark-add" size={24} color="#717783" />
          </View>
          <View className="flex-col z-10">
            <Text className="font-headline text-xl font-bold text-on-surface mb-2">{item.title}</Text>
            {item.description && <Text className="font-body text-base text-on-surface-variant mb-2">{item.description}</Text>}
            <Text className="font-label text-sm text-outline">Saved: {item.accessed}</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity className="bg-surface-container-lowest rounded-[24px] p-6 flex-col justify-between shadow-sm min-h-[160px] mb-6 mx-6">
          <View className="w-10 h-10 rounded-full bg-surface flex items-center justify-center mb-4">
            <MaterialIcons name={item.icon as any} size={20} color="#7f5300" />
          </View>
          <View className="flex-col">
            <Text className="font-body text-lg font-medium text-on-surface mb-1">{item.title}</Text>
            <Text className="font-label text-sm text-outline">Saved: {item.accessed}</Text>
          </View>
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      {/* TopAppBar */}
      <View className="flex-row justify-between items-center px-6 py-3 bg-white/85 shadow-sm">
        <View className="flex-row items-center gap-3">
          <Image 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDzGHj4dNEDGz8CyEdCAq78Frt1qlaGoCnvT_LoZZaw-SqssYUmby6ssv1vYLRGqkdyUligdPw7JyEq0O88PmBViTs2eS97TTt7_fCS_QZTWU0PHF6_tYusbKU6lpI2dU-J3jrkuBiwejjViP9bgA5OQlpuf74omyoun5KAk56dEIajbTrn4WuJ734Hf6_ZbXoipYc8T1iGhdTlfkrSElEpH76_5Ndjc_V09b-bl80cA2Rpc2W08i7V5CfJmqSa6Mluow0jdwIH2nvk' }}
            className="w-10 h-10 rounded-full"
          />
          <Text className="text-lg font-extrabold text-blue-700">Guru</Text>
        </View>
        <TouchableOpacity className="w-10 h-10 flex items-center justify-center rounded-full">
          <MaterialIcons name="delete-sweep" size={24} color="#64748b" />
        </TouchableOpacity>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <Text className="font-headline text-2xl font-bold tracking-tight text-on-surface mb-6 mx-6 mt-2">{title}</Text>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View className="w-full mb-6 px-6 pt-8">
            <View className="bg-white/85 rounded-full flex-row items-center px-6 py-4 shadow-sm border border-slate-100">
              <MaterialIcons name="search" size={24} color="#717783" />
              <TextInput 
                className="flex-1 ml-4 text-on-surface font-body text-base h-8"
                placeholder="Search your library..."
                placeholderTextColor="#717783"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}
