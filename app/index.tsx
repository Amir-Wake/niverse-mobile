import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  ActivityIndicator,
  StatusBar,
  Text,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, collection, getDocs} from "firebase/firestore";
import NetInfo from "@react-native-community/netinfo";
import * as Application from "expo-application";

const db = getFirestore();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [updateRequired, setUpdateRequired] = useState(false);
  let isUpdateRequired = false;
  const apiLink = `${process.env.EXPO_PUBLIC_BOOKS_API}topBooks`;
  const apiLink1 = `${process.env.EXPO_PUBLIC_BOOKS_API}newest`;
  const apiLink2 = `${process.env.EXPO_PUBLIC_BOOKS_API}books/genre/novels`;
  const apiLink3 = `${process.env.EXPO_PUBLIC_BOOKS_API}books/genre/memoir`;
  const apiLink4 = `${process.env.EXPO_PUBLIC_BOOKS_API}books/genre/Non-fiction`;
  const apiLink5 = `${process.env.EXPO_PUBLIC_BOOKS_API}books/genre/science`;

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

  

  const check_update = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return;
      }
      const val = await getDocs(collection(db, "remote_config"));
      const data = val.docs.map((doc) => doc.data());
      if(!data || data.length === 0) return;
      const minimum_required_version = data[0].minimum_required_version;
      const currentVersion = Application.nativeApplicationVersion || "0.0.0";
      isUpdateRequired = currentVersion < minimum_required_version;
      setUpdateRequired(isUpdateRequired);
    } catch (error) {
      console.error(`Error checking update`, error);
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
        await cacheApiData(apiLink5);
      } catch (e) {
        console.warn(e);
      } finally {
        if (!isOffline && !isUpdateRequired) {
          const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user && user.emailVerified) {
              await check_update();
              if (isUpdateRequired) return;
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

  if (updateRequired) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
          <Image
            source={require("../assets/images/iconTr.png")}
            style={{ width: 150, height: 150, alignSelf: "flex-start" }}
          />
        <Text style={{ fontSize: 36, textAlign: "left", marginBottom: 20, fontWeight: "bold", width: "90%", }}>
          Update your application to the latest version
        </Text>
        <Text style={{ fontSize: 24, textAlign: "left", marginBottom: 40, width: "90%" }}>
          A new version of the Nverse is available. Please update your app to continue using Nverse.
        </Text>
      </View>
    );
  }

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
