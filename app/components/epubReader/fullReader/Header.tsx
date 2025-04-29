import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
  I18nManager,
} from "react-native";
import { Theme, Themes, useReader } from "@epubjs-react-native/core";
import { IconButton, MD3Colors } from "react-native-paper";
import { MAX_FONT_SIZE, MIN_FONT_SIZE } from "./utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import stringSimilarity from "string-similarity";

const { width, height } = Dimensions.get("window");

interface Props {
  currentFontSize: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  onPressSearch: () => void;
  switchFontFamily: () => void;
  onOpenBookmarksList: () => void;
  onOpenTocList: () => void;
  currentText: string;
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
}: Props) {
  const navigation = useRouter();
  const {
    theme,
    bookmarks,
    addBookmark,
    removeBookmark,
    getCurrentLocation,
    changeTheme,
    injectJavascript,
  } = useReader();

  const [showSettings, setShowSettings] = useState(false);
  const [iconCol, setIconCol] = useState(MD3Colors.neutral60);
  const [isBookmark, setIsBookmark] = useState(false);
  useEffect(() => {
    if (
      theme.body.background === "#fff" ||
      theme.body.background === "#e8dcb8"
    ) {
      setIconCol("black");
    } else if (theme.body.background === "#333") {
      setIconCol("white");
    }
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
    } catch (error) {
      console.error("Failed to parse currentText:", error);
      return;
    }
    const matches = bookmarks.map((item) => {
      const bookmarkText = item.text;
      const similarity = stringSimilarity.compareTwoStrings(
        bookmarkText,
        parsedText
      );
      return { ...item, similarity };
    });

    const bestMatch = matches.reduce(
      (max, curr) => (curr.similarity > max.similarity ? curr : max),
      { similarity: 0 }
    );

    if (bestMatch.similarity > 0.8) {
      setIsBookmark(true);
    } else {
      setIsBookmark(false);
    }
  }, [bookmarks, currentText, getCurrentLocation]);

  const changeThemes = (theme: Theme) => {
    changeTheme(theme);
    AsyncStorage.setItem("currentTheme", JSON.stringify(theme));
  };

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

  const toggleSettings = () => {
    setShowSettings((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      <IconButton
        icon="close-thick"
        iconColor={iconCol}
        size={28}
        onPress={() => navigation.back()}
      />
      <View style={styles.actions}>
        <IconButton
          icon={isBookmark ? "bookmark" : "bookmark-outline"}
          iconColor={isBookmark ? "red" : iconCol}
          size={28}
          animated
          onPress={handleChangeBookmark}
          onLongPress={onOpenBookmarksList}
        />
        <IconButton
          icon={showSettings ? "message-cog" : "message-cog-outline"}
          iconColor={iconCol}
          size={28}
          animated
          onPress={toggleSettings}
        />
      </View>
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
                onPress={() => {
                  onPressSearch();
                  setShowSettings(false);
                }}
              >
                <IconButton
                  icon="magnify"
                  animated
                  mode="outlined"
                  iconColor={theme === Themes.DARK ? "white" : iconCol}
                  size={26}
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
                onPress={() => {
                  onOpenBookmarksList();
                  setShowSettings(false);
                }}
              >
                <IconButton
                  icon="bookmark-multiple-outline"
                  animated
                  mode="outlined"
                  iconColor={theme === Themes.DARK ? "white" : iconCol}
                  size={26}
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
                onPress={() => {
                  onOpenTocList();
                  setShowSettings(false);
                }}
              >
                <IconButton
                  icon="format-list-bulleted-square"
                  iconColor={theme === Themes.DARK ? "white" : iconCol}
                  size={26}
                  mode="outlined"
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
                    padding: 5,
                  },
                ]}
                onPress={() => changeThemes(Themes.LIGHT)}
              >
                <View
                  style={{
                    width: 45,
                    height: 45,
                    borderRadius: 22.5,
                    backgroundColor: "white",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 24, color: "black" }}>A</Text>
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
                    padding: 5,
                  },
                ]}
                onPress={() => changeThemes(Themes.DARK)}
              >
                <View
                  style={{
                    width: 45,
                    height: 45,
                    borderRadius: 22.5,
                    backgroundColor: "black",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 24, color: "white" }}>A</Text>
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
                    padding: 5,
                  },
                ]}
                onPress={() => changeThemes(Themes.SEPIA)}
              >
                <View
                  style={{
                    width: 45,
                    height: 45,
                    borderRadius: 22.5,
                    backgroundColor: "#e8dcb8",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 24, color: "black" }}>A</Text>
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
                onPress={switchFontFamily}
              >
                <IconButton
                  icon="format-font"
                  iconColor={theme === Themes.DARK ? "white" : iconCol}
                  size={26}
                  mode="outlined"
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
                onPress={increaseFontSize}
                disabled={currentFontSize === MAX_FONT_SIZE}
              >
                <IconButton
                  icon="format-font-size-increase"
                  iconColor={theme === Themes.DARK ? "white" : iconCol}
                  size={26}
                  animated
                  mode="outlined"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.circle,
                  {
                    backgroundColor: theme.body.background,
                  },
                ]}
                onPress={decreaseFontSize}
                disabled={currentFontSize === MIN_FONT_SIZE}
              >
                <IconButton
                  icon="format-font-size-decrease"
                  iconColor={theme === Themes.DARK ? "white" : iconCol}
                  size={26}
                  mode="outlined"
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      )}
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
  },
  circle: {
    borderRadius: 15,
    margin: 5,
    alignItems: "center",
    alignSelf: "flex-end",
    flexDirection: "row",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.25,
    elevation: 5,
  },
});
