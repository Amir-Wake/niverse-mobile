import { Stack } from "expo-router";
import React from "react";

export default function LoginLayout() {
  return (
    <Stack >
      <Stack.Screen name="main" 
      options={{
        title:"Login",
         headerShown:false
         }}/>
      <Stack.Screen name="restPassword" options={{title:""}}/>
      <Stack.Screen name="verification" options={{title:""}}/>
    </Stack>
  );
}
