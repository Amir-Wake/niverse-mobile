import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { auth } from "../../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { useRouter } from "expo-router";
import i18n from "@/assets/languages/i18n";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useRouter();

  const handleAuth = async (event: any) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!email || !password || (isSignUp && !confirmPassword)) {
      setLoading(false);
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    if (isSignUp) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await sendEmailVerification(userCredential.user);
        setPassword("");
        setConfirmPassword("");
        setLoading(false);
        navigation.push(`/login/verification?email=${email}`);
        setEmail("");
      } catch (error) {
        const errorMessages = {
          "auth/email-already-in-use": "Email is already in use",
          "auth/weak-password": "Password is too weak",
          "auth/invalid-email": "Email is invalid",
        };
        const errorCode = (error as { code: keyof typeof errorMessages }).code;
        setError(errorMessages[errorCode] || (error as Error).message);
        setLoading(false);
      }
    } else {
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        if (user.emailVerified) {
          setLoading(false);
          navigation.push("/home");
        } else {
          setLoading(false);
          navigation.push("/login/verification");
        }
      } catch (error) {
        const errorMessages = {
          "auth/wrong-password": "Email or password is incorrect",
          "auth/user-not-found": "Email or password is incorrect",
          "auth/invalid-credential": "Email or password is incorrect",
          "auth/invalid-email": "Email or password is wrong",
          "auth/user-disabled": "User is disabled",
          "auth/weak-password": "Password is too weak",
          "auth/network-request-failed": "Network error",
        };
        const errorCode = (error as { code: keyof typeof errorMessages }).code;
        setError(errorMessages[errorCode] || (error as Error).message);
        setLoading(false);
      }
    }
  };

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FAF9F6" }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView style={{ marginTop: Platform.OS == "android" ? 30 : 0 }} />
      <View style={styles.headerContainer}>
        <View style={styles.appNameContainer}>
          <Text style={styles.appName}>niVerse</Text>
        </View>
        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => navigation.push("/profile/languages")}
        >
          <Text style={styles.languageButtonText}>🌐</Text>

          <Text style={styles.languageButtonText}>{(i18n.locale).toUpperCase()}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.radioContainer}>
        <TouchableOpacity
          onPress={toggleSignUp}
          style={[styles.radioButton, !isSignUp && styles.radioButtonSelected]}
        >
          <View style={styles.radioCircle}>
            {!isSignUp && <View style={styles.selectedRb} />}
          </View>
          <Text style={isSignUp ? styles.radioText : styles.radioTextSelected}>
            {i18n.t("signIn")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={toggleSignUp}
          style={[styles.radioButton, isSignUp && styles.radioButtonSelected]}
        >
          <View style={styles.radioCircle}>
            {isSignUp && <View style={styles.selectedRb} />}
          </View>
          <Text style={isSignUp ? styles.radioTextSelected : styles.radioText}>
            {i18n.t("signUp")}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.formContainer}>
        {error && <Text style={styles.error}>{error}</Text>}
        <Text style={styles.header}>
          {isSignUp
            ? i18n.t("signUpText")
            : i18n.t("signInText")}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="gray"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="gray"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {isSignUp && (
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="gray"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        )}
        <TouchableOpacity
          style={[styles.authButton, loading && styles.authButtonDisabled]}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#0000ff" />
          ) : (
            <Text style={styles.authButtonText}>
              {isSignUp ? i18n.t("signUp") : i18n.t("signIn")}
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={{ alignItems: "center", padding: 10 }}
          onPress={() => navigation.push("/login/restPassword")}
        >
          <Text style={{ fontSize: 16, color: "#0066CC" }}>
            {i18n.t("forgotPassword")}
          </Text>
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
      <View style={{ marginTop: 100 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 10,
          }}
        >
          <TouchableOpacity onPress={() => navigation.push("/profile/terms")}>
            <Text
              style={{
                fontSize: 14,
                color: "#0066CC",
                textDecorationLine: "underline",
              }}
            >
              Terms of Service
            </Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 14, color: "#404040", marginHorizontal: 5 }}>
            |
          </Text>
          <TouchableOpacity
            onPress={() => navigation.push("/profile/privacyPolicy")}
          >
            <Text
              style={{
                fontSize: 14,
                color: "#0066CC",
                textDecorationLine: "underline",
              }}
            >
              Privacy
            </Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 14, color: "#404040", marginHorizontal: 5 }}>
            |
          </Text>
          <TouchableOpacity onPress={() => navigation.push("/profile/contact")}>
            <Text
              style={{
                fontSize: 14,
                color: "#0066CC",
                textDecorationLine: "underline",
              }}
            >
              Help
            </Text>
          </TouchableOpacity>
        </View>
        <Text
          style={{
            textAlign: "center",
            fontSize: 14,
            color: "#404040",
            marginTop: 10,
          }}
        >
          © {new Date().getFullYear()} niVerse, Inc.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    marginVertical: 20,
  },
  appNameContainer: {
    alignItems: "center",
  },
  appName: {
    fontSize: 46,
    color: "#000",
    fontFamily: "times",
    textShadowColor: "skyblue",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 3,
    shadowColor: "skyblue",
    shadowOpacity: 0.55,
    shadowRadius: 3.84,
    elevation: 5,
  },
  languageButton: {
    padding: 10,
  },
  languageButtonText: {
    fontSize: 18,
    color: "#0066CC",
  },
  header: {
    fontSize: 16,
    textAlign: "center",
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
  radioContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    padding: 10,
    marginVertical: 10,
  },
  radioButtonSelected: {
    borderColor: "grey",
  },
  radioText: {
    fontSize: 22,
    color: "gray",
  },
  radioTextSelected: {
    fontSize: 24,
    fontWeight: "bold",
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  selectedRb: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "green",
  },
  formContainer: {
    padding: 4,
    width: "100%",
  },
  authButton: {
    backgroundColor: "#808080",
    padding: 12,
    width: 250,
    alignSelf: "center",
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  authButtonDisabled: {
    backgroundColor: "gray",
  },
  authButtonText: {
    color: "white",
    fontFamily: "arial",
    fontSize: 20,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: "gray",
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
