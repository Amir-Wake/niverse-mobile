import { ScrollView, View, Text, StyleSheet, Dimensions, Platform } from "react-native";
import React from "react";
import i18n from "@/assets/languages/i18n";

const {width} = Dimensions.get("window");
const isIpad = Platform.OS === "ios" && Platform.isPad;
const PrivacyPolicy = () => {
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView style={styles.scrollView}>
        <Text
          style={[
            styles.bodyText,
            { textAlign: i18n.locale == "ku" ? "right" : "left" },
          ]}
        >
          {i18n.t("privacyPolicyText1")}
        </Text>
        {Array.from({ length: 6 }, (_, i) => (
          <View key={i}>
            <Text
              style={[
                styles.boldText,
                { textAlign: i18n.locale == "ku" ? "right" : "left" },
              ]}
            >
              {i18n.t(`privacyPolicyText${i + 2}`).split(":")[0]}:
            </Text>
            <Text
              style={[
                styles.bodyText,
                { textAlign: i18n.locale == "ku" ? "right" : "left" },
              ]}
            >
              {i18n.t(`privacyPolicyText${i + 2}`).split(":")[1]}
            </Text>
          </View>
        ))}
        <Text
          style={[
            styles.bodyText,
            { textAlign: i18n.locale == "ku" ? "right" : "left" },
          ]}
        >
          {i18n.t("privacyPolicyText8")}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    padding: width*0.05,
    backgroundColor: "#FAF9F6",
    borderRadius: 20,
    marginBottom: 20,
  },
  bodyText: {
    fontSize: isIpad?24:18,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  boldText: {
    fontSize: isIpad?24:18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});

export default PrivacyPolicy;
