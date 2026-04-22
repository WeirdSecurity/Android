import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#60a5fa', // blue-400 — pops on dark background
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          backgroundColor: '#0f172a', // slate-900 — premium dark tab bar
          borderTopWidth: 0,
          height: 58 + insets.bottom, // dynamically clears Android gesture bar
          paddingBottom: insets.bottom + 4,
          paddingTop: 8,
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: 0.4,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tutor',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                backgroundColor: focused ? 'rgba(96,165,250,0.15)' : 'transparent',
                padding: 6,
                borderRadius: 12,
              }}
            >
              <MaterialIcons name="forum" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explorer"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                backgroundColor: focused ? 'rgba(96,165,250,0.15)' : 'transparent',
                padding: 6,
                borderRadius: 12,
              }}
            >
              <MaterialIcons name="explore" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                backgroundColor: focused ? 'rgba(96,165,250,0.15)' : 'transparent',
                padding: 6,
                borderRadius: 12,
              }}
            >
              <MaterialIcons name="menu-book" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                backgroundColor: focused ? 'rgba(96,165,250,0.15)' : 'transparent',
                padding: 6,
                borderRadius: 12,
              }}
            >
              <MaterialIcons name="person" size={22} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
