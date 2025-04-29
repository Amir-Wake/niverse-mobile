import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import i18n from "@/assets/languages/i18n";
import * as Device from "expo-device";

const { width } = Dimensions.get("window");

const isIpad = Device.deviceType === Device.DeviceType.TABLET;

const Downloaded = () => {
  interface Book {
    title: string;
    coverImageUrl: string;
    bookId: string;
    downloaded: boolean;
  }
  const [books, setBooks] = useState<Book[]>([]);
  const router = useRouter();
  const apiLink = `${process.env.EXPO_PUBLIC_BOOKS_API}books`;
  const [networkError, setNetworkError] = useState(false);

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
    try {
      const storedUserId = await AsyncStorage.getItem("stored_userId");
      const storedBooks = await AsyncStorage.getItem("Books_" + storedUserId);
      const parsedStoredBooks = storedBooks ? JSON.parse(storedBooks) : [];
      const filteredBooks = parsedStoredBooks.filter(
        (book: Book) => book.downloaded === true
      );
      setBooks(filteredBooks);
    } catch (error) {
      console.error("Error fetching books:", error);
      Alert.alert("Error", "Failed to fetch books.");
    }
  };

  const renderItem = ({ item }: { item: Book }) => {
    const newApiLink = `${apiLink}/${item.bookId}`;
    return (
      <View style={styles.bookContainer}>
        <TouchableOpacity
          onPress={() =>
            !networkError &&
            router.push({
              pathname: "../bookView",
              params: { apiLink: newApiLink },
            })
          }
          onLongPress={() =>
            Alert.alert(
              i18n.t("deleteBook"),
              i18n.t("confirmCollectionDelete") + ` ${item.title}`,
              [
                {
                  text: i18n.t("cancel"),
                  style: "cancel",
                },
                {
                  text: i18n.t("ok"),
                  onPress: async () => {
                    try {
                      const storedUserId = await AsyncStorage.getItem(
                        "stored_userId"
                      );
                      const storedBooks = await AsyncStorage.getItem(
                        "Books_" + storedUserId
                      );
                      const parsedStoredBooks = storedBooks
                        ? JSON.parse(storedBooks)
                        : [];
                      const updatedBooks = parsedStoredBooks.map((book: Book) =>
                        book.bookId === item.bookId ? { ...book, downloaded: false } : book
                      );
                      await AsyncStorage.setItem(
                        "Books_" + storedUserId,
                        JSON.stringify(updatedBooks)
                      );
                      fetchBooks();
                    } catch (error) {
                      console.error("Error removing book:", error);
                    }
                  },
                },
              ]
            )
          }
        >
          <Image
            source={{ uri: item.coverImageUrl }}
            style={styles.bookImage}
            cachePolicy={"memory-disk"}
          />
          <Text style={styles.bookTitle}>{item.title}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View style={styles.container}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={books}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={isIpad ? 3 : 2}
          contentContainerStyle={styles.listContainer}
        />
      </View>
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
  bookContainer: {
    flex: 1,
    alignItems: "flex-start",
    padding: 10,
  },
  bookImage: {
    width: isIpad ? width / 3 - 60 : width / 2 - 40,
    height: isIpad ? (width / 3 - 60) * 1.5 : (width / 2 - 40) * 1.5,
    resizeMode: "cover",
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    width: isIpad ? width / 3 - 60 : width / 2 - 40,
  },
});

export default Downloaded;
