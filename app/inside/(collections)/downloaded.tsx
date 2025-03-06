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
const { width } = Dimensions.get("window");

const isIpad = Platform.OS === "ios" && Platform.isPad;
const Downloaded = () => {
  interface Book {
    title: string;
    coverImageUrl: string;
    bookId: string;
  }

  const [books, setBooks] = useState<Book[]>([]);
  const firestore = getFirestore();
  const router = useRouter();
  const apiLink = `${process.env.EXPO_PUBLIC_BOOKS_API}books`;

  useEffect(() => {
    const fetchBooks = async () => {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert(
          "Error",
          "You need to be logged in to view your collection."
        );
        return;
      }

      try {
        const querySnapshot = await getDocs(
          collection(firestore, "users", user.uid, "Downloaded")
        );
        const booksData = querySnapshot.docs.map((doc) => doc.data() as Book);
        setBooks(booksData);
      } catch (error) {
        console.error("Error fetching books:", error);
        Alert.alert("Error", "Failed to fetch books.");
      }
    };

    fetchBooks();
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
      <View style={styles.container}>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={books}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={isIpad?3:2}
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
    borderRadius: 20
  },
  navigation: {
    flexDirection: "row",
    alignItems: "center",
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
    padding: width * 0.025,
  },
  bookImage: {
    width: isIpad?(width / 3)-60:(width / 2)-40,
    height: isIpad?((width / 3)-60) * 1.5:((width / 2)-40) * 1.5,
    resizeMode: "cover",
  },
  bookTitle: {
    fontSize: isIpad?24:16,
    fontWeight: "bold",
    textAlign: "center",
    maxWidth: isIpad?(width / 3)-60:(width / 2)-40,
  },
});

export default Downloaded;
