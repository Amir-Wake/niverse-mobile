import React, { useState, useEffect, lazy, Suspense, memo } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Carousel from "react-native-reanimated-carousel";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScrollView } from "react-native-gesture-handler";

const { width, height } = Dimensions.get("window");
const BookDetails = lazy(() => import("@/app/components/bookView/bookDetails"));

const BookView = () => {
  const router = useRouter();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { index, apiLink } = useLocalSearchParams<{ index: string; apiLink: string }>();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch(apiLink as string);
        const data = await response.json();
        setBooks(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [apiLink]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

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
      <Carousel
        autoPlay={false}
        data={books}
        height={height}
        defaultIndex={defaultIndex}
        loop={false}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
        width={width}
        renderItem={({ index }) => (
          <ScrollView  showsVerticalScrollIndicator={false} style={{ marginTop: 20 }}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => router.dismiss()}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
            <Animated.View
              style={styles.container}
              entering={FadeInDown.duration(200).springify()}
            >
              <Suspense fallback={<ActivityIndicator size="large" color="#0000ff" />}>
                <BookDetails book={books[index]} />
              </Suspense>
            </Animated.View>
          </ScrollView>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width,
    borderColor: "black",
    minHeight: height,
    borderWidth: 2,
    flex: 1,
    padding: 15,
    backgroundColor: "#F8F8FF",
    borderRadius: 20,
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
