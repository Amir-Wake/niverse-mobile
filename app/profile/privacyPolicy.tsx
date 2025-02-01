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
                    Welcome to our app. We value your privacy and are committed to protecting your personal information. This Privacy Policy outlines the types of information we collect, how we use it, and the measures we take to ensure your information is protected.
                </Text>
                <Text style={{ fontSize: 16, marginBottom: 10 }}>
                    <Text style={{ fontWeight: "bold" }}>Information Collection and Use:</Text> We collect only the necessary information that you provide to us directly, such as personal details and usage data. This information is used solely to improve our services and provide a better user experience. We do not share your information with third parties without your explicit consent, except as required by law.
                </Text>
                <Text style={{ fontSize: 16, marginBottom: 10 }}>
                    <Text style={{ fontWeight: "bold" }}>User Rights:</Text> You have the right to access, update, or delete your personal information at any time. You can unsubscribe from communications and delete your account along with all associated information by contacting our support team. We will process your request promptly and ensure that your data is removed from our systems.
                </Text>
                <Text style={{ fontSize: 16, marginBottom: 10 }}>
                    <Text style={{ fontWeight: "bold" }}>User Eligibility:</Text> Our app is intended for users who meet certain criteria. We do not knowingly collect personal information from individuals who do not meet these criteria. If we become aware that such information has been provided, we will take steps to delete it immediately. Parents and guardians are encouraged to monitor their dependents' use of our app to ensure their safety.
                </Text>
                <Text style={{ fontSize: 16, marginBottom: 10 }}>
                    <Text style={{ fontWeight: "bold" }}>Security:</Text> We value your trust in providing us your personal information, thus we strive to use commercially acceptable means of protecting it. However, please remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security. We implement a variety of security measures to maintain the safety of your personal information, including encryption, access controls, and secure servers.
                </Text>
                <Text style={{ fontSize: 16, marginBottom: 10 }}>
                    <Text style={{ fontWeight: "bold" }}>Data Retention:</Text> We retain your personal information only for as long as necessary to fulfill the purposes for which it was collected, or as required by law. Once your information is no longer needed, we will securely delete or anonymize it. We regularly review our data retention policies to ensure compliance with legal and regulatory requirements.
                </Text>
                <Text style={{ fontSize: 16, marginBottom: 10 }}>
                    <Text style={{ fontWeight: "bold" }}>Third-Party Services:</Text> We may employ third-party companies and individuals to facilitate our service, provide the service on our behalf, perform service-related services, or assist us in analyzing how our service is used. These third parties have access to your personal information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose. We ensure that all third-party service providers adhere to strict data protection standards.
                </Text>
                <Text style={{ fontSize: 16, marginBottom: 10 }}>
                    <Text style={{ fontWeight: "bold" }}>International Data Transfers:</Text> Your information, including personal data, may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those of your jurisdiction. We take all steps reasonably necessary to ensure that your data is treated securely and in accordance with this Privacy Policy. By using our app, you consent to the transfer of your information to countries outside of your home country.
                </Text>
                <Text style={{ fontSize: 16, marginBottom: 10 }}>
                    <Text style={{ fontWeight: "bold" }}>Cookies and Tracking Technologies:</Text> We use cookies and similar tracking technologies to track the activity on our app and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
                </Text>
                <Text style={{ fontSize: 16, marginBottom: 10 }}>
                    <Text style={{ fontWeight: "bold" }}>Changes to This Privacy Policy:</Text> We may update our Privacy Policy from time to time. Thus, you are advised to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page. Changes to this Privacy Policy are effective when they are posted on this page. Your continued use of our app after any changes to this Privacy Policy will constitute your acknowledgment of the changes and your consent to abide and be bound by the modified Privacy Policy.
                </Text>
                <Text style={{ fontSize: 16, marginBottom: 10 }}>
                    <Text style={{ fontWeight: "bold" }}>Contact Us:</Text> If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us. We are committed to addressing your concerns and providing you with the information you need. You can reach our support team via email at support@niverse.com.
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
