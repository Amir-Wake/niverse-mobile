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
const isIpad = Platform.OS == "ios" && Platform.isPad;
const { width, height } = Dimensions.get("window");
const BookDetails = lazy(() => import("@/app/components/bookView/bookDetails"));

const BookView = () => {
  const router = useRouter();
  const [books, setBooks] = useState<any[]>([]);
  const { index, apiLink} = useLocalSearchParams<{
    index: string;
    apiLink: string;
  }>();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const lastFetchTime = await AsyncStorage.getItem(`${apiLink}_time`);
        const currentTime = new Date().getTime();
        const isFetchTime = currentTime - parseInt(lastFetchTime || "0") > 24 * 60 * 60 * 1000;
        const cachedData = await AsyncStorage.getItem(apiLink as string);
        if (cachedData && !isFetchTime) {
          setBooks(JSON.parse(cachedData));
          return;
        }
        if (!cachedData || isFetchTime) {
          const response = await fetch(apiLink as string);
          const data = await response.json();
          if(!data) return;
          const booksData = Array.isArray(data) ? data : [data];
          setBooks(booksData);
          await AsyncStorage.setItem(
            apiLink as string,
            JSON.stringify(booksData)
          );
          const currentTime = new Date().getTime();
          await AsyncStorage.setItem(`${apiLink}_time`, currentTime.toString());

        }
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };
    fetchBooks();
  }, [apiLink]);

  const defaultIndex = parseInt(index)||0;

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
                        style={{
                          flex: 1,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        size="large"
                        color="red"
                      />
                    }
                  >
                    <BookDetails book={books[index]} />
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
    // backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  closeButton: {
    right: 20,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    zIndex: 1,
  },
  closeButtonText: {
    color: "black",
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
