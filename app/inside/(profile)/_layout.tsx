import { Stack } from "expo-router";
import React from "react";
import i18n from "@/assets/languages/i18n";

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown:false }}>
      <Stack.Screen name="languages" options={{ title:i18n.t("language")}}/>
      <Stack.Screen name="privacyPolicy" options={{ title:i18n.t("privacyPolicy") }}/>
      <Stack.Screen name="terms" options={{ title:i18n.t("terms") }}/>
      <Stack.Screen name="updatePassword" options={{ title:i18n.t("updatePassword")}}/>
      <Stack.Screen name="updateProfile" options={{ title:i18n.t("accountDetails") }}/>
    </Stack>
  );
}
