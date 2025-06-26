import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  Platform,
  Keyboard,
  Dimensions,
  TextInput,
} from "react-native";
import * as FileSystem from "expo-file-system";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { IconButton } from "react-native-paper";
import i18n from "@/assets/languages/i18n";
import Ionicons from "react-native-vector-icons/Ionicons";
import { auth } from "@/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EventRegister } from "react-native-event-listeners";
import * as Device from "expo-device";
import NetInfo from "@react-native-community/netinfo";

const { width, height } = Dimensions.get("window");
const isIpad = Device.deviceType === Device.DeviceType.TABLET;

export default function Library() {
  interface Book {
    title: string;
    coverImagePath: string;
    filePath: string;
    id: string;
    addedAt: string | null;
  }

  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const router = useRouter();
  const db = getFirestore();

  useEffect(() => {
    fetchBooks();
    synceUserBooks("WantToReadBooks");
    synceUserBooks("DownloadedBooks");
    const listener = EventRegister.addEventListener("booksDownloaded", fetchBooks);
    return () => {
      if (typeof listener === "string") {
        EventRegister.removeEventListener(listener);
      }
    };
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkError(!state?.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const synceUserBooks = async (collectionName: string) => {
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
          `${collectionName}_${user.uid}`
        );
        const userBooksCollection = collection(db, "users", user.uid, "user_books");
        const wantToReadCollection = collection(db, "users", user.uid, `${collectionName}`);
        if (Books) {
          const booksArray = JSON.parse(Books);
          if (Array.isArray(booksArray)) {
            for (const book of booksArray) {
              const querySnapshot = await getDocs(userBooksCollection);
              const existingDoc = querySnapshot.docs.find(
                (doc) => doc.data().bookId === book.bookId
              );
              if (!existingDoc) await addDoc(userBooksCollection, book);
            }
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
            if (!existingDoc) await addDoc(wantToReadCollection, book);
          }
          for (const doc of querySnapshot.docs) {
            const firestoreBook = doc.data();
            const existsInLocal = wantToReadArray.some(
              (book: { bookId: string }) => book.bookId === firestoreBook.bookId
            );
            if (!existsInLocal) await deleteDoc(doc.ref);
          }
        } else {
          const querySnapshot = await getDocs(wantToReadCollection);
          const wantToReadArray = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
          }));
          await AsyncStorage.setItem(
            `${collectionName}_${user.uid}`,
            JSON.stringify(wantToReadArray)
          );
        }
      }
      if (collectionName === "DownloadedBooks") {
        await AsyncStorage.setItem(
          `Books_lastFetchTime_${user.uid}`,
          currentTime.toString()
        );
      }
    } catch (error) {
      console.error("Error syncing user books:", error);
    }
  };

  const fetchBooks = async () => {
    try {
      const directory = `${FileSystem.documentDirectory}${auth.currentUser?.uid}/books/`;
      const directoryInfo = await FileSystem.getInfoAsync(directory);
      if (!directoryInfo.exists) {
        setBooks([]);
        return;
      }
      const storedBooks = await AsyncStorage.getItem(
        `Books_${auth.currentUser?.uid}`
      );
      const parsedStoredBooks = storedBooks ? JSON.parse(storedBooks) : [];
      const bookFolders = await FileSystem.readDirectoryAsync(directory);
      const bookData = await Promise.all(
        bookFolders.map(async (folder) => {
          const folderPath = `${directory}${folder}/`;
          const files = await FileSystem.readDirectoryAsync(folderPath);
          const coverImageFile = files.find((file) => file.endsWith(".jpg"));
          const epubFile = files.find((file) => file.endsWith(".epub"));
          const bookTitle = coverImageFile
            ? decodeURIComponent(coverImageFile.replace(".jpg", ""))
            : null;
          const coverImagePath = coverImageFile
            ? `${folderPath}${coverImageFile}`
            : null;
          const filePath = epubFile ? `${folderPath}${epubFile}` : null;
          const filteredBooks = parsedStoredBooks.filter(
            (book: any) => book.bookId == folder
          );
          const addedAt =
            filteredBooks.length > 0 ? filteredBooks[0].addedAt : null;
          if (coverImagePath && filePath && bookTitle) {
            return {
              id: folder,
              title: bookTitle,
              coverImagePath,
              filePath,
              addedAt,
            };
          }
          return null;
        })
      );
      const sortedBooks = bookData
        .filter((book) => book !== null)
        .sort((a, b) => (b?.addedAt || "").localeCompare(a?.addedAt || ""));
      setBooks(sortedBooks.filter((book) => book !== null));
    } catch (error) {
      console.error("Error reading books directory:", error);
      Alert.alert("Error", "Failed to read books directory");
      cleanStorage();
    }
  };

  const cleanStorage = async () => {
    try {
      const directory = `${FileSystem.documentDirectory}${auth.currentUser?.uid}/books/`;
      const directoryInfo = await FileSystem.getInfoAsync(directory);
      if (directoryInfo.exists) {
        await FileSystem.deleteAsync(directory, { idempotent: true });
        console.log("Books directory cleaned successfully.");
      }
      setBooks([]);
    } catch (error) {
      console.error("Error cleaning storage:", error);
      Alert.alert("Error", "Failed to clean storage.");
    }
  };

  const updateSearch = (search: string) => {
    setSearch(search);
    if (search === "") {
      setIsSearching(false);
      fetchBooks();
    } else {
      setIsSearching(true);
      setBooks(
        books.filter((book) =>
          book.title.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  };

  const confirmDeleteBook = (folder: string, title: string) => {
    Alert.alert(
      i18n.t("deleteBook"),
      i18n.t("deleteBookText") + ` ${title}`,
      [
        { text: i18n.t("cancel"), style: "cancel" },
        { text: i18n.t("ok"), onPress: () => deleteBook(folder) },
      ],
      { cancelable: false }
    );
  };

  const deleteBook = async (folder: string) => {
    try {
      const storedUserId = await AsyncStorage.getItem("stored_userId");
      const directory = `${FileSystem.documentDirectory}${storedUserId}/books/${folder}`;
      await FileSystem.deleteAsync(directory, { idempotent: true });
      const storedBooks = await AsyncStorage.getItem("Books_" + storedUserId);
      const BooksList = JSON.parse(storedBooks || "[]");
      const updatedBooksList = BooksList.map((book: any) =>
        book.bookId === folder ? { ...book, inLibrary: false } : book
      );
      const lastOpenedBook = await AsyncStorage.getItem(
        `lastOpenedBook_${storedUserId}`
      );
      if (lastOpenedBook) {
        const parsedLastOpenedBook = JSON.parse(lastOpenedBook);
        if (parsedLastOpenedBook.bookId === folder) {
          await AsyncStorage.removeItem(`lastOpenedBook_${storedUserId}`);
        }
      }
      EventRegister.emit("lastOpenedBookChanged");
      await AsyncStorage.setItem(
        "Books_" + storedUserId,
        JSON.stringify(updatedBooksList)
      );
      fetchBooks();
    } catch (error) {
      console.error("Error deleting book folder:", error);
      Alert.alert("Error", "Failed to delete book folder");
    }
  };

  const renderItem = ({ item, index }: { item: Book; index: number }) => (
    <View style={styles.bookContainer} key={index}>
      <TouchableOpacity
        style={styles.bookHolder}
        onPress={() =>
          router.navigate({
            pathname: "/inside/bookReader",
            params: {
              fileUrl: item.filePath,
              bookId: item.id,
            },
          })
        }
        onLongPress={() => confirmDeleteBook(item.id, item.title)}
      >
        <Image
          source={{ uri: item.coverImagePath }}
          style={styles.bookImage}
          cachePolicy={"memory-disk"}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={updateSearch}
            onFocus={() => setIsSearching(true)}
          />
          <TouchableOpacity
            onPress={() => setIsSearching(!isSearching)}
            style={styles.searchButton}
          >
            <Ionicons name="search" size={isIpad?30:26} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.collectionContainer}>
          <TouchableOpacity
            style={[
              styles.collection,
              { direction: i18n.locale == "ku" ? "rtl" : "ltr" },
            ]}
            onPress={() => router.navigate("../collections")}
          >
            <IconButton icon={"reorder-horizontal"} size={isIpad ? 34 : 26} />
            <Text style={styles.collectionText}>{i18n.t("collections")}</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={books}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={isIpad ? 3 : 2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[
            styles.container,
            { direction: i18n.locale == "ku" ? "rtl" : "ltr" },
          ]}
          onScrollBeginDrag={Keyboard.dismiss}
        />
      </SafeAreaView>
      <TouchableOpacity />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 0 : height * 0.06,
    backgroundColor: "white",
  },
  searchContainer: {
    flexDirection: "row",
    margin: 10,
    backgroundColor: "#E5E4E2",
    borderRadius: 10,
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    padding: 10,
    color: "black",
    fontSize: isIpad ? 24 : 18,
  },
  searchButton: {
    padding: 10,
  },
  container: {
    paddingHorizontal: 10,
  },
  row: {
    justifyContent: "space-between",
  },
  bookContainer: {
    flex: 1,
    padding: 10,
    margin: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5.84,
  },
  collectionContainer: {
    borderColor: "#404040",
    borderWidth: 1,
  },
  collection: {
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  collectionText: {
    fontSize: isIpad ? 30 : 20,
    paddingVertical: 15,
  },
  bookImage: {
    width: isIpad ? width / 3 - 60 : width / 2 - 40,
    height: isIpad ? (width / 3 - 60) * 1.5 : (width / 2 - 40) * 1.5,
    borderRadius: 10,
    elevation: 5,
  },
  bookHolder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    width: isIpad ? width / 3 - 60 : width / 2 - 40,
    height: isIpad ? (width / 3 - 60) * 1.5 : (width / 2 - 40) * 1.5,
  },
});
