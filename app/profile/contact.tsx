import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const Contact = () => {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <TouchableOpacity
        style={{ flexDirection: "row", alignItems: "center", padding: 5 }}
        onPress={() => router.back()}
      >
        <Ionicons
          name="chevron-back-outline"
          size={30}
          color={"#0066CC"}
        />
        <Text style={{ fontSize: 18, color:'#0066CC' }}>Back</Text>
      </TouchableOpacity>
      <ScrollView style={{ padding: 20, backgroundColor: "#FAF9F6", borderRadius: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>
          Contact Support
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>
          If you have any questions or need assistance, please reach out to our support team.
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>
          <Text style={{ fontWeight: "bold" }}>Email:</Text> support@example.com
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>
          <Text style={{ fontWeight: "bold" }}>Phone:</Text> +1 234 567 890
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>
          <Text style={{ fontWeight: "bold" }}>Address:</Text> 123 Support St, Help City, HC 12345
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 50 }}>
          Our support team is available 24/7 to assist you with any issues or questions you may have.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Contact;
