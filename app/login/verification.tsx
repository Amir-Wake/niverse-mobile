import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import {sendEmailVerification} from "firebase/auth";
import { auth } from "../../firebase";

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
                <Text style={styles.title}>Verify Your Email</Text>
                <Text style={styles.message}>
                    A verification email has been sent to {auth.currentUser?.email}. Please check your inbox and follow the instructions to verify your email address. If you do not see the email, please check your spam or junk folder.
                </Text>
                <TouchableOpacity style={styles.button} onPress={handleResendEmail}>
                    <Text style={styles.buttonText}>Send Verification Email Again</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
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
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "#007BFF",
        borderRadius: 5,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
    },
});
