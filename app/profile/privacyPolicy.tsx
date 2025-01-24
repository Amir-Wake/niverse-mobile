import { ScrollView, View, Text, TouchableOpacity, Alert, Modal, TextInput, StyleSheet } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth } from "../../firebase";
import { getAuth, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

const PrivacyPolicy = () => {
    const router = useRouter();
    const [modalVisible, setModalVisible] = useState(false);
    const [password, setPassword] = useState("");

    const handleDeleteAccount = () => {
        setModalVisible(true);
    };

    const confirmDeleteAccount = async () => {
        try {
            const user = auth.currentUser;
            if (user) {
                if (user.email) {
                    const credential = EmailAuthProvider.credential(user.email, password);
                    await reauthenticateWithCredential(user, credential);
                    await deleteUser(user);
                    router.push("/login/main");
                } else {
                    console.error("User email is null.");
                }
            } else {
                console.error("No authenticated user found.");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            Alert.alert("Error", "Failed to delete account. Please try again.");
        } finally {
            setModalVisible(false);
        }
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
              <ScrollView style={{ padding: 20, backgroundColor: "#FAF9F6", borderRadius: 20 }}>
                <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>
                    Privacy Policy
                </Text>
                <Text style={{ fontSize: 16, marginBottom: 10 }}>
                    Welcome to our app. We value your privacy and are committed to protecting your personal information.
                </Text>

                <Text style={{ fontSize: 16, marginBottom: 10 }}>
                    <Text style={{ fontWeight: "bold" }}>Information Collection and Use:</Text> We collect information that you provide to us directly, such as when you create an account, update your profile, or use our services. Most of this information is optional, but if we need it, it is for the necessary use of the features. We do not use your information or give it to third parties.
                </Text>
                <Text style={{ fontSize: 16, marginBottom: 10 }}>
                    <Text style={{ fontWeight: "bold" }}>Log Data:</Text> Whenever you use our app, we collect data and information (through third-party products) on your phone called Log Data. This Log Data may include information such as your device Internet Protocol (“IP”) address, device name, operating system version, the configuration of the app when utilizing our service, the time and date of your use of the service, and other statistics.
                </Text>
                <Text style={{ fontSize: 16, marginBottom: 10 }}>
                    <Text style={{ fontWeight: "bold" }}>Cookies:</Text> Cookies are files with a small amount of data that are commonly used as anonymous unique identifiers. These are sent to your browser from the websites that you visit and are stored on your device's internal memory.
                </Text>
                <Text style={{ fontSize: 16, marginBottom: 10 }}>
                    <Text style={{ fontWeight: "bold" }}>Service Providers:</Text> We may employ third-party companies and individuals due to the following reasons: to facilitate our service; to provide the service on our behalf; to perform service-related services; or to assist us in analyzing how our service is used. We want to inform users of this service that these third parties have access to your personal information. The reason is to perform the tasks assigned to them on our behalf. However, they are obligated not to disclose or use the information for any other purpose.
                </Text>
                <Text style={{ fontSize: 16, marginBottom: 10 }}>
                    <Text style={{ fontWeight: "bold" }}>Security:</Text> We value your trust in providing us your personal information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.
                </Text>
                <Text style={{ fontSize: 16, marginBottom: 10 }}>
                    <Text style={{ fontWeight: "bold" }}>Changes to This Privacy Policy:</Text> We may update our Privacy Policy from time to time. Thus, you are advised to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page.
                </Text>
                <Text style={{ fontSize: 16, marginBottom: 10 }}>
                    <Text style={{ fontWeight: "bold" }}>Contact Us:</Text> If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us.
                </Text>
                {auth.currentUser && <TouchableOpacity
                    style={{
                        backgroundColor: "red",
                        padding: 12,
                        margin: 20,
                        marginBottom: 40,
                        borderRadius: 10,
                        alignItems: "center"
                    }}
                    onPress={handleDeleteAccount}
                >
                    <Text style={{ color: "white", fontSize: 16, fontFamily:'arial' }}>Delete Account and All Information</Text>
                </TouchableOpacity>}
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
                    <TouchableOpacity style={[styles.modalView, { width: 300 }]} activeOpacity={1}>
                        <Text style={styles.modalText}>Please enter your password to confirm:</Text>
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
                                style={styles.buttonCancel}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.buttonCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.buttonDelete]}
                                onPress={confirmDeleteAccount}
                            >
                                <Text style={styles.textStyle}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%"
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
        backgroundColor: "red"
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
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
    backgroundColor: "#fff",
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
  }
});

export default PrivacyPolicy;
