import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
const apiLink = `${process.env.EXPO_PUBLIC_BOOKS_API}books`;
import NetInfo from "@react-native-community/netinfo";
import i18n from "@/assets/languages/i18n";
import * as Device from "expo-device";
import * as FileSystem from "expo-file-system";
import { auth } from "@/firebase";
import { EventRegister } from "react-native-event-listeners";

const { width } = Dimensions.get("window");

const isIpad = Device.deviceType === Device.DeviceType.TABLET;

const Update = () => {
  interface Book {
    title: string;
    coverImageUrl: string;
    bookId: string;
    inLibrary: boolean;
    version: number;
  }
  const [books, setBooks] = useState<Book[]>([]);
  const router = useRouter();
  const [networkError, setNetworkError] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!state?.isConnected) {
        setNetworkError(true);
      } else {
        setNetworkError(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    if (networkError) return;
    try {
      const storedUserId = await AsyncStorage.getItem("stored_userId");
      const storedBooks = await AsyncStorage.getItem("Books_" + storedUserId);
      const parsedStoredBooks = storedBooks ? JSON.parse(storedBooks) : [];
      const filteredBooks = [];

      for (const book of parsedStoredBooks) {
        if (book.inLibrary) {
          const response = await fetch(`${apiLink}/${book.bookId}`);
          if (response.ok) {
            const apiBook = await response.json();
            const bookVersion = book.version || 0;
            if (apiBook.version > bookVersion) {
              filteredBooks.push({ ...book, version: apiBook.version });
            }
          } else {
            console.error(`Failed to fetch book with ID: ${book.bookId}`);
          }
        }
      }

      setBooks(filteredBooks);
    } catch (error) {
      console.error("Error fetching books:", error);
      Alert.alert("Error", "Failed to fetch books.");
    }
    setLoading(false);
  };

  const renderItem = ({ item }: { item: Book }) => {
    const handleUpdate = async () => {
      const directory = `${FileSystem.documentDirectory}${auth.currentUser?.uid}/books/${item.bookId}/`;

      try {
        await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
        const token = await auth.currentUser?.getIdToken();
        const response = await fetch(`${apiLink}/${item.bookId}/file`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch download file URL");
        }

        const data = await response.json();

        const downloadResumable = FileSystem.createDownloadResumable(
          data.fileUrl,
          `${directory}${item.title}.epub`,
          {},
          (downloadProgress) => {
            const progress =
              downloadProgress.totalBytesWritten /
              downloadProgress.totalBytesExpectedToWrite;
            setProgress(Math.round(progress * 100));
          }
        );
        const result = await downloadResumable.downloadAsync();
        if (result) {
          await FileSystem.downloadAsync(
            item.coverImageUrl,
            `${directory}${item.title}.jpg`
          );

          const storedUserId = await AsyncStorage.getItem("stored_userId");
          const storedBooks = await AsyncStorage.getItem(
            "Books_" + storedUserId
          );
          const parsedStoredBooks = storedBooks ? JSON.parse(storedBooks) : [];
          const updatedBooks = parsedStoredBooks.map((book: Book) =>
            book.bookId === item.bookId
              ? { ...book, version: item.version }
              : book
          );
          await AsyncStorage.setItem(
            "Books_" + storedUserId,
            JSON.stringify(updatedBooks)
          );

          EventRegister.emit("booksDownloaded");
          setProgress(null);
          fetchBooks();
        } else {
          console.error("Download failed");
        }
      } catch (e) {
        console.error(e);
        Alert.alert("Error", "Failed to update the book.");
        setProgress(null);
      }
    };

    return (
      <View style={styles.bookRow}>
        <Image
          source={{ uri: item.coverImageUrl }}
          style={styles.bookImage}
          cachePolicy={"memory-disk"}
        />
        <View style={styles.bookDetails}>
          <Text style={styles.bookTitle}>{item.title}</Text>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdate}
            disabled={progress !== null}
          >
            <Text style={styles.updateButtonText}>
              {progress !== null ? `${progress}%` : i18n.t("update")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <View style={styles.container}>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={books}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            numColumns={1}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#FAF9F6",
    borderRadius: 20,
  },
  collectionsHeader: {
    fontSize: 30,
    padding: 10,
    textAlign: "center",
  },
  listContainer: {
    paddingVertical: 10,
  },
  bookRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#FFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookImage: {
    width: 80,
    height: 120,
    resizeMode: "cover",
    borderRadius: 5,
    borderColor: "lightgrey",
    borderWidth: 1,
  },
  bookDetails: {
    flex: 1,
    marginHorizontal: 10,
    justifyContent: "space-between",
    flexDirection: "row",
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    width: width * 0.4,
  },
  updateButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    width: 100,
    height: 30,
  },
  updateButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default Update;
