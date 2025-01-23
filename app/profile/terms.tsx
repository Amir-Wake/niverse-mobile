import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const Terms = () => {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableOpacity
        style={{ flexDirection: "row", alignItems: "center" }}
        onPress={() => router.back()}
      >
        <Ionicons
          name="chevron-back-outline"
          size={35}
          style={{ padding: 10 }}
        />
        <Text style={{ fontSize: 20 }}>Profile</Text>
      </TouchableOpacity>
      <ScrollView style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>
          Terms and Conditions
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>
          Welcome to our app. These terms and conditions outline the rules and regulations for the use of our app.
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>
          <Text style={{ fontWeight: "bold" }}>Acceptance of Terms:</Text> By accessing and using our app, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>
          <Text style={{ fontWeight: "bold" }}>Changes to Terms:</Text> We reserve the right to modify these terms at any time. You should check this page periodically for changes. By using this app after we post any changes, you agree to accept those changes, whether or not you have reviewed them.
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>
          <Text style={{ fontWeight: "bold" }}>User Responsibilities:</Text> You are responsible for your use of the app and for any consequences thereof. You agree to use the app in compliance with all applicable local, state, national, and international laws, rules, and regulations.
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>
          <Text style={{ fontWeight: "bold" }}>Termination:</Text> We may terminate or suspend access to our app immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the terms.
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>
          <Text style={{ fontWeight: "bold" }}>Governing Law:</Text> These terms shall be governed and construed in accordance with the laws of our country, without regard to its conflict of law provisions.
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 50 }}>
          <Text style={{ fontWeight: "bold" }}>Contact Us:</Text> If you have any questions about these Terms, please contact us.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Terms;
