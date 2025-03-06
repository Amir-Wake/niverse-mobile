import { Tabs } from "expo-router";
import React from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import i18n from "@/assets/languages/i18n";
import { Platform } from "react-native";

const isIpad=Platform.OS=="ios" && Platform.isPad;
export default function TabsLayout() {
  const iconSize = isIpad ? 30 : 24;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "black",
        tabBarInactiveTintColor: "darkgray",
        tabBarStyle: {
          backgroundColor: "#ffffff",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: i18n.t('home'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              color={color}
              size={iconSize}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: i18n.t('library'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "library" : "library-outline"}
              color={color}
              size={iconSize}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: i18n.t('profile'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              color={color}
              size={iconSize}
            />
          ),
        }}
      />
    </Tabs>
  );
}
