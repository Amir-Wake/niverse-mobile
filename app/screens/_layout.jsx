import { Stack } from "expo-router";
import React from "react";
import { useRouter } from "expo-router";

export default function ScreensLayout() {
  const screenOptions = {
    presentation: "fullScreenmodal",
    headerShown: false,
    gestureEnabled: false,
  };

  const navigation = useRouter();
  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="bookModal" />
    </Stack>
  );
}
