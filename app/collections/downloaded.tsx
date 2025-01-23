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
import { auth } from "../../firebase";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

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
              pathname: "/bookSheet",
              params: { apiLink: newApiLink },
            })
          }
        >
          <Image
            source={{ uri: item.coverImageUrl }}
            style={styles.bookImage}
            cachePolicy={"memory-disk"}
          />
          <Text style={styles.bookTitle}>{item.title.slice(0, 21)}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableOpacity
        style={{ flexDirection: "row", alignItems: "center" }}
        onPress={() => router.back()}
      >
        <Ionicons
          name="chevron-back-outline"
          size={35}
          style={{ padding: 10 }}
        />
        <Text style={{ fontSize: 20 }}>Collections</Text>
      </TouchableOpacity>
      <View style={styles.container}>
        <Text style={styles.collectionsHeader}>Downloaded</Text>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={books}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  navigation: {
    flexDirection: "row",
    alignItems: "center",
  },
  collectionsHeader: {
    fontSize: 36,
    padding: 10,
  },
  listContainer: {
    paddingVertical: 20,
  },
  bookContainer: {
    flex: 1,
    alignItems: "flex-start",
    padding: 10,
  },
  bookImage: {
    width: 170,
    height: 290,
    resizeMode: "cover",
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default Downloaded;
