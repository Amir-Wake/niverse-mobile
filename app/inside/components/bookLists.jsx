import React, { useEffect, useState, memo } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";

const { width, height } = Dimensions.get("window");

const BookList = ({ title, description, genre }) => {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiLink = `${process.env.EXPO_PUBLIC_BOOKS_API}${genre}?collection=books`;

  useEffect(() => {
    fetch(apiLink)
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [genre]);

  if (loading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.header}>
        <Text style={styles.description}>{description}</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {data.map((item, index) => (
          <View key={index} style={styles.bookItem}>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/inside/bookView",
                  params: { apiLink, index },
                })
              }
            >
              <Image
                source={{ uri: item.coverImageUrl }}
                style={styles.bookImage}
                cachePolicy="memory-disk"
                placeholder={require("@/assets/images/listsPlaceHolder.jpg")}
                placeholderContentFit="cover"
                contentFit="cover"
                transition={1000}
              />
              <Text style={styles.bookTitle}>
                {item.title.length > 14
                  ? `${item.title.substring(0, 14)}...`
                  : item.title}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = {
  container: {
    marginBottom: 0,
    paddingBottom: 10,
    backgroundColor: "#F8F8FF",
    borderWidth: 1,
    borderColor: "#A9A9A9",
  },
  header: {
    marginHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: "#101010",
    paddingTop: 6,
    fontSize: 24,
  },
  description: {
    color: "#101010",
    paddingBottom: 6,
    fontSize: 16,
  },
  scrollViewContent: {
    paddingHorizontal: 15,
  },
  bookItem: {
    marginRight: 10,
    marginTop: 10,
  },
  bookImage: {
    width: width * 0.34,
    height: height * 0.22,
    borderRadius: 10,
  },
  bookTitle: {
    color: "#101010",
    fontSize: 18,
  },
};

export default memo(BookList);
