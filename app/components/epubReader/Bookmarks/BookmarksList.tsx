/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { forwardRef, useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, I18nManager } from "react-native";
import { Bookmark, useReader } from "@epubjs-react-native/core";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { Button, IconButton, MD3Colors, Text } from "react-native-paper";
import { contrast } from "../fullReader/utils";
import i18n from "@/assets/languages/i18n";
import * as Device from 'expo-device';

const isIpad = Device.deviceType === Device.DeviceType.TABLET;

interface Props {
  onClose: () => void;
}
export type Ref = BottomSheetModalMethods;

const BookmarksList = forwardRef<Ref, Props>(({ onClose }, ref) => {
  const {
    bookmarks,
    removeBookmark,
    removeBookmarks,
    isBookmarked,
    updateBookmark,
    goToLocation,
    currentLocation,
    theme,
  } = useReader();

  const snapPoints = React.useMemo(() => [ "95%"], []);
  const [note, setNote] = useState("");
  const [currentBookmark, setCurrentBookmark] = useState<Bookmark | null>(null);

  const isKurdishArabicScript = (text: string) => {
    const kurdishArabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u06A9\u06C5\u06D5\u06D2\u06D3]/;
    setNote(kurdishArabicRegex.test(text)==true? 'rtl'+text:'ltr'+text)
    return kurdishArabicRegex.test(text);
  };
  

  useEffect(() => {
    if (isBookmarked) {
      const bookmark = bookmarks.find(
        (item) =>
          item.location?.start.cfi === currentLocation?.start.cfi &&
          item.location?.end.cfi === currentLocation?.end.cfi
      );

      if (!bookmark) return;
      
      setCurrentBookmark(bookmark);
      setNote(bookmark.data?.note || "");
    }
  }, [
    bookmarks,
    currentLocation?.end.cfi,
    currentLocation?.start.cfi,
    isBookmarked,
  ]);

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={ref}
        index={1}
        enablePanDownToClose
        android_keyboardInputMode="adjustResize"
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
            <IconButton
              icon="close"
              size={isIpad?28:18}
              mode="contained-tonal"
              iconColor={contrast[theme.body.background]}
              style={{
                backgroundColor: "rgba(151, 151, 151, 0.25)",
                borderRadius: 20,
                padding: 0,
                margin: 0,
              }}
              onPress={()=>onClose()}
            />
          <Text
            variant="titleMedium"
            style={{
              color: contrast[theme.body.background],
              padding: 10,
              fontFamily: "helvetica",
              fontSize: isIpad ? 24 : 18,
            }}
          >
            {i18n.t("bookmarks")}
          </Text>
        </View>
        <BottomSheetScrollView
          indicatorStyle={"black"}
          style={styles.contentContainer}
        >
          {/* {bookmarks.length > 0 && (
            <Button
              mode="text"
              onPress={() => {
                removeBookmarks();
                onClose();
              }}
              textColor={contrast[theme.body.background]}
            >
              Clear All
            </Button>
          )} */}

          {bookmarks.length === 0 && (
            <View style={styles.title}>
              <Text
                variant="bodyMedium"
                style={{
                  fontStyle: "italic",
                  color: contrast[theme.body.background],
                  textAlign: "center",
                  fontSize: isIpad ? 24 : 18,
                  padding: 10,
                }}
              >
                {i18n.t("noBookmarks")}
              </Text>
            </View>
          )}

          {isBookmarked && (
            <View style={{ width: "100%" }}>
              <Text variant="titleMedium" style={{textAlign:"center", fontSize:18, color: contrast[theme.body.background], padding: 5}}>{i18n.t("annotation")}</Text>
              <BottomSheetTextInput
              defaultValue={note.replace(/^rtl|^ltr/, '')}
              style={[styles.input, { textAlign: note.startsWith('rtl') ? 'right' : 'left' }]}
              multiline
              onChangeText={(text) => { isKurdishArabicScript(text) }}
              />

              <Button
              mode="text"
              style={{ alignSelf: "flex-end" }}
              onPress={() => updateBookmark(currentBookmark!.id, { note })}
              textColor={contrast[theme.body.background]}
              >
              {i18n.t("updateAnnotation")}
              </Button>
            </View>
          )}

          {bookmarks.map((bookmark) => (
            <View
              key={bookmark.id}
              style={[
                styles.bookmarkContainer,
                { direction: I18nManager.isRTL ? "rtl" : "ltr" },
              ]}
            >
              <TouchableOpacity
                style={styles.bookmarkInfo}
                onPress={() => {
                  goToLocation(bookmark.location.start.cfi);
                  onClose();
                }}
              >
                <View style={styles.bookmarkIcon}>
                  <IconButton
                    icon="bookmark"
                    size={20}
                    iconColor={MD3Colors.neutral50}
                  />

                  <Text
                    style={{
                      ...styles.bookmarkLocationNumber,
                      color: contrast[theme.body.background],
                    }}
                    variant="labelSmall"
                  >
                    {bookmark.location.start.location}
                  </Text>
                </View>

                <View style={styles.bookmarkInfoText}>
                  <Text
                    numberOfLines={1}
                    style={{
                      marginBottom: 2,
                      color: contrast[theme.body.background],
                    }}
                  >
                    {bookmark.section?.label}
                  </Text>

                  <Text
                    numberOfLines={3}
                    style={{
                      fontStyle: "italic",
                      color: contrast[theme.body.background],
                    }}
                  >
                    &quot;{bookmark.text}&quot;
                  </Text>
                </View>
              </TouchableOpacity>

              <IconButton
                icon="trash-can-outline"
                size={20}
                iconColor={MD3Colors.error50}
                onPress={() => {
                  removeBookmark(bookmark);
                }}
              />
            </View>
          ))}
        </BottomSheetScrollView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
    padding: 10,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "gray",
    paddingBottom: 5,
  },
  bookmarkContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomColor: "rgba(0, 0, 0, 0.2)",
    borderBottomWidth: 1,
  },
  bookmarkInfo: {
    flexDirection: "row",
  },
  bookmarkInfoText: {
    width: "80%",
  },
  title: {
    marginTop: 20,
    width: "100%",
    alignItems: "center",
  },
  bookmarkIcon: {
    justifyContent: "center",
    alignItems: "center",
  },
  bookmarkLocationNumber: {
    marginTop: -12,
  },
  input: {
    width: "100%",
    height: 64,
    marginTop: 8,
    borderRadius: 10,
    fontSize: 16,
    lineHeight: 20,
    padding: 8,
    backgroundColor: "rgba(151, 151, 151, 0.25)",
  },
});

export default BookmarksList;
