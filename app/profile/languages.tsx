import { View, Text, TouchableOpacity, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { setLanguage, getLanguage } from "../../assets/languages/i18n";
import i18n from '@/assets/languages/i18n'
import * as Updates from "expo-updates";

const Languages = () => {
  const router = useRouter();
  const [currentLanguage, setCurrentLanguage] = useState<string>("en");

  useEffect(() => {
    const fetchLanguage = async () => {
      const language = await getLanguage();
      setCurrentLanguage(language);
    };

    fetchLanguage();
  }, []);

  const handleLanguageChange = async (language: string) => {
    Alert.alert(
      "Confirm Language Change",
      "Are you sure you want to change the language?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            await setLanguage(language);
            Updates.reloadAsync();
            router.replace("/");
          },
        },
      ]
    );
  };

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
          <View style={{ padding: 20, backgroundColor: "#FAF9F6", borderRadius: 20, flex: 1 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>
          {i18n.t("selectLanguage")}
        </Text>
        <View
          style={{
            borderWidth: 1,
            borderRadius: 10,
            borderColor: "#ccc",
            backgroundColor: "#fff",
          }}
        >
          <TouchableOpacity
            style={{
              padding: 10,
              backgroundColor: currentLanguage === "en" ? "#DCDCDC" : "#fff",
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
            }}
            onPress={() => handleLanguageChange("en")}
          >
            <Text style={{ fontSize: 18 }}>English</Text>
          </TouchableOpacity>
          <View style={{ height: 1, backgroundColor: "#ccc" }} />
          <TouchableOpacity
            style={{
              padding: 10,
              backgroundColor: currentLanguage === "ar" ? "#ddd" : "#fff",
            }}
            onPress={() => handleLanguageChange("ar")}
          >
            <Text style={{ fontSize: 18 }}>العربیە</Text>
          </TouchableOpacity>
          <View style={{ height: 1, backgroundColor: "#ccc" }} />
          <TouchableOpacity
            style={{
              padding: 10,
              backgroundColor: currentLanguage === "ku" ? "#ddd" : "#fff",
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
            }}
            onPress={() => handleLanguageChange("ku")}
          >
            <Text style={{ fontSize: 18 }}>کوردی</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Languages;
