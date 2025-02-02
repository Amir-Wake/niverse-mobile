import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { auth } from "@/firebase";
import { useRouter } from "expo-router";
import { Image } from "expo-image";

const WantToRead = () => {
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
          collection(firestore, "users", user.uid, "WantToRead")
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
          numColumns={2}
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
    width: 170,
    height: 280,
    resizeMode: "cover",
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    maxWidth: 170,
  },
});

export default WantToRead;
