import React, { useEffect, useState, memo } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Platform
} from "react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import i18n from "@/assets/languages/i18n";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get("window");
const isIpad = Platform.OS == "ios" && Platform.isPad;

const BookList = ({ title, description, genre }) => {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiLink = `${process.env.EXPO_PUBLIC_BOOKS_API}${genre}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(apiLink);
        if (cachedData) {
          setData(JSON.parse(cachedData));
          setLoading(false);
        }

        const response = await fetch(apiLink);
        const data = await response.json();

        if (JSON.stringify(data) !== cachedData) {
          setData(data);
          await AsyncStorage.setItem(apiLink, JSON.stringify(data));
        }

        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [genre]);

  if (loading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header,{direction: i18n.locale=="ku"? "rtl":"ltr"}]}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={[styles.header,{direction: i18n.locale=="ku"? "rtl":"ltr"}]}>
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
                placeholder={require("@/assets/images/listsPlaceHolder.png")}
                placeholderContentFit="cover"
                contentFit="cover"
                transition={100}
              />
              <Text style={styles.bookTitle}>
                {!isIpad&&item.title.length > 18
                  ? `${item.title.substring(0, 15)}...`
                  : isIpad&&item.title.length>23?`${item.title.substring(0, 20)}...`:item.title}
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
    borderBottomWidth: 1,
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
    fontSize: isIpad?34:26,
  },
  description: {
    color: "#101010",
    paddingBottom: 6,
    fontSize: isIpad?24:18,
  },
  scrollViewContent: {
    paddingHorizontal: 15,
  },
  bookItem: {
    marginRight: 10,
    marginTop: 10,
  },
  bookImage: {
    width: Platform.isPad ? width * 0.3 : width * 0.4,
    height: Platform.isPad ? (width * 0.3) * 1.5 : (width * 0.4) * 1.5,
    borderRadius: 10,
  },
  bookTitle: {
    color: "#101010",
    fontSize: isIpad?21:18,
    textAlign: "center",
  },
};

export default memo(BookList);
