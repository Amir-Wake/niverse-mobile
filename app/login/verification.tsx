import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import {sendEmailVerification} from "firebase/auth";
import { auth } from "../../firebase";
import i18n from "@/assets/languages/i18n";

  export default function Verification() {
    const navigation  = useRouter();

    const handleResendEmail = async () => {
        try{
            if (auth.currentUser) {
                await sendEmailVerification(auth.currentUser);
                navigation.push("/login/main");
            } else {
                console.error("No authenticated user found.");
            }
        } catch (error) {
            console.error("Error sending verification email:", error);
            return;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>{i18n.t('verifyEmail')}</Text>
                <Text style={styles.message}>
                    <Text style={{ color: "#0066CC" }}>{auth.currentUser?.email}</Text>{i18n.t('verifyEmailText')}
                </Text>
                <TouchableOpacity style={styles.button} onPress={handleResendEmail}>
                    <Text style={styles.buttonText}>{i18n.t('resendVerification')}</Text>
                </TouchableOpacity>
                <Text style={{ marginTop: 10, fontSize: 16, textAlign: "center" }}>
                   {i18n.t('resendVerificationText')}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
        alignItems: "center",
        padding: 20,
        backgroundColor: "#FAF9F6"
    },
    content: {
        alignItems: "center",
    },
    title: {
        marginVertical: 10,
        fontSize: 26,
        textAlign: "center",
    },
    message: {
        fontSize: 18,
        textAlign: "center",
    },
    button: {
        marginTop: 50,
        padding: 20,
        paddingVertical: 10,
        width: '80%',
        alignItems: "center",
        alignSelf: "center",
        backgroundColor: "#24a0ed",
        borderRadius: 10,
    },
    buttonText: {
        color: "#fff",
        fontSize: 20,
    },
});
