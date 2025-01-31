import {
  View,
  Image,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from "react-native";
import React, { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useRouter } from "expo-router";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

SplashScreen.preventAutoHideAsync();

const { width, height } = Dimensions.get("screen");

export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const apiLink = `${process.env.EXPO_PUBLIC_BOOKS_API}newest`;
  const apiLink2 = `${process.env.EXPO_PUBLIC_BOOKS_API}books/genre/fiction`;
  const apiLink3 = `${process.env.EXPO_PUBLIC_BOOKS_API}books/genre/science`;
  const router = useRouter();

  useEffect(() => {
    async function prepare() {
      try {
        await fetch(apiLink);
        await fetch(apiLink2);
        await fetch(apiLink3);
      } catch (e) {
        console.warn(e);
      } finally {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user && user.emailVerified) {
            router.push("/home");
          } else {
            router.push("/login/main");
          }
          setIsReady(true);
          SplashScreen.hideAsync();
        });

        return () => unsubscribe();
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <Image
        source={require("../assets/images/splash.png")}
        style={{ position: "absolute", width: width, height: height }}
      />
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    </View>
  );
}
