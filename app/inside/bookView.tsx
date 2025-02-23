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
import Animated, { BounceInDown, FadeInDown } from "react-native-reanimated";
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        const cachedData = await AsyncStorage.getItem(apiLink as string);
        if (cachedData) {
          setBooks(JSON.parse(cachedData));
          setLoading(false);
        } else {
          const response = await fetch(apiLink as string);
          const data = await response.json();
          setBooks(Array.isArray(data) ? data : [data]);
          await AsyncStorage.setItem(apiLink as string, JSON.stringify(data));
        }
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
        <ActivityIndicator size="large" color="red" />
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
          parallaxScrollingScale: 0.905,
          parallaxScrollingOffset: 50,
        }}
        width={width}
        renderItem={({ index }) => (
          <Animated.View style={{ marginTop: 20 }} entering={index==defaultIndex?BounceInDown.delay(0).duration(0).springify(0).damping(0):FadeInDown.delay(index*200)
                                    .duration(500)
                                    .springify()
                                    .damping(12)}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => router.dismiss()}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
            <View
              style={styles.container}
            >
              <Suspense fallback={<ActivityIndicator style={{flex:1, justifyContent:"center",alignItems:"center"}} size="large" color="red" />}>
                <BookDetails book={books[index]} />
              </Suspense>
            </View>
          </Animated.View>
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
