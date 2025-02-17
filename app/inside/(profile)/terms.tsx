import { ScrollView, View, Text, StyleSheet } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import i18n from "../../../assets/languages/i18n";

const Terms = () => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.headerText}>
          {i18n.t('terms')}
        </Text>
        <Text style={[styles.bodyText,{textAlign: i18n.locale=="ku"?"right":"left"}]}>
          {i18n.t('termsText1')}
        </Text>
        {Array.from({ length: 9 }, (_, i) => (
          <View key={i}>
            <Text style={[styles.boldText,{textAlign: i18n.locale=="ku"?"right":"left"}]}>{i18n.t(`termsText${i + 2}`).split(':')[0]}:</Text> 
            <Text style={[styles.bodyText,{textAlign: i18n.locale=="ku"?"right":"left"}]}>{i18n.t(`termsText${i + 2}`).split(':')[1]}</Text>
          </View>
        ))}
        <Text style={[styles.bodyText,{textAlign: i18n.locale=="ku"?"right":"left"}]}>
          {i18n.t('termsText11')}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollView: {
    padding: 10,
    backgroundColor: "#FAF9F6",
    borderRadius: 20,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  bodyText: {
    fontSize: 18,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  boldText: {
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});

export default Terms;
