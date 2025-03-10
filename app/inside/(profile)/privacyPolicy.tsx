import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation, useRouter } from "expo-router";
import { auth } from "@/firebase";
import {
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import i18n from "@/assets/languages/i18n";

const isIpad = Platform.OS === "ios" && Platform.isPad;
const { width } = Dimensions.get("window");
const PrivacyPolicy = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    navigation.getParent()!.setOptions({
      headerTitle: i18n.t("privacyPolicy"),
    });
  }, []);

  const handleDeleteAccount = () => {
    setModalVisible(true);
  };

  const confirmDeleteAccount = async () => {
    if (!password) {
      Alert.alert(i18n.t("error"), i18n.t("passwordIncorrect"));
      return;
    }

    try {
      const user = auth.currentUser;
      if (user && user.email) {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
        await deleteUser(user);
        router.replace("/(login)");
      } else {
        console.error("User email is null or no authenticated user found.");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      Alert.alert(i18n.t("error"), i18n.t("passwordIncorrect"));
    } finally {
      setModalVisible(false);
    }
  };

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
        {auth.currentUser && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
          >
            <Text style={styles.deleteButtonText}>
              {i18n.t("deleteAccount")}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <TouchableOpacity style={styles.modalView} activeOpacity={1}>
            <Text style={styles.modalText}>{i18n.t("enterPassword")}</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.buttonDelete]}
                onPress={confirmDeleteAccount}
              >
                <Text style={styles.textStyle}>{i18n.t("confirm")}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    justifyContent: "center",
    width: "80%",
  },
  scrollView: {
    padding: width * 0.05,
    backgroundColor: "#FAF9F6",
    borderRadius: 20,
    marginBottom: 20,
  },
  bodyText: {
    fontSize: isIpad ? 24 : 18,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  boldText: {
    fontSize: isIpad ? 24 : 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  buttonCancel: {
    backgroundColor: "#b0b0b0",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#888",
  },
  buttonCancelText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonDelete: {
    fontSize: 16,
    fontWeight: "bold",
    backgroundColor: "red",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: isIpad ? 22 : 16,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: isIpad ? 22 : 16,
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
    width: width * 0.7,
  },
  input: {
    height: 50,
    borderColor: "#aaa",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 30,
    width: "100%",
    backgroundColor: "#fff",
    color: "#333",
    borderRadius: 5,
    fontSize: isIpad ? 22 : 16,
  },
  button: {
    backgroundColor: "#b0b0b0",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#888",
    width: width * 0.5,
    alignSelf: "center",
  },
  deleteButton: {
    backgroundColor: "red",
    width: width * 0.5,
    padding: 12,
    margin: 20,
    marginBottom: 40,
    borderRadius: 10,
    alignItems: "center",
    alignSelf: "center",
  },
  deleteButtonText: {
    color: "white",
    fontSize: isIpad ? 24 : 18,
    fontFamily: "arial",
  },
});

export default PrivacyPolicy;
