import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect } from "react";
import { Text, View, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Image } from "expo-image";
import { EventRegister } from "react-native-event-listeners";
import { useRouter } from "expo-router";
import * as Device from "expo-device";
import i18n from "@/assets/languages/i18n";

const isIpad = Device.deviceType === Device.DeviceType.TABLET;

const MiniPlayer = () => {
  interface Book {
    title: string;
    location: {
      start: {
        percentage: number;
      };
    };
    src: string;
    bookId: string;
    coverImagePath: string;
  }

  const [lastOpenedBook, setLastOpenedBook] = React.useState<Book | null>(null);
  const router = useRouter();
  useEffect(() => {
    fetchBookDetails();
    const listener = EventRegister.addEventListener(
      "lastOpenedBookChanged",
      () => {
        fetchBookDetails();
      }
    );
    return () => {
      if (typeof listener === "string") {
        EventRegister.removeEventListener(listener);
      }
    };
  }, []);

  const fetchBookDetails = async () => {
    const storedUserId = await AsyncStorage.getItem("stored_userId");
    const bookDetails = await AsyncStorage.getItem(
      `lastOpenedBook_${storedUserId}`
    );
    if (bookDetails) {
      const book = JSON.parse(bookDetails);
      setLastOpenedBook(book);
    } else {
      setLastOpenedBook(null);
    }
  };

  const calculateWidth = (title: string) => {
    const screenWidth = Dimensions.get("window").width;
    const baseWidth = isIpad ? 300 : 250;
    const maxWidth = screenWidth * 0.8;
    const dynamicWidth = Math.min(baseWidth + title.length * 5, maxWidth);
    return dynamicWidth;
  };

  return (
    <>
      {lastOpenedBook !== null && (
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/inside/bookReader",
              params: {
                fileUrl: lastOpenedBook?.src,
                bookId: lastOpenedBook?.bookId,
              },
            });
          }}
          style={{ flex: 1, marginVertical: 10 }}
        >
          <View
            style={[
              styles.container,
              { width: calculateWidth(lastOpenedBook?.title || "") },
            ]}
          >
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: lastOpenedBook?.src.replace(/\.epub$/, ".jpg") }}
              style={styles.image}
              cachePolicy={"memory-disk"}
            />
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              padding: 5,
            }}
          >
            <View style={{ alignItems: "center", flex: 1 }}>
              <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                {lastOpenedBook?.title}
              </Text>
              <Text
                style={{
                  fontSize: 18,
                  color: "#696969",
                  textDecorationLine: "none",
                }}
              >
                {i18n.t("continue")}
              </Text>
            </View>
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 50 / 2,
                backgroundColor: "#808080",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: isIpad ? 20 : 18,
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                {Math.floor(lastOpenedBook?.location?.start?.percentage * 100)}%
              </Text>
            </View>
          </View>
          </View>
        </TouchableOpacity>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E0E0E0",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    paddingHorizontal: 5,
  },
  title: {
    fontSize: isIpad ? 20 : 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    padding: 5,
  },
  imageContainer: {
    width: isIpad ? 70 : 60,
    height: isIpad ? 70 * 1.5 : 60 * 1.5,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 5,
  },
  percentageOverlay: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 5,
  },
  percentageText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default MiniPlayer;
