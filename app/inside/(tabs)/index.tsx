import React, { useState, useEffect, lazy, Suspense, memo } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  StatusBar,
  TextInput,
  Platform,
  ScrollView,
  StyleSheet,
  Image,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from "axios";
import i18n from "@/assets/languages/i18n";
import NetInfo from "@react-native-community/netinfo";
import Fuse from "fuse.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "@/firebase";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import * as Device from "expo-device";
import MiniPlayer from "../components/miniPlayer";

const PickCards = lazy(() => import("../components/topBooks"));
const BookList = lazy(() => import("../components/bookLists"));
const isIpad = Device.deviceType === Device.DeviceType.TABLET;

const { width } = Dimensions.get("window");
const Index = () => {
  const db = getFirestore();
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [networkError, setNetworkError] = useState(false);
  const apiLink = `${process.env.EXPO_PUBLIC_BOOKS_API}books`;
  const allBooksApi = `${process.env.EXPO_PUBLIC_ALLBOOKS_API}`;
  const [loading, setLoading] = useState(true);
  const [allBooks, setAllBooks] = useState<{ bookId: string; title: string }[]>(
    []
  );

  useEffect(() => {
    if (networkError) return;
    const fetchAllBooks = async () => {
      try {
        axios.get(allBooksApi).then((Response) => {
          setAllBooks(Response.data);
        });
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };
    fetchAllBooks();
    synceUserBooks();
  }, []);

  const synceUserBooks = async () => {
    try {
      const user = auth.currentUser;
      if (!user || networkError) return;

      const booksFetchTime = await AsyncStorage.getItem(
        `Books_lastFetchTime_${user.uid}`
      );
      const currentTime = Date.now();

      if (!booksFetchTime || currentTime - parseInt(booksFetchTime) >= 24 * 60 * 60 * 1000) {
        await AsyncStorage.setItem("stored_userId", user.uid);

        const Books = await AsyncStorage.getItem(`Books_${user.uid}`);
        const wantToReadBooks = await AsyncStorage.getItem(
          `WantToReadBooks_${user.uid}`
        );

        const userBooksCollection = collection(
          db,
          "users",
          user.uid,
          "user_books"
        );
        const wantToReadCollection = collection(
          db,
          "users",
          user.uid,
          "want_to_read_books"
        );

        if (Books) {
          const booksArray = JSON.parse(Books);
          if (Array.isArray(booksArray)) {
            for (const book of booksArray) {
              const querySnapshot = await getDocs(userBooksCollection);
              const existingDoc = querySnapshot.docs.find(
                (doc) => doc.data().bookId === book.bookId
              );

              if (!existingDoc) {
                await addDoc(userBooksCollection, book);
              }
            }
          } else {
            console.error("Books data is not an array.");
          }
        } else {
          const querySnapshot = await getDocs(userBooksCollection);
          const booksArray = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            inLibrary: false,
          }));
          await AsyncStorage.setItem(
            `Books_${user.uid}`,
            JSON.stringify(booksArray)
          );
        }

        if (wantToReadBooks) {
          const wantToReadArray = JSON.parse(wantToReadBooks);
          const querySnapshot = await getDocs(wantToReadCollection);

          for (const book of wantToReadArray) {
            const existingDoc = querySnapshot.docs.find(
              (doc) => doc.data().bookId === book.bookId
            );

            if (!existingDoc) {
              await addDoc(wantToReadCollection, book);
            }
          }

          for (const doc of querySnapshot.docs) {
            const firestoreBook = doc.data();
            const existsInLocal = wantToReadArray.some(
              (book: { bookId: string }) => book.bookId === firestoreBook.bookId
            );

            if (!existsInLocal) {
              await deleteDoc(doc.ref);
            }
          }
        } else {
          const querySnapshot = await getDocs(wantToReadCollection);
          const wantToReadArray = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
          }));
          await AsyncStorage.setItem(
            `WantToReadBooks_${user.uid}`,
            JSON.stringify(wantToReadArray)
          );
        }

        await AsyncStorage.setItem(
          `Books_lastFetchTime_${user.uid}`,
          currentTime.toString()
        );
      }
    } catch (error) {
      console.error("Error syncing user books:", error);
    }
  };

  const fuse = new Fuse(allBooks, {
    keys: ["title"],
    includeScore: true,
    threshold: 0.4,
  });
  const results: { bookId: string; title: string }[] = searchTerm
    ? fuse.search(searchTerm).map((result) => result.item)
    : allBooks;
  const scrollViewRef = React.useRef<ScrollView>(null);

  const handleTopScroll = () => {
    scrollViewRef?.current?.scrollTo({ y: 0, animated: true });
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!state?.isConnected) {
        setNetworkError(true);
      } else {
        setNetworkError(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleScroll = (event: {
    nativeEvent: { contentOffset: { y: number } };
  }): void => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setIsScrolled(offsetY > 0);
    if (showSearch) {
      setShowSearch(false);
    }
  };

  const toggleSearch = () => {
    setShowSearch((prev) => !prev);
    if (!showSearch) {
    }
    setSearchTerm("");
  };

  const handleBookPress = (book: { bookId: string; title: string }) => {
    if (networkError) return;
    const newApiLink = `${apiLink}/${book.bookId}`;
    router.push({
      pathname: "/inside/bookView",
      params: { apiLink: newApiLink },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <View style={[styles.header, {}]}>
          <View style={[styles.searchContainer, {}]}>
            <TouchableOpacity
              onPress={handleTopScroll}
              style={{ marginLeft: -10 }}
            >
              <Image
                source={require("@/assets/images/iconTr.png")}
                style={styles.appIcon}
              />
            </TouchableOpacity>
            {showSearch && (
              <TextInput
                style={[
                  styles.searchInput,
                  {
                    backgroundColor: showSearch ? "white" : "transparent",
                    borderColor: showSearch ? "#F94929" : "transparent",
                    borderRadius: 50,
                    position: "absolute",
                    width: "80%",
                    right: 0,
                    borderWidth: showSearch ? 1 : 0,
                  },
                ]}
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            )}
            <TouchableOpacity
              onPress={toggleSearch}
              style={styles.searchButton}
            >
              <Ionicons name="search" size={isIpad ? 36 : 28} color="#F94929" />
            </TouchableOpacity>
          </View>
          {searchTerm && results.length > 0 && showSearch && (
            <View style={styles.searchResults}>
              {results
                .filter((book) =>
                  searchTerm
                    .toLowerCase()
                    .split(" ")
                    .every((term) =>
                      book.title
                        .toLowerCase()
                        .split(" ")
                        .some((word) => word.startsWith(term))
                    )
                )
                .slice(0, 5)
                .map((book, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.searchResultItem}
                    onPress={() => handleBookPress(book)}
                  >
                    <Text style={{ fontSize: isIpad ? 22 : 18 }}>
                      {book.title}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          )}
        </View>
      </SafeAreaView>
      {networkError ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={60} color="red" />
          <Text
            style={{
              fontSize: 24,
              color: "black",
              textAlign: "center",
              fontWeight: "bold",
              paddingVertical: 20,
            }}
          >
            You're offline
          </Text>
          <Text style={{ fontSize: 18, color: "black", textAlign: "center" }}>
            Read books you've downloaded in the library
          </Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <View>
            <View>
              <Suspense fallback={<View />}>
                <PickCards />
              </Suspense>
            </View>
            <View
              style={{
                width: "100%",
                backgroundColor: "#F8F8FF",
                paddingHorizontal: 5,
                justifyContent: "center",
                alignItems: "flex-start",
              }}
            >
              <Suspense fallback={<View />}>
                <MiniPlayer />
              </Suspense>
            </View>
            <View>
              <Suspense fallback={<View />}>
                <BookList
                  title={i18n.t("new")}
                  description={i18n.t("newDescription")}
                  genre="newest"
                />
              </Suspense>
            </View>
            <Suspense fallback={<View />}>
              <BookList
                title={i18n.t("novels")}
                description={i18n.t("novelsDescription")}
                genre="books/genre/novels"
              />
              <BookList
                title={i18n.t("nonFiction")}
                description={i18n.t("nonFictionDescription")}
                genre="books/genre/Non-fiction"
              />
              <BookList
                title={i18n.t("biography")}
                description={i18n.t("biographyDescription")}
                genre="books/genre/memoir"
              />
              <BookList
                title={i18n.t("science")}
                description={i18n.t("scienceDescription")}
                genre="books/genre/science"
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
    top: 0,
    paddingTop: Platform.OS === "ios" ? 0 : 50,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  header: {
    padding: 5,
    width: width,
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: isIpad ? 56 : 50,
    borderRadius: 10,
  },
  appIcon: {
    width: isIpad ? 80 : 65,
    height: isIpad ? 80 : 65,
  },
  searchInput: {
    paddingRight: isIpad ? 60 : 50,
    paddingLeft: isIpad ? 30 : 20,
    flex: 1,
    color: "black",
    fontSize: isIpad ? 24 : 18,
    height: isIpad ? 50 : 40,
    backgroundColor: "transparent",
  },
  searchButton: {
    borderRadius: 50,
    padding: isIpad ? 6 : 5,
    margin: 4,
    backgroundColor: "#fff",
  },
  searchResults: {
    position: "absolute",
    width: "100%",
    backgroundColor: "white",
    top: 60,
    borderRadius: 24,
    alignSelf: "center",
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 24,
    margin: 2,
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
    backgroundColor: "white",
    padding: 20,
  },
});
