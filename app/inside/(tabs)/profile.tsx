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
  Linking,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { auth } from "@/firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { Image } from "expo-image";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import i18n from "@/assets/languages/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const isIpad = Platform.OS === "ios" && Platform.isPad;

export default function Index() {
  const [profileImage, setProfileImage] = useState<{ uri: string } | null>(
    null
  );
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] =
    useState(false);
  const [ageRestrictionEnabled, setAgeRestrictionEnabled] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isRTL, setIsRTL] = useState(false);
  const router = useRouter();
  const firestore = getFirestore();
  let unsubscribeSnapshot: (() => void) | null = null;

  useEffect(() => {
    const language = i18n.locale;
    setIsRTL(language === "ku");
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userDoc = doc(firestore, "users", auth.currentUser!.uid);
        unsubscribeSnapshot = onSnapshot(userDoc, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfileImage(
              data.profileImageUrl ? { uri: data.profileImageUrl } : null
            );
            setName(data.name || "");
            setEmailNotificationsEnabled(
              data.emailNotificationsEnabled || false
            );
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
      router.replace("/(login)");
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  const toggleEmailNotifications = async () => {
    setEmailNotificationsEnabled((previousState) => !previousState);
    try {
      if (auth.currentUser?.uid) {
        const userDoc = doc(firestore, "users", auth.currentUser.uid);
        await updateDoc(userDoc, {
          emailNotificationsEnabled: !emailNotificationsEnabled,
        });
      }
    } catch (error) {
      console.error("Error updating email notifications", error);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!password) {
      alert(i18n.t("passwordRequired"));
      return;
    }

    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user!.email!, password);

    try {
      await reauthenticateWithCredential(user!, credential);
      const newValue = !ageRestrictionEnabled;
      setPasswordModalVisible(false);
      setAgeRestrictionEnabled(newValue);
      const userDoc = doc(firestore, "users", auth.currentUser!.uid);
      await updateDoc(userDoc, { ageRestrictionEnabled: newValue });
      setPassword("");
      AsyncStorage.setItem(
        "ageRestrictionEnabled" + auth.currentUser?.uid,
        newValue.toString()
      );
    } catch (error) {
      alert(i18n.t("passwordIncorrect"));
    }
  };

  const toggleAgeRestriction = () => {
    setPasswordModalVisible(true);
  };

  const renderOption = (
    icon: React.ReactNode,
    text: string,
    onPress: () => void,
    isSwitch = false,
    switchValue = false,
    onSwitchChange: ((value: boolean) => void) | null = null
  ) => (
    <TouchableOpacity
      style={styles.option}
      onPress={onPress}
      disabled={isSwitch}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {icon}
        <Text style={styles.optionText}>{text}</Text>
      </View>
      <View>
        {isSwitch && (
          <Switch
            style={styles.switch}
            value={switchValue}
            onValueChange={onSwitchChange}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={[styles.container, { direction: isRTL ? "rtl" : "ltr" }]}
    >
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={{ marginTop: 70 }} />
      <View style={styles.contentContainer}>
        <View style={styles.profileContainer}>
          <Image
            source={
              profileImage
                ? { uri: profileImage.uri }
                : require("@/assets/images/blank-profile.png")
            }
            style={styles.profileImage}
            cachePolicy={"memory-disk"}
          />
          <Text
            style={{
              fontSize: isIpad ? 22 : 16,
              marginTop: 10,
              fontWeight: "bold",
            }}
          >
            {name}
          </Text>
        </View>
        <View style={styles.section}>
          {renderOption(
            <AntDesign
              name="setting"
              size={24}
              color="black"
              style={styles.icon}
            />,
            i18n.t("accountDetails"),
            () => router.push("../updateProfile")
          )}
          <View style={styles.divider} />
          {renderOption(
            <AntDesign
              name="lock"
              size={24}
              color="black"
              style={styles.icon}
            />,
            i18n.t("updatePassword"),
            () => router.push("../updatePassword")
          )}
        </View>
        <View style={styles.section}>
          {renderOption(
            <Ionicons
              name="notifications-outline"
              size={24}
              color="black"
              style={styles.icon}
            />,
            i18n.t("emailNotifications"),
            () => {},
            true,
            emailNotificationsEnabled,
            toggleEmailNotifications
          )}
          <View style={styles.divider} />
          {renderOption(
            <Ionicons
              name="alert-circle-outline"
              size={24}
              color="black"
              style={styles.icon}
            />,
            i18n.t("ageRestriction"),
            () => {},
            true,
            ageRestrictionEnabled,
            toggleAgeRestriction
          )}
        </View>
        <View style={styles.section}>
          {renderOption(
            <Ionicons
              name="earth-outline"
              size={24}
              color="black"
              style={styles.icon}
            />,
            i18n.t("language"),
            () => router.push("../languages")
          )}
          <View style={styles.divider} />
          {renderOption(
            <Ionicons
              name="hand-left-outline"
              size={24}
              color="black"
              style={styles.icon}
            />,
            i18n.t("privacyPolicy"),
            () => router.push("../privacyPolicy")
          )}
          <View style={styles.divider} />
          {renderOption(
            <AntDesign
              name="filetext1"
              size={24}
              color="black"
              style={styles.icon}
            />,
            i18n.t("terms"),
            () => router.push("../terms")
          )}
          <View style={styles.divider} />
          {renderOption(
            <AntDesign
              name="customerservice"
              size={24}
              color="black"
              style={styles.icon}
            />,
            i18n.t("contact"),
            () =>
              Linking.openURL(
                "mailto:support@nverse.app?subject=Contact%20Support"
              )
          )}
        </View>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>{i18n.t("signOut")}</Text>
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
            <TouchableOpacity
              style={[styles.modalView, { width: width * 0.7 }]}
              activeOpacity={1}
            >
              <Text style={styles.modalText}>{i18n.t("enterPassword")}</Text>

              <TextInput
                style={styles.input}
                placeholder={"Password"}
                placeholderTextColor="#999"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={handlePasswordSubmit}
              >
                <Text style={styles.metallicButtonText}>
                  {i18n.t("change")}
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileContainer: {
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  profileImage: {
    width: isIpad ? 110 : 90,
    height: isIpad ? 110 : 90,
    borderRadius: 60,
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderColor: "#ccc",
    width: width * 0.9,
  },
  optionText: {
    fontSize: isIpad ? 24 : 18,
    marginHorizontal: 10,
  },
  icon: {
    marginRight: 10,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  switch: {},
  signOutButton: {
    backgroundColor: "#ff3b30",
    padding: 8,
    width: width * 0.5,
    alignSelf: "center",
    borderRadius: 10,
    alignItems: "center",
    fontFamily: "Arial",
    marginTop: 20,
    marginBottom: 20,
  },
  signOutButtonText: {
    color: "#fff",
    fontSize: isIpad ? 24 : 18,
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
    padding: 15,
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
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: isIpad ? 22 : 16,
  },
  input: {
    height: isIpad ? 70 : 50,
    fontSize: isIpad ? 22 : 16,
    borderColor: "#aaa",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: "100%",
    backgroundColor: "white",
    color: "#333",
    borderRadius: 5,
  },
  button: {
    backgroundColor: "green",
    padding: 10,
    width: "50%",
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
