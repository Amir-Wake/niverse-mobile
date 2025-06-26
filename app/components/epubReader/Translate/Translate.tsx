/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { forwardRef, useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useReader } from "@epubjs-react-native/core";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { IconButton, Text } from "react-native-paper";
import { contrast } from "../fullReader/utils";
import i18n from "@/assets/languages/i18n";
import { GoogleGenAI } from "@google/genai";
import removeMarkdown from 'remove-markdown';
<<<<<<< HEAD
import * as Device from 'expo-device';

const isIpad = Device.deviceType === Device.DeviceType.TABLET;
=======
>>>>>>> 9f3204233907014723ae806bb7c153b0ecb15a73

interface Props {
  onClose: () => void;
  selectedText: string;
  selectedLanguage: string;
}
export type Ref = BottomSheetModalMethods;

const Translate = forwardRef<Ref, Props>(({ onClose, selectedText, selectedLanguage }, ref) => {
  const { theme } = useReader();
  const apiKEY = `${process.env.EXPO_PUBLIC_GEN_API_KEY}`;
  const [aiResponse, setAiResponse] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const ai = new GoogleGenAI({ apiKey: apiKEY });
  const snapPoints = React.useMemo(() => ["50","95%"], []);

  useEffect(() => {
    if (selectedLanguage == "ku") return;
    async function translateAi() {
      setIsLoading(true); 
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-lite",
        contents: "وەرگێڕ ئینگلیزی بۆ کوردی" + "'" + selectedText + "'",
      });
      const plainText = removeMarkdown(response.text || '');
      setAiResponse(plainText ?? null);
      setIsLoading(false); 
    }
    translateAi();
  }, [selectedText]);

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={ref}
        index={1}
        enablePanDownToClose
        android_keyboardInputMode="adjustResize"
        enableDismissOnClose
        onChange={(index) => {
          if (index === -1) onClose();
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
              padding: 10,
              fontFamily: "helvetica",
              textAlign: "center",
              fontSize: 24,
              flex: 1,
            }}
          >
            {i18n.t("translate")}
          </Text>
<<<<<<< HEAD
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
=======
          <TouchableOpacity onPress={onClose}>
            <IconButton
              icon="close"
              size={30}
              iconColor={contrast[theme.body.background]}
              style={{
                backgroundColor: "transparent",
                borderRadius: 10,
                position: "absolute",
                right: 0,
                top: 0,
              }}
            />
          </TouchableOpacity>
>>>>>>> 9f3204233907014723ae806bb7c153b0ecb15a73
        </View>
        <BottomSheetScrollView
          indicatorStyle={"black"}
          style={styles.contentContainer}
        >
          {selectedLanguage == "en" ? (
            <View style={{ padding: 20, backgroundColor: "#FAF9F6", borderRadius: 10 }}>
<<<<<<< HEAD
              <Text style={{ fontSize: 20, lineHeight: 30, textAlign: 'center', fontFamily: "helvetica" }}>
=======
              <Text style={{ fontSize: 20, lineHeight: 30, textAlign: 'center' }}>
>>>>>>> 9f3204233907014723ae806bb7c153b0ecb15a73
                {isLoading ? "Translating..." : aiResponse || "No translation available."}
              </Text>
            </View>
          ) : (
            <View style={{ padding: 20, backgroundColor: "#FAF9F6", borderRadius: 10 }}>
              <Text style={{ fontSize: 20, lineHeight: 30, textAlign: 'center' }}>
                This feature is currently only available for English books.
              </Text>
            </View>
          )}
          <Text style={{ fontSize: 13, textAlign: 'center', lineHeight: 30, color: contrast[theme.body.background], padding: 20, marginTop: 20 }}>
<<<<<<< HEAD
            This is a beta version of the translation tool using AI.
=======
            This is a beta version of the translation tool using AI. Please note that the translation may not be perfect.
>>>>>>> 9f3204233907014723ae806bb7c153b0ecb15a73
          </Text>
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
    borderBottomWidth: 1,
    borderBottomColor: "gray",
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

export default Translate;
