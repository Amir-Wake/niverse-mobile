import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { useReader } from "@epubjs-react-native/core";
import { IconButton, MD3Colors } from "react-native-paper";
import stringSimilarity from "string-similarity";
import * as Device from 'expo-device';

const isIpad = Device.deviceType === Device.DeviceType.TABLET;
const { height } = Dimensions.get("window");

interface Props {
  currentText: string;
  openSettings?: () => void;
}

export default function Header({ currentText, openSettings }: Props) {
  const navigation = useRouter();
  const {
    theme,
    bookmarks,
    addBookmark,
    removeBookmark,
    getCurrentLocation,
    injectJavascript,
  } = useReader();

  const [iconCol, setIconCol] = useState(MD3Colors.neutral60);
  const [isBookmark, setIsBookmark] = useState(false);

  useEffect(() => {
    setIconCol(theme.body.background === "#333" ? "white" : "black");
    const location = getCurrentLocation();
    if (location && location.start && location.end) {
      injectJavascript(`
        (function() {
          const location = ${JSON.stringify(location)};
          const cfi = makeRangeCfi(location.start.cfi, location.end.cfi);
          const reactNativeWebview = window.ReactNativeWebView !== undefined && window.ReactNativeWebView !== null ? window.ReactNativeWebView : window;
          book.getRange(cfi).then(range => {
            reactNativeWebview.postMessage(JSON.stringify({
              type: "onCurrentText",
              text: range.toString(),
              cfi: cfi
            }));
          }).catch(error => {
            reactNativeWebview.postMessage(JSON.stringify({
              type: "onError",
              error: error.message,
            }));
          });
        })();
      `);
    }
  }, [theme, getCurrentLocation]);

  useEffect(() => {
    let parsedText = "";
    try {
      if (!currentText) return;
      const parsed =
        typeof currentText === "string" ? JSON.parse(currentText) : currentText;
      if (parsed.type === "onCurrentText") {
        parsedText = parsed.text.trim();
      }
    } catch {
      return;
    }
    const matches = bookmarks.map((item) => {
      const similarity = stringSimilarity.compareTwoStrings(
        item.text,
        parsedText
      );
      return { ...item, similarity };
    });
    const bestMatch = matches.reduce(
      (max, curr) => (curr.similarity > max.similarity ? curr : max),
      { similarity: 0 }
    );
    setIsBookmark(bestMatch.similarity > 0.8);
  }, [bookmarks, currentText, getCurrentLocation]);

  const handleChangeBookmark = () => {
    const location = getCurrentLocation();
    if (!location) return;
    if (isBookmark) {
      const bookmark = bookmarks.find(
        (item) => item.location.start.href === location.start.href
      );
      if (bookmark) removeBookmark(bookmark);
    } else {
      addBookmark(location);
    }
  };

  const iconSize = isIpad ? 34 : 28;

  return (
    <View style={styles.container}>
      <IconButton
        icon="close-thick"
        iconColor={iconCol}
        size={iconSize}
        onPress={() => navigation.back()}
        style={styles.circle}
      />
      <View style={styles.actions}>
        <IconButton
          icon={isBookmark ? "bookmark" : "bookmark-outline"}
          iconColor={isBookmark ? "red" : iconCol}
          size={iconSize}
          animated
          onPress={handleChangeBookmark}
        />
        <IconButton
          icon={"message-cog-outline"}
          iconColor={iconCol}
          size={iconSize}
          animated
          onPress={openSettings}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 10,
    height: height * 0.05,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  circle: {
    borderRadius: 10,
    margin: 5,
    alignItems: "center",
    alignSelf: "flex-end",
    flexDirection: "row",
    shadowOffset: {
      width: -2,
      height: -2,
    },
    shadowOpacity: 0.5,
    elevation: 5,
  },
});
