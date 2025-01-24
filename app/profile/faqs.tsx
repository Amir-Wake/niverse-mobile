import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const Faqs = () => {
  const router = useRouter();
  const [expanded, setExpanded] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpanded(expanded === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I reset my password?",
      answer: "To reset your password, go to the login screen and click on 'Forgot Password'. Follow the instructions to reset your password."
    },
    {
      question: "How do I contact support?",
      answer: "You can contact our support team via email at support@example.com or call us at +1 234 567 890."
    },
    {
      question: "Where can I find the user manual?",
      answer: "The user manual can be found in the 'Help' section of the app or on our website under 'Resources'."
    },
    {
      question: "How do I update my profile information?",
      answer: "To update your profile information, go to the 'Profile' section in the app and click on 'Edit Profile'."
    },
    {
      question: "How do I delete my account?",
      answer: "To delete your account, go to the 'Profile' section in the app and click on 'Privacy Policy'. Scroll down to the bottom of the page and click on 'Delete Account'."
    }
  ];

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
        <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
          Frequently Asked Questions
        </Text>
        {faqs.map((faq, index) => (
          <View key={index} style={{ marginBottom: 20, padding:5 }}>
            <TouchableOpacity onPress={() => toggleExpand(index)}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#0066CC" }}>
                Q: {faq.question}
              </Text>
            </TouchableOpacity>
            {expanded === index && (
              <Text style={{ fontSize: 16,padding: 10 }}>
                A: {faq.answer}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Faqs;
