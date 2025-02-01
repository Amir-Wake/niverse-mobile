import { useState, useEffect } from "react";
import { View, Image, ActivityIndicator, StatusBar, Dimensions, Text } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";

const { width, height } = Dimensions.get("window");

SplashScreen.preventAutoHideAsync();

const cacheImages = (images: string[]): Promise<boolean>[] => {
  return images.map((image: string) => {
    return Image.prefetch(image);
  });
};

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [showCustomLoadScreen, setShowCustomLoadScreen] = useState(true);
  const apiLink = `${process.env.EXPO_PUBLIC_BOOKS_API}newest`;
  const apiLink2 = `${process.env.EXPO_PUBLIC_BOOKS_API}books`;
  const apiLink3 = `${process.env.EXPO_PUBLIC_BOOKS_API}books?collection=topBooks`;

  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCustomLoadScreen(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        const responses = await Promise.all([
          fetch(apiLink).then((res) => res.json()).catch(() => []),
          fetch(apiLink2).then((res) => res.json()).catch(() => []),
          fetch(apiLink3).then((res) => res.json()).catch(() => []),
        ]);

        const data = responses.flat();

        interface ApiResponse {
          coverImageUrl: string;
        }

        const imageUrls: string[] = data.map((book: ApiResponse) => book.coverImageUrl);

        const imageAssets = cacheImages(imageUrls);

        await Promise.all([...imageAssets]);
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

    if (!showCustomLoadScreen) {
      prepare();
    }
  }, [showCustomLoadScreen]);

  if (showCustomLoadScreen) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>Loading...</Text>
      </View>
    );
  }

  if (!isReady) {
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
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 30 }}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </View>
    );
  }

  return null;
}
