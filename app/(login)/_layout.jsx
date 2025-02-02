import { Stack } from "expo-router";
import React from "react";
import i18n from "@/assets/languages/i18n";

export default function LoginLayout() {
  return (
    <Stack >
      <Stack.Screen name="index" options={{ title:"Login", headerShown:false, gestureEnabled:false }}/>
      <Stack.Screen name="restPassword" options={{title:i18n.t("resetPassword")}}/>
      <Stack.Screen name="verification" options={{title:""}}/>
      <Stack.Screen name="privacyPolicy" options={{title:i18n.t("privacyPolicy")}}/>
      <Stack.Screen name="terms" options={{title:i18n.t("terms")}}/>
      <Stack.Screen name="languages" options={{title:i18n.t("language")}}/>
    </Stack>
  );
}
