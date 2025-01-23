import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const Faqs = () => {
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
          Frequently Asked Questions
        </Text>
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            Q: How do I reset my password?
          </Text>
          <Text style={{ fontSize: 16 }}>
            A: To reset your password, go to the login screen and click on "Forgot Password". Follow the instructions to reset your password.
          </Text>
        </View>
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            Q: How do I contact support?
          </Text>
          <Text style={{ fontSize: 16 }}>
            A: You can contact our support team via email at support@example.com or call us at +1 234 567 890.
          </Text>
        </View>
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            Q: Where can I find the user manual?
          </Text>
          <Text style={{ fontSize: 16 }}>
            A: The user manual can be found in the "Help" section of the app or on our website under "Resources".
          </Text>
        </View>
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            Q: How do I update my profile information?
          </Text>
          <Text style={{ fontSize: 16 }}>
            A: To update your profile information, go to the "Profile" section in the app and click on "Edit Profile".
          </Text>
        </View>
        <View style={{ marginBottom: 50 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>
            Q: How do I delete my account?
          </Text>
          <Text style={{ fontSize: 16 }}>
            A: To delete your account, please contact our support team and they will assist you with the process.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Faqs;
