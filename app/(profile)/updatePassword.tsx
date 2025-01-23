import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
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

export default function UpdatePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const router = useRouter();

  const handleSavePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (newPassword.trim().length < 6) {
      Alert.alert("Error", "Password should be at least 6 characters");
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
        Alert.alert("Password updated successfully");
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
        Alert.alert("The password is incorrect");
      } else if (
        error instanceof Error &&
        (error as any).code === "auth/invalid-credential"
      ) {
        Alert.alert("The password is incorrect");
      } else if (error instanceof Error) {
        console.error("Error updating password", error);
        Alert.alert("Error", error.message);
      }
    }
  };

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
      <View style={styles.container}>
        <View style={styles.section}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Current Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Current Password"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
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
            <Text style={styles.saveButtonText}>Save Password</Text>
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
    backgroundColor: "#fff",
    paddingTop: 50,
  },
  saveButton: {
    backgroundColor: "#E5E8E8",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  saveButtonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 10,
  },
  label: {
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
