import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { auth } from "@/firebase";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail
} from "firebase/auth";
import { useNavigation } from "expo-router";
import i18n from "@/assets/languages/i18n";

const {width} = Dimensions.get("window");
export default function UpdatePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    navigation.getParent()!.setOptions({
      headerTitle: i18n.t('updatePassword'),
    });
  }, []);

  const handleSavePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert(i18n.t('error'), i18n.t('passwordMismatch'));
      return;
    }
    if (newPassword.trim().length < 6) {
      Alert.alert(i18n.t('error'), i18n.t('passwordLength'));
      return;
    }
    try {
      const user = auth.currentUser;
      if (user && user.email) {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        Alert.alert(i18n.t('success'), i18n.t('passwordChanged'));
        setNewPassword("");
        setConfirmPassword("");
        setCurrentPassword("");
      } else {
        Alert.alert(i18n.t('error'), i18n.t('userNotAuthenticated'));
      }
    } catch (error) {
      if (error instanceof Error) {
        if ((error as any).code === "auth/wrong-password" || (error as any).code === "auth/invalid-credential") {
          Alert.alert(i18n.t('error'), i18n.t('passwordIncorrect'));
        } else {
          console.error("Error updating password", error);
          Alert.alert(i18n.t('error'), error.message);
        }
      }
    }
  };

  const handleResetPassword = () => {
    Alert.alert(
      i18n.t('confirm'),
      i18n.t('resetPasswordConfirmation'),
      [
      {
        text: i18n.t('cancel'),
        style: 'cancel',
      },
      {
        text: i18n.t('ok'),
        onPress: () => {
        if (auth.currentUser && auth.currentUser.email) {
          sendPasswordResetEmail(auth, auth.currentUser.email)
          .then(() => {
            Alert.alert(i18n.t("success"), i18n.t("resetPasswordText"));
          })
          .catch((error) => {
            const errorMessages = {
            "auth/user-not-found": i18n.t("userNotFound"),
            "auth/invalid-email": i18n.t("invalidEmail"),
            };
            const errorCode = (error as { code: keyof typeof errorMessages }).code;
            Alert.alert(i18n.t('error'), errorMessages[errorCode] || error.message);
          });
        } else {
          Alert.alert(i18n.t('error'), i18n.t('userNotAuthenticated'));
        }
        },
      },
      ],
      { cancelable: false }
    );
  };

  return (
      <ScrollView style={[styles.container,{direction:i18n.locale=="ku"?"rtl":"ltr"}]}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center",padding: 10 }}>
        <View style={styles.section}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label,{textAlign:i18n.locale=="ku"?'right':'left'}]}>{i18n.t("currentPassword")}</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={[styles.label,{textAlign:i18n.locale=="ku"?'right':'left'}]}>{i18n.t("newPass")}</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={[styles.label,{textAlign:i18n.locale=="ku"?'right':'left'}]}>{i18n.t("confirmPassword")}</Text>
            <TextInput
              style={styles.input}
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
          <TouchableOpacity
          style={{ alignItems: "center", padding: 10 }}
          onPress={handleResetPassword}
           >
          <Text style={{ fontSize: width>720?22:18, color: "#0066CC" }}>
            {i18n.t("forgotPassword")}
          </Text>
          </TouchableOpacity>
        </View>
        </View>

      </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: "#FAF9F6",
    borderRadius: 20,
  },
  saveButton: {
    backgroundColor: "#24a0ed",
    padding: 12,
    width: width*0.5,
    alignSelf: "center",
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: width>720?22:18,
    fontWeight: "bold",
    fontFamily: "arial",
  },
  section: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 10,
    width: width*0.9,
  },
  label: {
    fontSize: width>720?22:18,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
  },
});
