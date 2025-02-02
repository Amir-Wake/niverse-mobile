import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  Platform,
  I18nManager
} from "react-native";
import { Image } from "expo-image";
import { auth } from "@/firebase";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import * as ImageManipulator from "expo-image-manipulator";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import i18n from '@/assets/languages/i18n';

const { width } = Dimensions.get("window");

export default function UpdateProfile() {
  const [profileImage, setProfileImage] = useState(null);
  const [username, setUsername] = useState("Unknown");
  const [dob, setDob] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const email = auth.currentUser?.email || "";
  const storage = getStorage();
  const firestore = getFirestore();
  const [newName, setNewName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchProfileData = async () => {
      const userDoc = doc(firestore, "users", auth.currentUser.uid);
      const docSnap = await getDoc(userDoc);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.profileImageUrl) {
          setProfileImage({ uri: data.profileImageUrl });
        }
        if (data.name) {
          setUsername(data.name);
          setNewName(data.name);
        }
        if (data.dob) {
          setDob(data.dob);
        }
      }
    };

    fetchProfileData();
  }, [firestore]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need access to your photo library to pick an image."
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const source = { uri: result.assets[0].uri };
      try {
        const resizedImage = await resizeImage(source.uri);
        setProfileImage(resizedImage);
      } catch (error) {
        console.error("Error resizing image:", error);
        Alert.alert("Error", "Failed to resize image");
      }
    }
  };

  const resizeImage = async (uri) => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 300, height: 300 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      return manipResult;
    } catch (error) {
      console.error("Error in resizeImage:", error);
      throw error;
    }
  };

  const uploadImage = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `profileImages/${auth.currentUser.uid}`);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const handleSaveName = async () => {
    let profileImageUrl = null;
    if (profileImage) {
      profileImageUrl = await uploadImage(profileImage.uri);
    }

    const userDoc = doc(firestore, "users", auth.currentUser.uid);
    const updateData = { name: newName, dob };
    if (profileImageUrl) {
      updateData.profileImageUrl = profileImageUrl;
    }
    await setDoc(userDoc, updateData, { merge: true });
    setUsername(newName);
    Alert.alert(i18n.t('success'), i18n.t('profileUpdated'), [{ text: i18n.t('ok') }]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <View style={I18nManager.isRTL ? styles.containerRtl : styles.container}>
        <View style={styles.section}>
          <View style={styles.profileContainer}>
            <TouchableOpacity onPress={pickImage}>
              <Image
                source={
                  profileImage
                    ? { uri: profileImage.uri }
                    : require("@/assets/images/blank-profile.png")
                }
                style={styles.profileImage}
                cachePolicy={"memory-disk"}
              />
              <Text style={styles.choosePhotoText}>{i18n.t('choosePhoto')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{i18n.t('email')}</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              placeholder="Email"
              value={email}
              editable={false}
              selectTextOnFocus={false}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{i18n.t('name')}</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={newName}
              onChangeText={(text) => setNewName(text)}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{i18n.t('birthday')}</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <View pointerEvents="none">
                <TextInput
                  style={styles.input}
                  placeholder="Date of Birth"
                  value={dob}
                  editable={false}
                />
              </View>
            </TouchableOpacity>
            <Modal
              visible={showDatePicker}
              animationType="fade"
              transparent={true}
            >
              <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
                <View style={styles.modalContainer}>
                  <TouchableWithoutFeedback>
                    <View style={[styles.modalContent, { width: width }]}>
                      <DateTimePicker
                        value={dob ? new Date(dob) : new Date()}
                        mode="date"
                        display="spinner"
                        textColor="white"
                        style={{ backgroundColor: "gray", borderRadius: 15, width: width * 1.1 }}
                        onChange={(event, selectedDate) => {
                          if (selectedDate) {
                            setDob(selectedDate.toISOString().split("T")[0]);
                            Platform.OS === "android" && setShowDatePicker(false);
                          }
                        }}
                      />
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveName}>
            <Text style={styles.saveButtonText}>{i18n.t('saveChanges')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FAF9F6",
    borderRadius: 20
  },
  containerRtl: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FAF9F6",
    borderRadius: 20,
    direction: "rtl",
    textAlign: "right"
  },
  profileContainer: {
    alignItems: "center",
    marginVertical: 30,
  },
  profileImage: {
    alignSelf: "center",
    width: 80,
    height: 80,
    borderRadius: 50,
    marginBottom: 10,
  },
  choosePhotoText: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
    padding: 5,
    color: "white",
  },
  section: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: I18nManager.isRTL ? "right" : "left"
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    textAlign: I18nManager.isRTL ? "right" : "left"
  },
  disabledInput: {
    backgroundColor: "#f0f0f0",
    color: "#a0a0a0",
  },
  saveButton: {
    backgroundColor: "#24a0ed",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    width: '80%',
    alignSelf: "center",
    marginVertical: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  modalContent: {
    bottom: 0,
    position: "absolute",
    backgroundColor: "gray",
    borderRadius: 10,
    alignItems: "center",
  },
});
