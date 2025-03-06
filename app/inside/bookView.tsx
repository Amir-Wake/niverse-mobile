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
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get("window");
const BookDetails = lazy(() => import("@/app/components/bookView/bookDetails"));

const BookView = () => {
  const router = useRouter();
  const [books, setBooks] = useState<any[]>([]);
  const { index, apiLink } = useLocalSearchParams<{ index: string; apiLink: string }>();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(apiLink as string);
        if (cachedData) {
          setBooks(JSON.parse(cachedData));
        }

        const response = await fetch(apiLink as string);
        const data = await response.json();
        const booksData = Array.isArray(data) ? data : [data];

        if (JSON.stringify(booksData) !== cachedData) {
          setBooks(booksData);
          await AsyncStorage.setItem(apiLink as string, JSON.stringify(booksData));
        }
      } catch (error) {
        console.error("Error fetching books:", error);
        if (!books.length) {
          const cachedData = await AsyncStorage.getItem(apiLink as string);
          if (cachedData) {
            setBooks(JSON.parse(cachedData));
          }
        }
      }
    };

    fetchBooks();
  }, [apiLink]);

  if (!books.length) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "white" }}>No books available</Text>
      </View>
    );
  }

  const defaultIndex = index !== undefined && parseInt(index) < books.length ? parseInt(index) : 0;

  return (
    <View style={styles.bookSheetContainer}>
      {books.length > 0 && (
        <Carousel
          key={books.length} 
          autoPlay={false}
          data={books}
          height={height+50}
          defaultIndex={defaultIndex}
          loop={false}
          mode="parallax"
          modeConfig={{
            parallaxScrollingScale: Platform.OS=='ios'&& Platform.isPad? 0.95:0.905,
            parallaxScrollingOffset: 50,
          }}
          width={width}
          renderItem={({ index }) => (
            <Animated.ScrollView
              showsVerticalScrollIndicator={false}
              style={{ marginTop: 20 }}
              entering={index === defaultIndex ? undefined : FadeInDown.delay(index * 250)
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
              <View style={styles.container}>
              <Suspense
                fallback={
                <ActivityIndicator
                  style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
                  size="large"
                  color="red"
                />
                }
              >
                <BookDetails book={books[index]} />
              </Suspense>
              </View>
            </Animated.ScrollView>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
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
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  closeButton: {
    right: 20,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    zIndex: 1,
  },
  closeButtonText: {
    color: "white",
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
