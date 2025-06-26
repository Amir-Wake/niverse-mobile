/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { forwardRef, useEffect, useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { IconButton, MD3Colors, Text, Switch } from "react-native-paper";
import { contrast } from "../fullReader/utils";
import { Theme, Themes, useReader } from "@epubjs-react-native/core";
import { dark, light, sepia, calm } from "../fullReader/themes";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import i18n from "@/assets/languages/i18n";

const isIpad = Device.deviceType === Device.DeviceType.TABLET;
const { width } = Dimensions.get("window");

interface Props {
  onClose: () => void;
  onOpenAnnotationsList?: () => void;
  increaseFontSize?: () => void;
  decreaseFontSize?: () => void;
  onOpenBookmarksList?: () => void;
  onOpenTocList?: () => void;
  onPressSearch?: () => void;
}
export type Ref = BottomSheetModalMethods;

const Settings = forwardRef<Ref, Props>(({
  onClose,
  onOpenAnnotationsList,
  increaseFontSize,
  decreaseFontSize,
  onOpenBookmarksList,
  onOpenTocList,
  onPressSearch,
}, ref) => {
  const { theme, changeTheme, injectJavascript } = useReader();
  const snapPoints = React.useMemo(() => ["40%"], []);
  const [iconCol, setIconCol] = useState(MD3Colors.neutral60);
  const [isBold, setIsBold] = useState(false);
  const [isJustify, setIsJustify] = useState(false);

  useEffect(() => {
    setIconCol(theme.body.background === "#333" ? "white" : "black");
  }, [theme.body.background]);

  const changeThemes = (theme: Theme) => {
    changeTheme(theme);
    AsyncStorage.setItem("currentTheme", JSON.stringify(theme));
  };

  const buttonStyles = {
    borderRadius: 10,
    backgroundColor: theme.body.background,
    padding: 5,
  };
  const buttonSize = isIpad ? 55 : 35;
  const themeSize = isIpad ? 80 : 50;

  const toggleBold = () => {
    injectJavascript(
      isBold
        ? `
        rendition.getContents().forEach(contents => {
          const styleTag = contents.document.querySelector('style#customStyles');
          if (styleTag) styleTag.remove();
        });
      `
        : `
        rendition.getContents().forEach(contents => {
          const styleTag = contents.document.querySelector('style#customStyles') || contents.document.createElement('style');
          styleTag.id = 'customStyles';
          styleTag.innerHTML = 'p { font-weight: bold !important };';
          contents.document.head.appendChild(styleTag);
        });
      `
    );
    setIsBold(!isBold);
  };

  const toggleJustify = () => {
    injectJavascript(
      isJustify
        ? `
        rendition.getContents().forEach(contents => {
          const styleTag = contents.document.querySelector('style#justifyStyle');
          if (styleTag) styleTag.remove();
        });
      `
        : `
        rendition.getContents().forEach(contents => {
          const styleTag = contents.document.querySelector('style#justifyStyle') || contents.document.createElement('style');
          styleTag.id = 'justifyStyle';
          styleTag.innerHTML = 'p { text-align: justify !important };';
          contents.document.head.appendChild(styleTag);
        });
      `
    );
    setIsJustify(!isJustify);
  };

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={ref}
        index={1}
        enablePanDownToClose
        android_keyboardInputMode="adjustResize"
        enableDismissOnClose
        onChange={(index) => {
          if (index === 0) onClose();
        }}
        handleIndicatorStyle={{
          backgroundColor: contrast[theme.body.background],
        }}
        backgroundStyle={{ backgroundColor: theme.body.background }}
        snapPoints={snapPoints}
        handleStyle={{ backgroundColor: theme.body.background }}
        style={{
          ...styles.contentContainer,
          backgroundColor: theme.body.background,
          borderColor: contrast[theme.body.background],
          borderWidth: 1,
          borderRadius: 10,
        }}
      >
        <View style={styles.header}>
          <Text
            variant="titleMedium"
            style={{
              color: contrast[theme.body.background],
              padding: 5,
              fontFamily: "helvetica",
              textAlign: "center",
              fontSize: isIpad ? 30 : 20,
              flex: 1,
            }}
          >
            {i18n.t("themeSetting")}
          </Text>
          <IconButton
            icon="close"
            size={isIpad ? 28 : 18}
            mode="contained-tonal"
            iconColor={contrast[theme.body.background]}
            style={{
              backgroundColor: "rgba(151, 151, 151, 0.25)",
              borderRadius: 20,
              padding: 0,
              margin: 0,
            }}
            onPress={onClose}
          />
        </View>
        <BottomSheetScrollView
          indicatorStyle={"black"}
          style={styles.contentContainer}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-evenly", alignItems: "center" }}>
            <View style={{ flexDirection: "row" }}>
              <IconButton
                icon="format-font-size-increase"
                iconColor={theme === Themes.DARK ? "white" : iconCol}
                size={buttonSize}
                animated
                mode="outlined"
                style={[buttonStyles, { width: width / 7 }]}
                onPress={increaseFontSize}
              />
              <IconButton
                icon="format-font-size-decrease"
                iconColor={theme === Themes.DARK ? "white" : iconCol}
                size={buttonSize}
                mode="outlined"
                style={[buttonStyles, { width: width / 7 }]}
                onPress={decreaseFontSize}
              />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text style={{ color: contrast[theme.body.background], fontSize: isIpad ? 26 : 16, marginRight: 5 }}>Bold</Text>
                <Switch
                  value={isBold}
                  onValueChange={toggleBold}
                  color="green"
                  style={{ width: width / 7 }}
                />
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 10 }}>
                <Text style={{ color: contrast[theme.body.background], fontSize: isIpad ? 26 : 16, marginRight: 5 }}>Justify</Text>
                <Switch
                  value={isJustify}
                  onValueChange={toggleJustify}
                  color="green"
                  style={{ width: width / 7 }}
                />
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-around", marginVertical: 5 }}>
            <IconButton
              icon="format-color-text"
              iconColor={"white"}
              size={themeSize}
              mode="outlined"
              style={{ ...buttonStyles, backgroundColor: "black", width: width / 5 }}
              onPress={() => changeThemes(dark)}
            />
            <IconButton
              icon="format-color-text"
              iconColor="black"
              size={themeSize}
              mode="outlined"
              style={{ ...buttonStyles, backgroundColor: "white", width: width / 5 }}
              onPress={() => changeThemes(light)}
            />
            <IconButton
              icon="format-color-text"
              iconColor="#333333"
              size={themeSize}
              mode="outlined"
              style={{ ...buttonStyles, backgroundColor: "#f2f2f2", width: width / 5 }}
              onPress={() => changeThemes(calm)}
            />
            <IconButton
              icon="format-color-text"
              iconColor="black"
              size={themeSize}
              mode="outlined"
              style={{ ...buttonStyles, backgroundColor: "#e8dcb8", width: width / 5 }}
              onPress={() => changeThemes(sepia)}
            />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            <IconButton
              icon="bookmark-multiple-outline"
              animated
              mode="outlined"
              iconColor={theme === Themes.DARK ? "white" : iconCol}
              size={buttonSize}
              style={buttonStyles}
              onPress={() => {
                onClose();
                onOpenBookmarksList?.();
              }}
            />
            <IconButton
              icon="format-list-bulleted-square"
              iconColor={theme === Themes.DARK ? "white" : iconCol}
              size={buttonSize}
              mode="outlined"
              style={buttonStyles}
              onPress={() => {
                onClose();
                onOpenTocList?.();
              }}
            />
            <IconButton
              icon="marker"
              iconColor={theme === Themes.DARK ? "white" : iconCol}
              size={buttonSize}
              mode="outlined"
              style={buttonStyles}
              onPress={() => {
                onClose();
                onOpenAnnotationsList?.();
              }}
            />
            <IconButton
              icon="magnify"
              animated
              mode="outlined"
              iconColor={theme === Themes.DARK ? "white" : iconCol}
              size={buttonSize}
              style={buttonStyles}
              onPress={() => {
                onClose();
                onPressSearch?.();
              }}
            />
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: 10,
    justifyContent: "center",
  },
  contentContainer: {
    padding: 10,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "gray",
    padding: 5,
  },
});

export default Settings;
