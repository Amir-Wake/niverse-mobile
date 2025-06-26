import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import * as Device from "expo-device";
import i18n from "@/assets/languages/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";

const isIpad = Device.deviceType === Device.DeviceType.TABLET;
const { width } = Dimensions.get("window");
interface Author {
  id: string;
  name: string;
  image: string;
}

export default function Authors() {
  const apiLink = `${process.env.EXPO_PUBLIC_AUTHOR_API}authors/`;
  const [authors, setAuthors] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchAuthors = async () => {
      const cachedAuthorsLastUpdated = await AsyncStorage.getItem("authorsLastUpdated");
      const cachedAuthors = await AsyncStorage.getItem("authors");
      if (
        cachedAuthors &&
        cachedAuthorsLastUpdated &&
        cachedAuthorsLastUpdated > new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      ) {
        setAuthors(JSON.parse(cachedAuthors));
        return;
      }
      try {
        const response = await fetch(apiLink);
        const data = await response.json();
        setAuthors(data);
        await AsyncStorage.setItem("authors", JSON.stringify(data));
        await AsyncStorage.setItem("authorsLastUpdated", new Date().toISOString());
      } catch (error) {
        console.error("Error fetching authors:", error);
      }
    };
    fetchAuthors();
  }, [apiLink]);

  return (
    <View style={{ flex: 1, backgroundColor: "#F8F8FF", borderBottomWidth: 1, borderColor: "#A9A9A9"}}>
      <View
        style={[
          styles.headers,
          { direction: i18n.locale == "ku" ? "rtl" : "ltr" },
        ]}
      >
        <Text style={styles.title}>{i18n.t("authors")}</Text>
      </View>
      <View
        style={[
          styles.headers,
          { direction: i18n.locale == "ku" ? "rtl" : "ltr" },
        ]}
      >
        <Text style={styles.description}>{i18n.t("authorsDescription")}</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ padding: 10 }}
      >
        {authors.map((author: Author) => (
          <TouchableOpacity
            key={author.id}
            onPress={() =>
              router.navigate({
                pathname: "/inside/author",
                params: {
                  authorName: author.name,
                },
              })
            }
            style={{ alignItems: "center", marginHorizontal: 10 }}
          >
            <Image
              source={{ uri: author.image }}
              style={{
                width: isIpad ? 100 : 80,
                height: isIpad ? 100 : 80,
                borderRadius: isIpad ? 50 : 40,
              }}
              contentFit="cover"
            />
            <Text style={{ textAlign: "center", marginTop: 5, fontSize: isIpad ? 20 : 16, width: width/4 }}>
              {author.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headers: {
    marginHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: "#101010",
    paddingTop: 6,
    fontSize: isIpad ? 30 : 22,
  },
  description: {
    color: "#101010",
    paddingBottom: 6,
    fontSize: isIpad ? 24 : 18,
  },
});
