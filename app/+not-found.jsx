import { View, Text, Button } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

export default function NotFound() {
  const router = useRouter();
  return (
    <View style={{flex:1,justifyContent:"center", alignItems:"center",}}>
      <Text>the page is not founded</Text>
      <Button title="Go Home" onPress={() => router.back()} />
    </View>
  );
}
