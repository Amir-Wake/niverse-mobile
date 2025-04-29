import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { IconButton } from "react-native-paper";
import i18n from "@/assets/languages/i18n";
import * as Device from "expo-device";

const isIpad = Device.deviceType === Device.DeviceType.TABLET;

export default function Collections() {
  const router = useRouter();

  const collections = [
    {
      name: i18n.t("wantToRead"),
      route: "./wantToRead",
      icon: "logout-variant",
    },
    {
      name: i18n.t("finished"),
      route: "./finished",
      icon: "check-circle",
    },
    {
      name: i18n.t("downloaded"),
      route: "./downloaded",
      icon: "download",
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View
        style={[
          styles.container,
          { direction: i18n.locale == "ku" ? "rtl" : "ltr" },
        ]}
      >
        {collections.map((collection, index) => (
          <TouchableOpacity
            key={index}
            style={styles.collectionItem}
            onPress={() => router.navigate(collection.route as any)}
          >
            <IconButton icon={collection.icon} size={isIpad ? 38 : 30} />
            <Text style={styles.collectionText}>{collection.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F6",
    borderRadius: 20,
  },
  collectionsHeader: {
    fontSize: 36,
    padding: 10,
    textAlign: "center",
  },
  collectionItem: {
    flexDirection: "row",
    width: "100%",
    borderColor: "lightgrey",
    borderWidth: 1,
    padding: 5,
  },
  collectionText: {
    fontSize: isIpad ? 28 : 20,
    padding: 15,
  },
});
