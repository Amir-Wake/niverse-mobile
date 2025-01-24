import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Switch,
  Modal,
  TextInput,
  Button,
} from "react-native";
import { useRouter } from "expo-router";
import { auth } from "../../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { Image } from "expo-image";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

export default function Profile() {
  const [profileImage, setProfileImage] = useState(null);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);
  const [ageRestrictionEnabled, setAgeRestrictionEnabled] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [password, setPassword] = useState("");
  const router = useRouter();
  const firestore = getFirestore();
  let unsubscribeSnapshot = null;

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userDoc = doc(firestore, "users", auth.currentUser.uid);
        unsubscribeSnapshot = onSnapshot(userDoc, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfileImage(data.profileImageUrl ? { uri: data.profileImageUrl } : null);
            setEmailNotificationsEnabled(data.emailNotificationsEnabled || false);
            setAgeRestrictionEnabled(data.ageRestrictionEnabled || false);
          }
        });
      } else {
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
        }
      }
    });

    return () => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
      unsubscribeAuth();
    };
  }, []);

  const handleSignOut = async () => {
    if (unsubscribeSnapshot) {
      unsubscribeSnapshot();
    }
    try {
      await signOut(auth);
      router.push("/login/main");
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  const toggleEmailNotifications = async () => {
    setEmailNotificationsEnabled((previousState) => !previousState);
    const userDoc = doc(firestore, "users", auth.currentUser.uid);
    try {
      await updateDoc(userDoc, { emailNotificationsEnabled: !emailNotificationsEnabled });
    } catch (error) {
      console.error("Error updating email notifications", error);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!password) {
      alert("Password is required to change age restriction settings.");
      return;
    }

    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, password);

    try {
      await reauthenticateWithCredential(user, credential);
      const newValue = !ageRestrictionEnabled;
      setPasswordModalVisible(false);
      setAgeRestrictionEnabled(newValue);
      const userDoc = doc(firestore, "users", auth.currentUser.uid);
      await updateDoc(userDoc, { ageRestrictionEnabled: newValue });
      setPassword("");
    } catch (error) {
      alert("Please check your password and try again.");
    }
  };

  const toggleAgeRestriction = () => {
    setPasswordModalVisible(true);
  };

  const renderOption = (icon, text, onPress, isSwitch = false, switchValue = false, onSwitchChange = null) => (
    <TouchableOpacity style={styles.option} onPress={onPress} disabled={isSwitch}>
      {icon}
      <Text style={styles.optionText}>{text}</Text>
      {isSwitch && (
        <Switch
          style={styles.switch}
          value={switchValue}
          onValueChange={onSwitchChange}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ marginTop: 80 }} />
      <View style={styles.profileContainer}>
        <Image
          source={profileImage ? { uri: profileImage.uri } : require("../../assets/images/blank-profile.png")}
          style={styles.profileImage}
          cachePolicy={"memory-disk"}
        />
      </View>
      <View style={styles.section}>
        {renderOption(<AntDesign name="setting" size={24} color="black" style={styles.icon} />, "Account Details", () => router.push("/profile/updateProfile"))}
        <View style={styles.divider} />
        {renderOption(<AntDesign name="lock" size={24} color="black" style={styles.icon} />, "Update Password", () => router.push("/profile/updatePassword"))}
      </View>
      <View style={styles.section}>
        {renderOption(<Ionicons name="notifications-outline" size={24} color="black" style={styles.icon} />, "Email Notification", null, true, emailNotificationsEnabled, toggleEmailNotifications)}
        <View style={styles.divider} />
        {renderOption(<Ionicons name="alert-circle-outline" size={24} color="black" style={styles.icon} />, "Age Restriction", null, true, ageRestrictionEnabled, toggleAgeRestriction)}
      </View>
      <View style={styles.section}>
        {renderOption(<Ionicons name="earth-outline" size={24} color="black" style={styles.icon} />, "Language", () => router.push("/profile/languages"))}
        <View style={styles.divider} />
        {renderOption(<Ionicons name="hand-left-outline" size={24} color="black" style={styles.icon} />, "Privacy Policy", () => router.push("/profile/privacyPolicy"))}
        <View style={styles.divider} />
        {renderOption(<AntDesign name="filetext1" size={24} color="black" style={styles.icon} />, "Terms and Conditions", () => router.push("/profile/terms"))}
        <View style={styles.divider} />
        {renderOption(<AntDesign name="customerservice" size={24} color="black" style={styles.icon} />, "Contact Support", () => router.push("/profile/contact"))}
        <View style={styles.divider} />
        {renderOption(<AntDesign name="questioncircleo" size={24} color="black" style={styles.icon} />, "FAQs", () => router.push("/profile/faqs"))}
      </View>
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={passwordModalVisible}
        onRequestClose={() => {
          setPasswordModalVisible(!passwordModalVisible);
        }}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPressOut={() => setPasswordModalVisible(false)}
        >
          <TouchableOpacity style={[styles.modalView,{width:300}]} activeOpacity={1}>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.button} onPress={handlePasswordSubmit}>
              <Text style={styles.metallicButtonText}>Change</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  profileContainer: {
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 50,
  },
  section: {
    marginVertical: 10,
    backgroundColor: "#E5E8E8",
    borderRadius: 10,
    overflow: "hidden",
  },
  option: {
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderColor: "#ccc",
  },
  optionText: {
    fontSize: 18,
    marginLeft: 10,
    flex: 1,
  },
  icon: {
    marginRight: 10,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  switch: {
    marginLeft: 'auto',
  },
  signOutButton: {
    backgroundColor: "#ff3b30",
    padding: 12,
    width: 250,
    alignSelf: "center",
    borderRadius: 10,
    alignItems: "center",
    fontFamily: "Arial",
    marginTop: 20,
  },
  signOutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  modalView: {
    backgroundColor: "#d3d3d3",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#aaa",
  },
  input: {
    height: 50,
    borderColor: "#aaa",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 30,
    width: "100%",
    backgroundColor: "white",
    color: "#333",
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#b0b0b0",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#888",
  },
  metallicButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
