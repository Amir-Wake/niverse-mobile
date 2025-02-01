import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  I18nManager,
} from "react-native";
import { auth } from "../../firebase";
import { Ionicons } from "@expo/vector-icons";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import i18n from "@/assets/languages/i18n";

export default function UpdatePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const router = useRouter();

  const handleSavePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert(i18n.t('error'), i18n.t('passwordMismatch'));
      return;
    }
    if (newPassword.trim().length < 6) {
      Alert.alert( i18n.t('error'), i18n.t('passwordLength'));
      return;
    }
    try {
      const user = auth.currentUser;
      if (user && user.email) {
        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword
        );
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        Alert.alert(i18n.t('success'), i18n.t('passwordChanged'));
        setNewPassword("");
        setConfirmPassword("");
        setCurrentPassword("");
      } else {
        Alert.alert("Error", "User is not authenticated");
      }
    } catch (error) {
      if (
        error instanceof Error &&
        (error as any).code === "auth/wrong-password"
      ) {
        Alert.alert(i18n.t('error'), i18n.t('passwordIncorrect'));
      } else if (
        error instanceof Error &&
        (error as any).code === "auth/invalid-credential"
      ) {
        Alert.alert(i18n.t('error'), i18n.t('passwordIncorrect'));
      } else if (error instanceof Error) {
        console.error("Error updating password", error);
        Alert.alert("Error", error.message);
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <TouchableOpacity
        style={{ flexDirection: "row", alignItems: "center", padding: 5 }}
        onPress={() => router.back()}
      >
        <Ionicons name="chevron-back-outline" size={30} color={"#0066CC"} />
        <Text style={{ fontSize: 18, color: "#0066CC" }}>Back</Text>
      </TouchableOpacity>
      <View style={I18nManager.isRTL?styles.containerRtl:styles.container}>
        <View style={styles.section}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{i18n.t("currentPassword")}</Text>
            <TextInput
              style={styles.input}
              placeholder="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{i18n.t("newPass")}</Text>
            <TextInput
              style={styles.input}
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{i18n.t("confirmPassword")}</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSavePassword}
          >
            <Text style={styles.saveButtonText}>{i18n.t("saveChanges")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#FAF9F6",
    borderRadius: 20,
  },
  containerRtl: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#FAF9F6",
    borderRadius: 20,
    direction: "rtl",
    textAlign: "right",
  },
  saveButton: {
    backgroundColor: "#24a0ed",
    padding: 12,
    width: '80%',
    alignSelf: "center",
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "arial",
  },
  section: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 10,
  },
  label: {
    textAlign: I18nManager.isRTL ? "right" : "left",
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
  },
});
