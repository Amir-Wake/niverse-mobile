import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, BackHandler } from "react-native";
import { useNavigationState } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function AppLayout() {
  const navigationState = useNavigationState((state) => state);
  const [gestureEnable, setGestureEnable] = useState(true);

  useEffect(() => {
    const backAction = () => {
      const currentRoute = navigationState.routes[navigationState.index].name;
      if (currentRoute === "(tabs)" || currentRoute === "index") {
        Alert.alert("Hold on!", "Are you sure you want to exit the app?", [
          {
            text: "Cancel",
            onPress: () => null,
            style: "cancel",
          },
          { text: "YES", onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [navigationState]);

  useEffect(() => {
    const currentRoute = navigationState.routes[navigationState.index]?.name;
    if (
      currentRoute === "(tabs)" ||
      (currentRoute == "index") | (currentRoute == "login")
    ) {
      setGestureEnable(false);
    } else {
      setGestureEnable(true);
    }
  }, [navigationState]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{ headerShown: false, gestureEnabled: gestureEnable }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen
          name="bookSheet"
          options={{
            presentation: "transparentModal",
            animation: "fade_from_bottom",
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
    </GestureHandlerRootView>
  );
}
