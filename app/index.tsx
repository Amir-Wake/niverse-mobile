import React, { useState, useEffect } from "react";
import { View, Image, ActivityIndicator, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import NetInfo from "@react-native-community/netinfo";

const db = getFirestore();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const apiLink = `${process.env.EXPO_PUBLIC_BOOKS_API}topBooks`;
  const apiLink1 = `${process.env.EXPO_PUBLIC_BOOKS_API}newest`;
  const apiLink2 = `${process.env.EXPO_PUBLIC_BOOKS_API}books/genre/novels`;
  const apiLink3 = `${process.env.EXPO_PUBLIC_BOOKS_API}books/genre/biography`;
  const apiLink4 = `${process.env.EXPO_PUBLIC_BOOKS_API}books/genre/Non-fiction`;

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const cacheApiData = async (apiLink: string) => {
    try {
      const cachedData = await AsyncStorage.getItem(apiLink);
      const lastFetchTime = await AsyncStorage.getItem(`${apiLink}_time`);
      const currentTime = new Date().getTime();

      if (
        cachedData &&
        lastFetchTime &&
        currentTime - parseInt(lastFetchTime) < 24 * 60 * 60 * 1000
      ) {
        return JSON.parse(cachedData);
      } else {
        const response = await fetch(apiLink);
        const data = await response.json();
        await AsyncStorage.setItem(apiLink, JSON.stringify(data));
        await AsyncStorage.setItem(`${apiLink}_time`, currentTime.toString());
        return data;
      }
    } catch (error) {
      console.error("Error caching data:", error);
      return null;
    }
  };

  const cacheCollection = async (collectionName: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return;
      }

      const querySnapshot = await getDocs(
        collection(db, "users", user.uid, collectionName)
      );
      const data = querySnapshot.docs.map((doc) => doc.data());

      await AsyncStorage.setItem(
        `${collectionName}_${user.uid}`,
        JSON.stringify(data)
      );
      await AsyncStorage.setItem(
        `${collectionName}_${user.uid}_time`,
        new Date().getTime().toString()
      );
    } catch (error) {
      console.error(`Error caching collection ${collectionName}:`, error);
    }
  };

  useEffect(() => {
    async function prepare() {
      try {
        if (isOffline) return;
        await cacheApiData(apiLink);
        await cacheApiData(apiLink1);
        await cacheApiData(apiLink2);
        await cacheApiData(apiLink3);
        await cacheApiData(apiLink4);
      } catch (e) {
        console.warn(e);
      } finally {
        if (!isOffline) {
          const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user && user.emailVerified) {
              await cacheCollection("WantToRead");
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
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
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
          <View style={{ marginVertical: 10, padding: 10 }}></View>
        </View>
      </View>
    );
  }

  return null;
}
