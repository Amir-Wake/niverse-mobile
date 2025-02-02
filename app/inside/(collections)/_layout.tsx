import { Stack } from "expo-router";
import React from "react";
import i18n from "@/assets/languages/i18n";

export default function CollectionsLayout() {
  return (
    <Stack >
      <Stack.Screen name="wantToRead" options={{ title: i18n.t("wantToRead"), headerShown:false }}/>
      <Stack.Screen name="downloaded" options={{ title:i18n.t("downloaded"), headerShown:false }}/>
    </Stack>
  );
}
