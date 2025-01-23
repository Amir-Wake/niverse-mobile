import { Stack } from "expo-router";
import React from "react";

export default function ListLayout() {
  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen name="collectionLists" />
      <Stack.Screen name="wantToRead" />
      <Stack.Screen name="downloaded"/>
    </Stack>
  );
}

