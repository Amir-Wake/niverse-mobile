import { Stack } from "expo-router";
import React from "react";
import i18n from "@/assets/languages/i18n";

export default function CollectionsLayout() {
  return (
    <Stack >
      <Stack.Screen name="wantToRead" options={{ title: i18n.t("wantToRead"), headerBackVisible:false }}/>
      <Stack.Screen name="downloaded" options={{ title:i18n.t("downloaded"), headerBackVisible:false }}/>
      <Stack.Screen name="finished" options={{ title:i18n.t("finished"), headerBackVisible:false }}/>
      <Stack.Screen name="update" options={{ title:i18n.t("update"), headerBackVisible:false }}/>
    </Stack>
  );
}
