import React, { useEffect, useState } from "react";
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
  Linking,
  Image,
  Dimensions,
  ScrollView,
} from "react-native";
import { auth } from "@/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithCredential,
  OAuthProvider,
} from "firebase/auth";
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import i18n from "@/assets/languages/i18n";
import * as AppleAuthentication from "expo-apple-authentication";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";

const { width } = Dimensions.get("window");
const isIpad: boolean = Device.deviceType === Device.DeviceType.TABLET;


export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useRouter();
  const firestore = getFirestore();

  useEffect(() => {
    const onAuthStateChanged = auth.onAuthStateChanged((user) => {
      if (user && user.emailVerified) {
        AsyncStorage.setItem("stored_userId", user.uid);
        navigation.replace("/inside/(tabs)");
      }
    });
    return onAuthStateChanged;
  }, []);

  GoogleSignin.configure({
    webClientId:
      "696156084695-jtn3er5vaav5503nm3dd2id7ia5cfjfq.apps.googleusercontent.com",
  });

  const googleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      setLoading(true);
      const signInResult = await GoogleSignin.signIn();
      signInResult.type === "cancelled" && setLoading(false);
      const response = signInResult.data?.idToken;
      const googleCredential = GoogleAuthProvider.credential(response || null);
      const userCredential = await signInWithCredential(auth, googleCredential);

      // Update user profile with email and name
      if (auth.currentUser?.uid) {
        const userDoc = doc(firestore, "users", auth.currentUser.uid);
        const docSnap = await getDoc(userDoc);
        const data = docSnap.data();
        if (!data?.name) {
          const name = userCredential.user.displayName;
          if (name) {
            await setDoc(userDoc, { name: name }, { merge: true });
          }
        }
        if (!data?.email) {
          const email = userCredential.user.email;
          if (email) {
            await setDoc(userDoc, { email: email }, { merge: true });
          }
        }
      }

      setLoading(false);
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            break;
          default:
        }
      } else {
      }
    }
  };

  const appleSignIn = async () => {
    try {
      setLoading(true);
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const { identityToken, email, fullName } = credential;
      if (identityToken) {
        const appleProvider = new OAuthProvider("apple.com");
        appleProvider.addScope("email");
        appleProvider.addScope("name");
        const appleCredential = appleProvider.credential({
          idToken: identityToken,
        });
        const userCredential = await signInWithCredential(
          auth,
          appleCredential
        );

        // Update user profile with email and name
        if (auth.currentUser?.uid) {
          const userDoc = doc(firestore, "users", auth.currentUser.uid);
          const docSnap = await getDoc(userDoc);
          const data = docSnap.data();
          if (!data?.name && fullName?.givenName && fullName?.familyName) {
            const name = `${fullName.givenName} ${fullName.familyName}`;
            await setDoc(userDoc, { name: name }, { merge: true });
          }
          if (!data?.email && email) {
            await setDoc(userDoc, { email: email }, { merge: true });
          }
        }
      }
    } catch (error) {
      setError("Apple Sign-In failed");
    } finally {
      setLoading(false);
    }
  };

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

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        await sendEmailVerification(userCredential.user);
        setPassword("");
        setConfirmPassword("");
        setEmail("");
        navigation.push(`/(login)/verification?email=${email}`);
      } else {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        if (user.emailVerified) {
          AsyncStorage.setItem("stored_userId", user.uid);
          navigation.replace("/inside/(tabs)");
        } else {
          navigation.push("/(login)/verification");
        }
      }
    } catch (error) {
      const errorMessages = {
        "auth/email-already-in-use": "Email is already in use",
        "auth/weak-password": "Password is too weak",
        "auth/invalid-email": "Email is invalid",
        "auth/wrong-password": "Email or password is incorrect",
        "auth/user-not-found": "Email or password is incorrect",
        "auth/invalid-credential": "Email or password is incorrect",
        "auth/user-disabled": "User is disabled",
        "auth/network-request-failed": "You're offline",
      };
      const errorCode = (error as { code: keyof typeof errorMessages }).code;
      setError(errorMessages[errorCode] || (error as Error).message);
    } finally {
      setLoading(false);
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
    <ScrollView style={{ flex: 1, backgroundColor: "#FAF9F6" }}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <SafeAreaView style={{ marginTop: Platform.OS == "android" ? 40 : 0 }} />
      <View style={styles.headerContainer}>
        <View style={styles.appNameContainer}>
          <Image
            source={require("@/assets/images/iconTr.png")}
            style={styles.appIcon}
          />
          <Text style={styles.appName}>Nverse</Text>
        </View>
        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => navigation.push("./languages")}
        >
          <Text style={styles.languageButtonText}>🌐</Text>
          <Text style={styles.languageButtonText}>
            {i18n.locale.toUpperCase()}
          </Text>
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
          {isSignUp ? i18n.t("signUpText") : i18n.t("signInText")}
        </Text>
        <View style={styles.inputContainer}>
          <AntDesign name="mail" size={isIpad ? 24 : 20} color="gray" />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="gray"
            value={email}
            onChangeText={setEmail}
            inputMode="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
          />
        </View>
        <View style={styles.inputContainer}>
          <AntDesign name="lock" size={isIpad ? 24 : 20} color="gray" />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="gray"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            onSubmitEditing={handleAuth}
          />
        </View>
        {isSignUp && (
          <View style={styles.inputContainer}>
            <AntDesign name="lock" size={isIpad ? 24 : 20} color="gray" />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="gray"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>
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
          onPress={() => navigation.push("/(login)/restPassword")}
        >
          <Text style={{ fontSize: isIpad ? 24 : 18, color: "#0066CC" }}>
            {i18n.t("forgotPassword")}
          </Text>
        </TouchableOpacity>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginVertical: 5,
          }}
        >
          <View style={{ flex: 1, height: 1, backgroundColor: "gray" }} />
          <Text
            style={{
              fontSize: isIpad ? 24 : 18,
              textAlign: "center",
              marginHorizontal: 10,
            }}
          >
            or use
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: "gray" }} />
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: "transparent",
            alignSelf: "center",
            marginVertical: 5,
          }}
          onPress={googleSignIn}
        >
          <Image
            source={require("@/assets/images/googleContinue.png")}
            style={{
              width: isIpad ? 300 : 200,
              height: isIpad ? 74 : 54,
              alignSelf: "center",
            }}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={
            AppleAuthentication.AppleAuthenticationButtonType.CONTINUE
          }
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={5}
          style={{
            width: isIpad ? 300 : 200,
            height: isIpad ? 64 : 44,
            alignSelf: "center",
          }}
          onPress={appleSignIn}
        />
      </View>
      <View style={styles.footer}>
        <Text style={styles.footerText}>{i18n.t("userAgreement")}</Text>
      </View>
      <View style={{ marginTop: 40 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 10,
          }}
        >
          <TouchableOpacity onPress={() => navigation.push("./terms")}>
            <Text style={styles.footerLinks}>{i18n.t("terms")}</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 16, color: "#404040", marginHorizontal: 5 }}>
            |
          </Text>
          <TouchableOpacity onPress={() => navigation.push("./privacyPolicy")}>
            <Text style={styles.footerLinks}>{i18n.t("privacyPolicy")}</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 16, color: "#404040", marginHorizontal: 5 }}>
            |
          </Text>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                "mailto:support@nverse.app?subject=Contact and support"
              )
            }
          >
            <Text style={styles.footerLinks}>{i18n.t("contact")}</Text>
          </TouchableOpacity>
        </View>
        <Text
          style={{
            textAlign: "center",
            fontSize: isIpad ? 20 : 14,
            color: "#404040",
            marginTop: 10,
          }}
        >
          © {new Date().getFullYear()} Nverse, Inc.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    padding: width * 0.1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  appNameContainer: {
    alignItems: "center",
    flexDirection: "row",
  },
  appName: {
    fontSize: 32,
    color: "#F94929",
    fontFamily: "times",
  },
  appIcon: {
    width: 60,
    height: 60,
  },
  languageButton: {
    padding: 10,
  },
  languageButtonText: {
    fontSize: isIpad ? 24 : 18,
    color: "#0066CC",
  },
  header: {
    fontSize: isIpad ? 24 : 18,
    textAlign: "center",
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  input: {
    flex: 1,
    height: isIpad ? 50 : 40,
    marginLeft: 10,
    fontSize: isIpad ? 24 : 18,
  },
  error: {
    color: "red",
    marginBottom: 12,
    textAlign: "center",
    fontSize: isIpad ? 22 : 16,
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
    fontSize: isIpad ? 24 : 18,
    color: "gray",
  },
  radioTextSelected: {
    fontSize: isIpad ? 26 : 20,
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
    width: "95%",
    alignSelf: "center",
  },
  authButton: {
    backgroundColor: "#24a0ed",
    padding: 10,
    width: width * 0.5,
    alignSelf: "center",
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 8,
  },
  authButtonDisabled: {
    backgroundColor: "lightgray",
  },
  authButtonText: {
    color: "white",
    fontFamily: "arial",
    fontSize: isIpad ? 24 : 18,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: isIpad ? 24 : 18,
    color: "gray",
  },
  footer: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  footerText: {
    textAlign: "center",
    fontSize: isIpad ? 20 : 14,
    color: "#404040",
  },
  footerLinks: {
    fontSize: isIpad ? 20 : 14,
    color: "#0066CC",
    marginHorizontal: 5,
    textDecorationLine: "underline",
  },
});
