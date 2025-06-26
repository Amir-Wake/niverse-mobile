import React, { useState, useEffect, lazy, Suspense, memo } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Carousel from "react-native-reanimated-carousel";
import Animated, { FadeInDown } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScrollView } from "react-native-gesture-handler";
import {BlurView} from "expo-blur";
import * as Device from "expo-device";

const isIpad = Device.deviceType === Device.DeviceType.TABLET;

const { width, height } = Dimensions.get("window");
const BookDetails = lazy(() => import("@/app/components/bookView/bookDetails"));

const BookView = () => {
  const router = useRouter();
  const [books, setBooks] = useState<any[]>([]);
  const [initialBook, setInitialBook] = useState<any>(null);
  const { index, apiLink } = useLocalSearchParams<{ index: string; apiLink: string }>();

  const defaultIndex = parseInt(index) || 0;

  useEffect(() => {
    let isMounted = true;
    const fetchBooks = async () => {
      try {
        const lastFetchTime = await AsyncStorage.getItem(`${apiLink}_time`);
        const currentTime = Date.now();
        const isFetchTime = currentTime - parseInt(lastFetchTime || "0") > 24 * 60 * 60 * 1000;
        const cachedData = await AsyncStorage.getItem(apiLink as string);

        // Try to show the current book immediately if cached
        if (cachedData) {
          const cachedBooks = JSON.parse(cachedData);
          if (isMounted) {
            setBooks(cachedBooks);
            setInitialBook(cachedBooks[defaultIndex]);
          }
        }

        // Fetch from API if needed, but don't block UI
        if (!cachedData || isFetchTime) {
          const response = await fetch(apiLink as string);
          const data = await response.json();
          if (!data) return;
          const booksData = Array.isArray(data) ? data : [data];
          if (isMounted) {
            setBooks(booksData);
            setInitialBook(booksData[defaultIndex]);
          }
          await AsyncStorage.setItem(apiLink as string, JSON.stringify(booksData));
          await AsyncStorage.setItem(`${apiLink}_time`, currentTime.toString());
        }
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };
    fetchBooks();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiLink, defaultIndex]);

  return (
    <BlurView intensity={40} style={styles.bookSheetContainer}>
      {books.length > 0 && (
        <Carousel
          key={defaultIndex}
          autoPlay={false}
          data={books}
          defaultIndex={defaultIndex}
          loop={false}
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: isIpad ? 0.95 : 0.905,
            parallaxScrollingOffset: 50,
          }}
          width={width}
          renderItem={({ index }) => (
            <Animated.View
              style={{ marginTop: 20 }}
              entering={
                index === defaultIndex
                  ? undefined
                  : FadeInDown.delay(index * 250)
                      .duration(500)
                      .springify()
                      .damping(12)
              }
            >
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => router.dismiss()}
              >
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                  <Suspense
                    fallback={
                      <ActivityIndicator
                        style={styles.loadingContainer}
                        size="large"
                        color="red"
                      />
                    }
                  >
                    {/* Show initialBook instantly for the default index, fallback to books[index] otherwise */}
                    {index === defaultIndex && initialBook ? (
                      <BookDetails book={initialBook} />
                    ) : (
                      <BookDetails book={books[index]} />
                    )}
                  </Suspense>
                </View>
              </ScrollView>
            </Animated.View>
          )}
        />
      )}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    borderColor: "black",
    minHeight: height,
    borderWidth: 2,
    flex: 1,
    backgroundColor: "#F8F8FF",
    borderRadius: 20,
    overflow: "hidden",
  },
  bookSheetContainer: {
    flex: 1,
    backgroundColor: Platform.OS=='android'? "rgba(0, 0, 0, 0.8)":"transparent",
  },
  closeButton: {
    right: 20,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    zIndex: 1,
  },
  closeButtonText: {
    color: Platform.OS=='android'?"white":"black",
    fontWeight: "bold",
    fontSize: 35,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default memo(BookView);
