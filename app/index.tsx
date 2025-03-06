import React, { useState, useEffect } from "react";
import { View, Image, ActivityIndicator, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const router = useRouter();

  useEffect(() => {
    async function prepare() {
      try {
        if (isOffline) return;
      } catch (e) {
        console.warn(e);
        setIsOffline(true);
      } finally {
        if (!isOffline) {
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && user.emailVerified) {
              router.replace("/inside/(tabs)");
            } else {
              router.replace("./(login)");
            }
            setIsReady(true);
          });

          return () => unsubscribe();
        }
      }
    }

    prepare();
  }, [isOffline, router]);

  if (!isReady) {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }} >
          <StatusBar
            barStyle="dark-content"
            backgroundColor="transparent"
            translucent
          />
          <Image
            source={require("../assets/images/iconTr.png")}
            style={{ width: 200, height: 200 }}
          />
          <View>
            <ActivityIndicator size="large" color="#F42C4E" />
          </View>
          <View style={{ marginVertical: 10, padding: 10 }}>
          </View>
        </View>
      </View>
    );
  }

  return null;
}
