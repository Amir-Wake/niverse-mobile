import { Tabs } from "expo-router";
import React from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import i18n from "@/assets/languages/i18n";
import * as Device from "expo-device";

const isIpad = Device.deviceType === Device.DeviceType.TABLET;
export default function TabsLayout() {
  const iconSize = isIpad ? 30 : 24;
  const fontSize = isIpad ? 16 : 12;
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
          tabBarLabelStyle: { fontSize: fontSize },
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
          tabBarLabelStyle: { fontSize: fontSize },
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
          tabBarLabelStyle: { fontSize: fontSize },
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
