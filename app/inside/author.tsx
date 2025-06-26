import { View, Text, FlatList, StyleSheet, TouchableOpacity, Dimensions, } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import * as Device from "expo-device";
import NetInfo from "@react-native-community/netinfo";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IconButton } from 'react-native-paper';

interface Book {
  id: string;
  title: string;
  coverImageUrl: string;
}

const isIpad = Device.deviceType === Device.DeviceType.TABLET;
const isAndroid = Device.osName === "Android";

const { width } = Dimensions.get("window");

const Authors = () => {
  const { authorName } = useLocalSearchParams();
  const apiLink = `${process.env.EXPO_PUBLIC_AUTHOR_API}author/${authorName}`;
  const bookApiLink = `${process.env.EXPO_PUBLIC_BOOKS_API}books`;
  const [books, setBooks] = useState<Book[]>([]);
  const [networkError, setNetworkError] = useState(false);
  const router = useRouter();

  
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
    const fetchBooksByAuthor = async () => {
      const cachedBooks = await AsyncStorage.getItem(`authorBooks-${authorName}`);
      const cachedLastUpdated = await AsyncStorage.getItem("authorLastUpdated");
      if (cachedBooks && cachedLastUpdated && new Date(cachedLastUpdated) > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
        setBooks(JSON.parse(cachedBooks));
        return;
      }
      try {
        const response = await fetch(apiLink);
        const data = await response.json();
        setBooks(data);
        await AsyncStorage.setItem(`authorBooks-${authorName}`, JSON.stringify(data));
        await AsyncStorage.setItem("authorLastUpdated", new Date().toISOString());
      } catch (error) {
        console.error("Error fetching books by author:", error);
      }
    };
    fetchBooksByAuthor();
  }, [apiLink]);

  const renderItem = ({ item }: { item: Book }) => {
      const newApiLink = `${bookApiLink}/${item.id}`;
      return (
        <View style={styles.bookContainer}>
          <TouchableOpacity
            onPress={() =>
              !networkError &&
              router.push({
                pathname: "/inside/bookView",
                params: { apiLink: newApiLink },
              })
            }
          >
            <Image
              source={{ uri: item.coverImageUrl }}
              style={styles.bookImage}
              contentFit="cover"
            />
          </TouchableOpacity>
        </View>
      );
  };
  return (
        <View style={{ flex: 1, backgroundColor: "white", paddingTop: isAndroid ? 20 : 0 }}>
          <View style={{ padding: 20, backgroundColor: "#FAF9F6", borderRadius: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={styles.authorName}>{authorName}</Text>
              <IconButton
              icon="close"
              size={isIpad?28:18}
              mode="contained-tonal"
              iconColor="black"
              style={{
                backgroundColor: "rgba(151, 151, 151, 0.25)",
                borderRadius: 20,
                padding: 0,
                margin: 0,
              }}
              onPress={()=>router.back()}
            />
          </View>
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
  )
}

export default Authors

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#FAF9F6",
    borderRadius: 20,
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
  authorName: {
    fontSize: isIpad?30:22,
    padding: 10,
    textAlign: "center",
    fontWeight: "bold",
    color: "#333",
  },
  listContainer: {
    paddingVertical: 10,
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