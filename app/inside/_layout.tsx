import { Stack } from "expo-router";
import React from "react";
import i18n from "@/assets/languages/i18n";
import * as Device from "expo-device";

const isIpad = Device.deviceType === Device.DeviceType.TABLET;
export default function HomeLayout() {
  return (
    <Stack >
      <Stack.Screen name="(tabs)" options={{ title: "", headerShown:false}}/>
      <Stack.Screen name="bookView" options={{ title: "bookView", headerShown:false, presentation:"transparentModal", animation:"fade_from_bottom" }}/>
      <Stack.Screen name="writeReview" options={{ title: "writeReview", headerShown:false, presentation:isIpad?"transparentModal":"modal" }}/>
      <Stack.Screen name="allReviews" options={{ title: "allReviews", headerShown:false, presentation:isIpad?"transparentModal":"modal" }}/>
      <Stack.Screen name="bookReader" options={{ title: "bookReader", headerShown:false, presentation:"fullScreenModal" }}/>
      <Stack.Screen name="(collections)" options={{ title: i18n.t("collections"), headerShown:true }}/>
      <Stack.Screen name="collections" options={{ title: i18n.t("collections"), headerShown:true }}/>
      <Stack.Screen name="(profile)" options={{ title: "", headerShown:true }}/>
      <Stack.Screen name="translate" options={{ title: "Translate beta", headerShown:true, presentation:"modal" }}/>
      <Stack.Screen name="author" options={{ title: "", headerShown:false, presentation:isIpad?"transparentModal":"modal" }}/>
    </Stack>
  );
}
