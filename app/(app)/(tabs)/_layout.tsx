import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { Colors } from '@/constants/colors';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.55 }}>
      {emoji}
    </Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.honey,
        tabBarInactiveTintColor: Colors.mid,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.mid + '15',
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="hjem/index"
        options={{
          title: 'Hjem',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🏠" label="Hjem" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="kuber"
        options={{
          title: 'Mine Kuber',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🐝" label="Mine Kuber" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="kalender/index"
        options={{
          title: 'Kalender',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📅" label="Kalender" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="laer"
        options={{
          title: 'Info',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="📖" label="Info" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="samfunn/index"
        options={{
          title: 'Samfunn',
          tabBarIcon: ({ focused }) => (
            <TabIcon emoji="🌍" label="Samfunn" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
