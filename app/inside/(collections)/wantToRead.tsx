import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { auth } from "@/firebase";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

const { width } = Dimensions.get("window");

const isIpad = Platform.OS === "ios" && Platform.isPad;
const WantToRead = () => {
  interface Book {
    title: string;
    coverImageUrl: string;
    bookId: string;
  }
  const [books, setBooks] = useState<Book[]>([]);
  const [refresh, setRefresh] = useState(false);
  const firestore = getFirestore();
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
    const fetchBooks = async () => {
      try {
        const storedBooks = await AsyncStorage.getItem(
          "WantToRead_" + auth.currentUser?.uid
        );
        if (storedBooks) {
          setBooks(JSON.parse(storedBooks));
          return;
        } else {
          const user = auth.currentUser;
          if (!user) {
            Alert.alert(
              "Error",
              "You need to be logged in to view your collection."
            );
            return;
          }
          const querySnapshot = await getDocs(
            collection(firestore, "users", user.uid, "WantToRead")
          );
          const booksData = querySnapshot.docs.map((doc) => doc.data() as Book);
          setBooks(booksData);
          await AsyncStorage.setItem(
            "WantToRead_" + auth.currentUser?.uid,
            JSON.stringify(booksData)
          );
        }
      } catch (error) {
        console.error("Error fetching books:", error);
        Alert.alert("Error", "Failed to fetch books.");
      }
    };

    fetchBooks();
  }, [refresh]);

  useEffect(() => {
    const refreshBooks = async () => {
      const storedBooks = await AsyncStorage.getItem(
        "WantToRead_" + auth.currentUser?.uid
      );
      if (storedBooks) {
        setBooks(JSON.parse(storedBooks));
      }
    };

    const intervalId = setInterval(refreshBooks, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const renderItem = ({ item }: { item: Book }) => {
    const newApiLink = `${apiLink}/${item.bookId}`;
    return (
      <View style={styles.bookContainer}>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "../bookView",
              params: { apiLink: newApiLink },
            })
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
      {!networkError && (
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

export default WantToRead;
