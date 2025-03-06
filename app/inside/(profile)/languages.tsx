import { View, Text, TouchableOpacity, Alert, Dimensions, Platform } from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation } from "expo-router";
import { setLanguage, getLanguage } from "@/assets/languages/i18n";
import i18n from "@/assets/languages/i18n";
import * as Updates from "expo-updates";

const isIpad = Platform.OS === "ios" && Platform.isPad;
const {width} = Dimensions.get("window");
const Languages = () => {
  const [currentLanguage, setCurrentLanguage] = useState<string>("en");
  const navigation = useNavigation();

  useEffect(() => {
    navigation.getParent()!.setOptions({
      headerTitle: i18n.t('language'),
  });
}, []);

  useEffect(() => {
    const fetchLanguage = async () => {
      const language = await getLanguage();
      setCurrentLanguage(language);
    };

    fetchLanguage();
  }, []);

  const handleLanguageChange = async (language: string) => {
    Alert.alert(i18n.t("confirm"), i18n.t("languageChangeText"), [
      {
        text: i18n.t("cancel"),
        style: "cancel",
      },
      {
        text: i18n.t("ok"),
        onPress: async () => {
          await setLanguage(language);
          Updates.reloadAsync();
        },
      },
    ]);
  };
  const custumStyle = {
    fontSize: isIpad?22:18,
    margin: 5,
    textAlign: i18n.locale=="ku" ? ("right" as "right") : ("left" as "left"),
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View
        style={{
          padding: width*0.05,
          backgroundColor: "#FAF9F6",
          borderRadius: 20,
          flex: 1,
        }}
      >
        <Text
          style={{
            fontSize: isIpad?28:24,
            fontWeight: "bold",
            marginBottom: 10,
            textAlign: "center",
          }}
        >
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
              padding: 5,
              backgroundColor: currentLanguage === "en" ? "#DCDCDC" : "#fff",
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
            }}
            onPress={() => handleLanguageChange("en")}
          >
            <Text style={custumStyle}>English</Text>
          </TouchableOpacity>
          <View style={{ height: 1, backgroundColor: "#ccc" }} />
          {/* <TouchableOpacity
            style={{
              padding: 10,
              backgroundColor: currentLanguage === "ar" ? "#ddd" : "#fff",
            }}
            onPress={() => handleLanguageChange("ar")}
          >
            <Text style={custumStyle}>العربیە</Text>
          </TouchableOpacity> */}
          <View style={{ height: 1, backgroundColor: "#ccc" }} />
          <TouchableOpacity
            style={{
              padding: 5,
              backgroundColor: currentLanguage === "ku" ? "#ddd" : "#fff",
              borderBottomLeftRadius: 10,
              borderBottomRightRadius: 10,
            }}
            onPress={() => handleLanguageChange("ku")}
          >
            <Text style={custumStyle}>کوردی</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Languages;
