import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
<<<<<<< HEAD
import { View, StyleSheet, Dimensions } from "react-native";
import { useReader } from "@epubjs-react-native/core";
=======
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
} from "react-native";
import { Theme, Themes, useReader } from "@epubjs-react-native/core";
>>>>>>> 9f3204233907014723ae806bb7c153b0ecb15a73
import { IconButton, MD3Colors } from "react-native-paper";
import stringSimilarity from "string-similarity";
import * as Device from 'expo-device';

const isIpad = Device.deviceType === Device.DeviceType.TABLET;
const { height } = Dimensions.get("window");

interface Props {
  currentText: string;
<<<<<<< HEAD
  openSettings?: () => void;
}

export default function Header({ currentText, openSettings }: Props) {
=======
  onOpenAnnotationsList: () => void;
  formatClear: () => void;
}

export default function Header({
  currentFontSize,
  increaseFontSize,
  decreaseFontSize,
  onPressSearch,
  onOpenBookmarksList,
  onOpenTocList,
  currentText,
  switchFontFamily,
  onOpenAnnotationsList,
  formatClear,
}: Props) {
>>>>>>> 9f3204233907014723ae806bb7c153b0ecb15a73
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
<<<<<<< HEAD
=======
      {showSettings && (
        <TouchableOpacity
          activeOpacity={0}
          style={[styles.settingsContainerMain, { width, height }]}
          onPress={() => setShowSettings(false)}
        >
          <View style={styles.settingsContainer}>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                style={[
                  styles.circle,
                  {
                    backgroundColor: theme.body.background,
                    borderColor:
                      theme.body.background === "#333"
                        ? MD3Colors.neutral100
                        : MD3Colors.neutral10,
                  },
                ]}
              >
                <IconButton
                  icon="marker"
                  iconColor={theme === Themes.DARK ? "white" : iconCol}
                  size={26}
                  mode="outlined"
                  style={{ borderRadius: 10 }}
                  onPress={() => {
                    onOpenAnnotationsList();
                    setShowSettings(false);
                  }}
                />
              </TouchableOpacity>
                <TouchableOpacity
                style={[
                  styles.circle,
                  {
                  backgroundColor: theme.body.background,
                  borderColor:
                    theme.body.background === "#333"
                    ? MD3Colors.neutral100
                    : MD3Colors.neutral10,
                  },
                ]}
                >
                <IconButton
                  icon="magnify"
                  animated
                  mode="outlined"
                  iconColor={theme === Themes.DARK ? "white" : iconCol}
                  size={26}
                  style={{ transform: [{ scale: 1.1 }], borderRadius: 10 }}
                  onPress={() => {
                  onPressSearch();
                  setShowSettings(false);
                  }}
                />
                </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                style={[
                  styles.circle,
                  {
                    backgroundColor: theme.body.background,
                    borderColor:
                      theme.body.background === "#333"
                        ? MD3Colors.neutral100
                        : MD3Colors.neutral10,
                  },
                ]}
              >
                <IconButton
                  icon="bookmark-multiple-outline"
                  animated
                  mode="outlined"
                  iconColor={theme === Themes.DARK ? "white" : iconCol}
                  size={26}
                  style={{ borderRadius: 10 }}
                  onPress={() => {
                    onOpenBookmarksList();
                    setShowSettings(false);
                  }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.circle,
                  {
                    backgroundColor: theme.body.background,
                    borderColor:
                      theme.body.background === "#333"
                        ? MD3Colors.neutral100
                        : MD3Colors.neutral10,
                  },
                ]}
              >
                <IconButton
                  icon="format-list-bulleted-square"
                  iconColor={theme === Themes.DARK ? "white" : iconCol}
                  size={26}
                  mode="outlined"
                  style={{ borderRadius: 10 }}
                  onPress={() => {
                    onOpenTocList();
                    setShowSettings(false);
                  }}
                />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                style={[
                  styles.circle,
                  {
                    backgroundColor: "white",
                    borderColor:
                      theme.body.background === "#333"
                        ? MD3Colors.neutral100
                        : MD3Colors.neutral10,
                    borderWidth: 1,
                  },
                ]}
                onPress={() => changeThemes(Themes.LIGHT)}
              >
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 22.5,
                    backgroundColor: "white",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{ fontSize: 24, color: "black", fontWeight: "bold" }}
                  >
                    A
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.circle,
                  {
                    backgroundColor: "black",
                    borderColor:
                      theme.body.background === "#333"
                        ? MD3Colors.neutral100
                        : MD3Colors.neutral10,
                    borderWidth: 1,
                  },
                ]}
                onPress={() => changeThemes(Themes.DARK)}
              >
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 22.5,
                    backgroundColor: "black",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{ fontSize: 24, color: "white", fontWeight: "bold" }}
                  >
                    A
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.circle,
                  {
                    backgroundColor: "#e8dcb8",
                    borderColor:
                      theme.body.background === "#333"
                        ? MD3Colors.neutral100
                        : MD3Colors.neutral10,
                    padding: 0,
                    borderWidth: 1,
                  },
                ]}
                onPress={() => changeThemes(Themes.SEPIA)}
              >
                <View
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 22.5,
                    backgroundColor: "#e8dcb8",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{ fontSize: 24, color: "black", fontWeight: "bold" }}
                  >
                    A
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                style={[
                  styles.circle,
                  {
                    backgroundColor: theme.body.background,
                    borderColor:
                      theme.body.background === "#333"
                        ? MD3Colors.neutral100
                        : MD3Colors.neutral10,
                  },
                ]}
                disabled={currentFontSize === MAX_FONT_SIZE}
              >
                <IconButton
                  icon="format-font-size-increase"
                  iconColor={theme === Themes.DARK ? "white" : iconCol}
                  size={26}
                  animated
                  mode="outlined"
                  style={{ borderRadius: 10 }}
                  onPress={increaseFontSize}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.circle,
                  {
                    backgroundColor: theme.body.background,
                  },
                ]}
                disabled={currentFontSize === MIN_FONT_SIZE}
              >
                <IconButton
                  icon="format-font-size-decrease"
                  iconColor={theme === Themes.DARK ? "white" : iconCol}
                  size={26}
                  mode="outlined"
                  style={{ borderRadius: 10 }}
                  onPress={decreaseFontSize}
                />
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: "row" }}>
            <TouchableOpacity
                style={[
                  styles.circle,
                  {
                    backgroundColor: theme.body.background,
                    borderColor:
                      theme.body.background === "#333"
                        ? MD3Colors.neutral100
                        : MD3Colors.neutral10,
                  },
                ]}
              >
                <IconButton
                  icon="reload"
                  iconColor={theme === Themes.DARK ? "white" : iconCol}
                  size={26}
                  mode="outlined"
                  style={{ borderRadius: 10 }}
                  onPress={formatClear}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.circle,
                  {
                    backgroundColor: theme.body.background,
                    borderColor:
                      theme.body.background === "#333"
                        ? MD3Colors.neutral100
                        : MD3Colors.neutral10,
                  },
                ]}
              >
                <IconButton
                  icon="format-align-justify"
                  iconColor={theme === Themes.DARK ? "white" : iconCol}
                  size={26}
                  mode="outlined"
                  style={{ borderRadius: 10 }}
                  onPress={switchFontFamily}
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      )}
>>>>>>> 9f3204233907014723ae806bb7c153b0ecb15a73
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
<<<<<<< HEAD
=======
  settingsContainerMain: {
    flex: 1,
    position: "absolute",
    backgroundColor: "transparent",
    zIndex: 5,
    top: 0,
  },
  settingsContainer: {
    position: "absolute",
    top: 60,
    right: 15,
    zIndex: 10,
    borderRadius: 10,
    alignItems: "flex-end",
  },
>>>>>>> 9f3204233907014723ae806bb7c153b0ecb15a73
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
