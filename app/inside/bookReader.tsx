import { View } from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import FullReader from "@/app/components/epubReader/fullReader";

export default function BookReader() {
  
  const { fileUrl } = useLocalSearchParams();
  const src = Array.isArray(fileUrl) ? fileUrl[0] : fileUrl;
  return (
    <View style={{ flex: 1 }}>
      <FullReader src={src} />
    </View>
  );
}
