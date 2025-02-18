import React, { useState, useEffect } from "react";
import { View, Image, ActivityIndicator, Text, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import { LinearGradient } from "expo-linear-gradient";
import i18n from "@/assets/languages/i18n";

const cacheImages = (images: string[]): Promise<boolean>[] => {
  return images.map((image: string) => Image.prefetch(image));
};

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const apiLink3 = `${process.env.EXPO_PUBLIC_BOOKS_API}books?collection=topBooks`;

  const router = useRouter();

  useEffect(() => {
    async function prepare() {
      try {
        const responses = await Promise.all([
          fetch(apiLink3)
            .then((res) => res.json())
            .catch(() => {
              setIsOffline(true);
              return [];
            }),
        ]);

        if (isOffline) return;

        const data = responses.flat();

        interface ApiResponse {
          coverImageUrl: string;
        }

        const imageUrls: string[] = data.map(
          (book: ApiResponse) => book.coverImageUrl
        );

        const imageAssets = cacheImages(imageUrls);

        await Promise.all(imageAssets);
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
  }, [apiLink3, isOffline, router]);

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
