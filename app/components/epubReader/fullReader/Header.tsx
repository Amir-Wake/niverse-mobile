import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Themes, useReader } from "@epubjs-react-native/core";
import { IconButton, MD3Colors } from "react-native-paper";
import { MAX_FONT_SIZE, MIN_FONT_SIZE, themes } from "./utils";
import { contrast } from "../fullReader/utils";

interface Props {
  currentFontSize: number;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  switchTheme: () => void;
  onPressSearch: () => void;
  switchFontFamily: () => void;
  onOpenBookmarksList: () => void;
  onOpenTocList: () => void;
}

export default function Header({
  currentFontSize,
  increaseFontSize,
  decreaseFontSize,
  switchTheme,
  onPressSearch,
  switchFontFamily,
  onOpenBookmarksList,
  onOpenTocList,
}: Props) {
  const navigation = useNavigation();
  const {
    theme,
    bookmarks,
    addBookmark,
    removeBookmark,
    getCurrentLocation,
    isBookmarked,
  } = useReader();

  const [showSettings, setShowSettings] = useState(false);
  const [iconCol, setIconCol] = useState(MD3Colors.neutral60);

  useEffect(() => {
    if (theme.body.background === "#fff") {
      setIconCol("black");
    }
    if (theme.body.background === "#e8dcb8") {
      setIconCol("black");
    }
    if (theme.body.background === "#333") {
      setIconCol("white");
    }
  }, [theme]);

  const handleChangeBookmark = () => {
    const location = getCurrentLocation();

    if (!location) return;

    if (isBookmarked) {
      const bookmark = bookmarks.find(
        (item) =>
          item.location.start.cfi === location?.start.cfi &&
          item.location.end.cfi === location?.end.cfi
      );

      if (!bookmark) return;
      removeBookmark(bookmark);
    } else addBookmark(location);
  };

  const toggleSettings = () => {
    setShowSettings((prev) => !prev);
  };

  return (
    <View style={styles.container}>
      <IconButton
        icon="arrow-left"
        iconColor={iconCol}
        size={28}
        onPress={() => {
          navigation.goBack();
        }}
      />

      <View style={styles.actions}>
        <IconButton
          icon={isBookmarked ? "bookmark" : "bookmark-outline"}
          iconColor={iconCol}
          size={28}
          animated
          onPress={() => {
            handleChangeBookmark();
          }}
          onLongPress={() => {
            onOpenBookmarksList();
          }}
        />

        <IconButton
          icon={showSettings ? "cog" : "cog-outline"}
          iconColor={iconCol}
          size={28}
          animated
          onPress={() => {
            toggleSettings();
          }}
        />
      </View>

      {showSettings && (
        <View
          style={styles.settingsContainer}
        >
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
              <Text
                style={[
                  styles.optionsText,
                  { color: contrast[theme.body.background] },
                ]}
              >
                Search
              </Text>
              <IconButton
                icon="magnify"
                animated
                mode="outlined"
                iconColor={theme === Themes.DARK ? "white" : iconCol}
                size={24}
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
              <Text
                style={[
                  styles.optionsText,
                  { color: contrast[theme.body.background] },
                ]}
              >
                Bookmarks
              </Text>
              <IconButton
                icon="bookmark-multiple-outline"
                animated
                mode="outlined"
                iconColor={theme === Themes.DARK ? "white" : iconCol}
                size={22}
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
            <Text
              style={[
                styles.optionsText,
                { color: contrast[theme.body.background] },
              ]}
            >
              Contents
            </Text>
            <IconButton
              icon="format-list-bulleted-square"
              iconColor={theme === Themes.DARK ? "white" : iconCol}
              size={22}
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
              onPress={() => {
                switchTheme();
              }}
            >
              <Text
                style={[
                  styles.optionsText,
                  { color: contrast[theme.body.background] },
                ]}
              >
                Theme
              </Text>
              <IconButton
                icon="theme-light-dark"
                iconColor={theme === Themes.DARK ? "white" : iconCol}
                size={22}
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
              onPress={() => {
                switchFontFamily();
              }}
            >
              <Text
                style={[
                  styles.optionsText,
                  { color: contrast[theme.body.background] },
                ]}
              >
                Font
              </Text>
              <IconButton
                icon="format-font"
                iconColor={theme === Themes.DARK ? "white" : iconCol}
                size={22}
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
              onPress={() => {
                increaseFontSize();
              }}
              disabled={currentFontSize === MAX_FONT_SIZE}
            >
              <Text
                style={[
                  styles.optionsText,
                  { color: contrast[theme.body.background] },
                ]}
              >
                Increase
              </Text>
              <IconButton
                icon="format-font-size-increase"
                iconColor={theme === Themes.DARK ? "white" : iconCol}
                size={22}
                animated={true}
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
              onPress={() => {
                decreaseFontSize();
              }}
              disabled={currentFontSize === MIN_FONT_SIZE}
            >
              <Text
                style={[
                  styles.optionsText,
                  { color: contrast[theme.body.background] },
                ]}
              >
                Decrease
              </Text>
              <IconButton
                icon="format-font-size-decrease"
                iconColor={theme === Themes.DARK ? "white" : iconCol}
                size={22}
                mode="outlined"
              />
            </TouchableOpacity>
          </View>
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

  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  settingsContainer: {
    position: "absolute",
    top: 60,
    right: 0,
    zIndex: 10,
  },
  circle: {
    borderWidth: 1,
    borderRadius: 15,
    margin: 5,
    paddingStart: 5,
    alignItems: "center",
    alignSelf: "flex-end",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.25,
    elevation: 5,
  },
  optionsText: {
    fontSize: 16,
  },
});
