import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
} from "react-native";
import { auth } from "../../firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ResetPassword() {
    const [resetEmail, setResetEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handlePasswordReset = () => {
        setLoading(true);

        if (!resetEmail) {
            setLoading(false);
            return;
        }

        sendPasswordResetEmail(auth, resetEmail)
            .then(() => {
                setResetEmail("");
                alert("Password reset email sent successfully!");
                setLoading(false);
            })
            .catch((error) => {
                const errorMessages = {
                    "auth/user-not-found": "User not found",
                    "auth/invalid-email": "Email is invalid",
                };
                const errorCode = (error as { code: keyof typeof errorMessages }).code;
                setError(errorMessages[errorCode] || (error as Error).message);
                setLoading(false);
            });
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.container}>
                <StatusBar
                    barStyle="dark-content"
                    backgroundColor="transparent"
                    translucent
                />
                <SafeAreaView/>
                <View style={styles.appNameContainer}>
                    <Text style={styles.appName}>Password assistance</Text>
                </View>
                <View style={styles.formContainer}>
                    {error && <Text style={styles.error}>{error}</Text>}
                    <Text style={styles.header}>
                        Enter your email associated with your account.
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="gray"
                        value={resetEmail}
                        onChangeText={setResetEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TouchableOpacity
                        style={[styles.authButton, loading && styles.authButtonDisabled]}
                        onPress={handlePasswordReset}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#0000ff" />
                        ) : (
                            <Text style={styles.authButtonText}>Reset Password</Text>
                        )}
                    </TouchableOpacity>
                </View>
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        By continuing, you agree to our Terms of Service and Privacy Policy.
                        Please make sure to read and understand these documents before
                        proceeding. Your use of our service is subject to these terms and
                        policies.
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
    },
    appNameContainer: {
        alignItems: "center",
        marginVertical: 20,
    },
    appName: {
        fontSize: 30,
        fontWeight: "bold",
        marginVertical: 10,

    },
    header: {
        fontSize: 16,
        textAlign: "left",
        marginBottom: 10,
    },
    input: {
        height: 40,
        borderColor: "gray",
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
    },
    error: {
        color: "red",
        marginBottom: 12,
        textAlign: "center",
        fontSize: 16,
    },
    formContainer: {
        padding: 4,
        width: "100%",
    },
    authButton: {
        backgroundColor: "#D3D3D3",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginVertical: 10,
        marginHorizontal: 10,
    },
    authButtonDisabled: {
        backgroundColor: "gray",
    },
    authButtonText: {
        color: "black",
        fontSize: 24,
        fontWeight: "bold",
    },
    footer: {
        marginVertical: 10,
        paddingHorizontal: 10,
    },
    footerText: {
        textAlign: "center",
        fontSize: 14,
        color: "#404040",
    },
});
