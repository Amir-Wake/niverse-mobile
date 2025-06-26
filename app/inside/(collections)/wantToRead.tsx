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
import * as Device from "expo-device";

const { width } = Dimensions.get("window");
const isIpad = Device.deviceType === Device.DeviceType.TABLET;

const WantToRead = () => {
  interface Book {
    coverImageUrl: string;
    bookId: string;
    wantToRead: boolean;
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
    const fetchBooks = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("stored_userId");
        const storedBooks = await AsyncStorage.getItem(`WantToReadBooks_${storedUserId}`);
        const parsedStoredBooks = storedBooks ? JSON.parse(storedBooks) : [];
        setBooks(parsedStoredBooks);
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
            !networkError &&
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
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookImage: {
    width: isIpad ? width / 3 - 60 : width / 2 - 40,
    height: isIpad ? (width / 3 - 60) * 1.5 : (width / 2 - 40) * 1.5,
    resizeMode: "cover",
    borderRadius:10,
    borderColor:"grey",
    borderWidth:1,
  },
});

export default WantToRead;
