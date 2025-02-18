import React, { useState, useEffect, lazy, Suspense, memo } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StatusBar,
  TextInput,
  Platform,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from "axios";
import Animated, { FadeInDown } from "react-native-reanimated";
import i18n from "@/assets/languages/i18n";

const PickCards = lazy(() => import("../components/topBooks"));
const BookList = lazy(() => import("../components/bookLists"));

const Index = () => {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [locations, setLocations] = useState<{ id: string; title: string }[]>(
    []
  );
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [networkError, setNetworkError] = useState(false);
  const apiLink = `${process.env.EXPO_PUBLIC_BOOKS_API}books`;

  useEffect(() => {
    setLoading(true);
    fetch(apiLink)
      .then((response) => response.json())
      .then(() => {
        setLoading(false);
        setNetworkError(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
        setNetworkError(true);
      });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (Date.now() - lastInteraction >= 5000 && showSearch) {
        setShowSearch(false);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [lastInteraction, showSearch]);

  const handleScroll = (event: {
    nativeEvent: { contentOffset: { y: number } };
  }): void => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setIsScrolled(offsetY > 0);
    if (showSearch) {
      setShowSearch(false);
      setSearchQuery("");
      setLocations([]);
    }
  };

  const fetchBooks = async (search: string): Promise<void> => {
    try {
      const response = await axios.get<{ id: string; title: string }[]>(
        apiLink,
        {
          params: { search },
        }
      );
      setLocations(response.data);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setLastInteraction(Date.now());
    if (text.length > 2) {
      fetchBooks(text);
    } else {
      setLocations([]);
    }
  };

  const toggleSearch = () => {
    setShowSearch((prev) => !prev);
    if (!showSearch) {
      setSearchQuery("");
      setLocations([]);
    }
  };

  const handleBookPress = (book: { id: string; title: string }) => {
    const newApiLink = `${apiLink}/${book.id}`;
    router.push({
      pathname: "/inside/bookView",
      params: { apiLink: newApiLink },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView
        style={[
          styles.safeArea,
          {
            backgroundColor: isScrolled
              ? "rgba(255, 255, 255, 0.95)"
              : "transparent",
          },
        ]}
      >
        <View style={styles.header}>
          <View
            style={[
              styles.searchContainer,
              { backgroundColor: showSearch ? "lightgray" : "transparent" },
            ]}
          >
            {!showSearch && (
              <Image
                source={require("@/assets/images/iconTr.png")}
                style={styles.appIcon}
              />
            )}
            {showSearch && (
              <TextInput
                // placeholder={i18n.t("searchForBooks")}
                // placeholderTextColor="black"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={handleSearchChange}
                onFocus={() => setLastInteraction(Date.now())}
              />
            )}
            <TouchableOpacity
              onPress={toggleSearch}
              style={styles.searchButton}
            >
              <Ionicons name="search" size={28} color="#F94929" />
            </TouchableOpacity>
          </View>
          {locations.length > 0 && showSearch && (
            <View style={styles.searchResults}>
              {locations.map((locs, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.searchResultItem,
                    index + 1 !== locations.length &&
                      styles.searchResultItemBorder,
                  ]}
                  onPress={() => handleBookPress(locs)}
                >
                  <Text>{locs.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </SafeAreaView>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="red" />
        </View>
      ) : networkError ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={50} color="red" />
          <Text style={styles.errorMessage}>
            Network failed. Please try again later.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <Animated.View
              entering={FadeInDown.delay(100)
                .duration(500)
                .springify()
                .damping(12)}
            >
              <Suspense
                fallback={<ActivityIndicator size="large" color="red" />}
              >
                <PickCards />
              </Suspense>
            </Animated.View>
            <Animated.View
              entering={FadeInDown.delay(400)
                .duration(500)
                .springify()
                .damping(12)}
            >
              <Suspense
                fallback={<ActivityIndicator size="large" color="red" />}
              >
                <BookList
                  title={i18n.t("new")}
                  description={i18n.t("newDescription")}
                  genre="newest"
                />
              </Suspense>
            </Animated.View>
            <Suspense fallback={<ActivityIndicator size="large" color="red" />}>
              <BookList
                title={i18n.t("novels")}
                description={i18n.t("novelsDescription")}
                genre="books/genre/novels"
              />
              <BookList
                title={i18n.t("biography")}
                description={i18n.t("biographyDescription")}
                genre="books/genre/biography"
              />
              <BookList
                title={i18n.t("nonFiction")}
                description={i18n.t("nonFictionDescription")}
                genre="books/genre/Non-fiction"
              />
            </Suspense>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default memo(Index);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  safeArea: {
    position: "absolute",
    top: Platform.OS === "ios" ? -20 : -10,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  header: {
    marginBottom: Platform.OS === "ios" ? -25 : 10,
    marginHorizontal: 16,
    position: "relative",
  },
  searchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 46,
    borderRadius: 28,
    marginTop: 10,
  },
  appIcon: {
    width: 70,
    height: 70,
  },
  searchInput: {
    paddingLeft: 24,
    flex: 1,
    color: "black",
    fontSize: 16,
    height: 40,
    backgroundColor: "transparent",
  },
  searchButton: {
    borderRadius: 50,
    padding: 5,
    margin: 4,
    borderColor: "#F94929",
    borderWidth: 1,
    backgroundColor: "#fff",
  },
  searchResults: {
    position: "absolute",
    width: "100%",
    backgroundColor: "white",
    top: 64,
    borderRadius: 24,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  searchResultItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "gray",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorMessage: {
    marginTop: 10,
    fontSize: 18,
    color: "red",
  },
});
