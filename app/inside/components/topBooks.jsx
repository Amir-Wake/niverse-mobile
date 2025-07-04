import React, { useEffect, useRef, useState, memo } from "react";
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from "expo-device";

const { width, height } = Dimensions.get("window");
const isIpad = Device.deviceType === Device.DeviceType.TABLET;

const TopBooks = () => {
  const scrollViewRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const apiLink = `${process.env.EXPO_PUBLIC_BOOKS_API}topBooks`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cachedData = await AsyncStorage.getItem(apiLink);
        if (cachedData) {
          setData(JSON.parse(cachedData));
          setLoading(false);
          return;
        } else {
          const response = await fetch(apiLink);
          const data = await response.json();
          setData(data);
          await AsyncStorage.setItem(apiLink, JSON.stringify(data));
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [apiLink]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollViewRef.current && data.length > 0) {
        const nextIndex = (currentIndex + 1) % data.length;
        setCurrentIndex(nextIndex);
        scrollViewRef.current.scrollTo({
          x: nextIndex * width,
          animated: true,
        });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex, data]);

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / width);
    setCurrentIndex(newIndex);
  };

  const handleCirclePress = (index) => {
    setCurrentIndex(index);
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ x: index * width, animated: true });
    }
  };

  if (loading) {
    return (
      <ActivityIndicator
        style={styles.loadingCustomStyle}
        size="large"
        color="red"
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          ref={scrollViewRef}
          style={styles.containerCustomStyle}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {data.map((item, index) => (
            <View key={item.id} style={styles.bookCardContainer}>
              <LinearGradient
                colors={[item.coverDominantColor || "#F8F8FF", "#F8F8FF"]}
                style={styles.bookCard}
              />
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/inside/bookView",
                    params: { apiLink, index },
                  })
                }
                style={styles.bookCardContent}
              >
                <Image
                  source={{ uri: item.coverImageUrl }}
                  cachePolicy={"memory-disk"}
                  style={styles.bookImage}
                  placeholder={require("@/assets/images/picksPlaceHolder.png")}
                  placeholderContentFit="cover"
                  contentFit="cover"
                  transition={1000}
                />
                <Text style={styles.bookAuthorText}> {item.author}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      <View style={styles.circleBar}>
        {Array.from({ length: data.length }).map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleCirclePress(index)}
            style={styles.touchableCircle}
          >
            <View
              style={[
                styles.circle,
                { opacity: index === currentIndex ? 1 : 0.5 },
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
      </View>
    </View>
  );
};

export default memo(TopBooks);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8F8FF",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  containerCustomStyle: {
    width: width,
    height: height * 0.50,
  },
  loadingCustomStyle: {
    width: width,
    height: height * 0.64,
    borderColor: "grey",
    borderWidth: 1,
  },
  bookCardContainer: {
    width: width,
    alignItems: "center",
    justifyContent: "center",
  },
  bookCard: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width*2,
    height: "100%",
  },
  bookCardContent: {
    marginTop: isIpad? height * 0.04 : height * 0.08,
    width: width,
    alignItems: "center",
    justifyContent: "center",
  },
  bookImage: {
    width: isIpad ? width * 0.35 : width * 0.50,
    height: isIpad ? (width * 0.35)*1.5 : (width * 0.50)*1.5,
    borderRadius: 15,
    shadowColor: "black",
  },
  bookAuthorText: {
    textAlign: "center",
    marginVertical: 10,
    fontWeight: "bold",
    fontSize: isIpad?24:18,
  },
  circleBar: {
    flexDirection: "row",
    shadowColor: "black",
    justifyContent: "center",
  },
  touchableCircle: {
    padding: 5,
  },
  circle: {
    width: 25,
    height: 8,
    borderRadius: 5,
    backgroundColor: "gray",
    marginHorizontal: 5,
  },
});
