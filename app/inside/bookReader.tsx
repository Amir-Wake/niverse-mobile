import { View } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import FullReader from "@/app/components/epubReader/fullReader";

export default function BookReader() {
  const { fileUrl } = useLocalSearchParams();
  const { bookId } = useLocalSearchParams();
  const src = Array.isArray(fileUrl) ? fileUrl[0] : fileUrl;
  const id = Array.isArray(bookId) ? bookId[0] : bookId;
  return (
    <View style={{ flex: 1 }}>
      <FullReader src={src} bookId={id} />
    </View>
  );
}
