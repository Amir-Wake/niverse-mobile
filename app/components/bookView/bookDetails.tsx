import React, { useState, useEffect, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import { Button } from "react-native-paper";
import { auth } from "@/firebase";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import Review from "./review/review";
import i18n from "@/assets/languages/i18n";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScrollView } from "react-native-gesture-handler";
import { EventRegister } from "react-native-event-listeners";
import * as Device from "expo-device";

const { width } = Dimensions.get("window");
const isIpad = Device.deviceType === Device.DeviceType.TABLET;

interface Book {
  id: string;
  coverImageUrl: string;
  title: string;
  author: string;
  shortDescription: string;
  longDescription: string;
  printLength: number;
  language: string;
  publicationDate: string;
  publisher: string;
  translator: string;
  fileUrl: string;
  reviewCount: number;
  averageRating: number;
  ageRate: number;
  coverDominantColor: string;
  version: number;
<<<<<<< HEAD
  downloadedNumber: number;
=======
>>>>>>> 9f3204233907014723ae806bb7c153b0ecb15a73
}

const BookDetails = ({ book }: { book: Book }) => {
  const [showMore, setShowMore] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isAddedToCollection, setIsAddedToCollection] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ageRestrictionEnabled, setAgeRestrictionEnabled] = useState(false);
  const [isRTL, setIsRTL] = useState(false);
  const [userAge, setUserAge] = useState(12);
  const router = useRouter();
  const db = getFirestore();

  useEffect(() => {
    // Run all async checks in parallel for faster load
    (async () => {
      await Promise.all([
        checkFileExistence(),
        checkIfAddedToCollection(),
        fetchUserAgeRestriction(),
      ]);
      setTextDirection();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book.title, book.id, book.language]);

  const setTextDirection = () => {
<<<<<<< HEAD
    setIsRTL(
      book.language === "کوردی" ||
      book.language === "عربى" ||
      book.language === "فارسی"
    );
=======
    setIsRTL(book.language === "کوردی" || book.language === "عربى");
>>>>>>> 9f3204233907014723ae806bb7c153b0ecb15a73
  };

  const checkIfAddedToCollection = async () => {
    const storedUserId = await AsyncStorage.getItem("stored_userId");
    const storedBooks = await AsyncStorage.getItem("WantToReadBooks_" + storedUserId);
    const BooksList = JSON.parse(storedBooks || "[]");
<<<<<<< HEAD
    setIsAddedToCollection(BooksList.some((sbook: any) => sbook.bookId === book.id));
=======
    const bookIndex = BooksList.findIndex(
      (sbook: any) => sbook.bookId === book.id
    );
    if (bookIndex !== -1) {
      setIsAddedToCollection(true);
    }
>>>>>>> 9f3204233907014723ae806bb7c153b0ecb15a73
  };

  const fetchUserAgeRestriction = async () => {
    const ageRestrictionEnabledValue = await AsyncStorage.getItem(
      "ageRestrictionEnabled" + auth.currentUser?.uid
    );
    if (ageRestrictionEnabledValue) {
      setAgeRestrictionEnabled(JSON.parse(ageRestrictionEnabledValue));
      const profileDob = await AsyncStorage.getItem(
        "profileDob" + auth.currentUser?.uid
      );
      if (profileDob) {
        const dob = new Date(profileDob);
        const age = Math.abs(new Date(Date.now() - dob.getTime()).getUTCFullYear() - 1970);
        setUserAge(age);
      }
    }
  };

  const handleDownload = async () => {
    if (ageRestrictionEnabled && book.ageRate > userAge) {
      Alert.alert("Error", "You are not old enough to download this book.");
      return;
    }
    setIsDownloading(true);
    const directory = `${FileSystem.documentDirectory}${auth.currentUser?.uid}/books/${book.id}/`;
    try {
      await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BOOKS_API}books/${book.id}/file`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch download file URL");
      const data = await response.json();
      const downloadResumable = FileSystem.createDownloadResumable(
        data.fileUrl,
        `${directory}${book.title}.epub`,
        {},
        (downloadProgress) => {
          setDownloadProgress(
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite
          );
        }
      );
      const result = await downloadResumable.downloadAsync();
      if (result) {
        await FileSystem.downloadAsync(
          book.coverImageUrl,
          `${directory}${book.title}.jpg`
        );
        setIsDownloaded(true);
        EventRegister.emit("booksDownloaded");
        const bookRef = doc(db, "books", book.id);
        const bookDoc = await getDoc(bookRef);
        if (bookDoc.exists()) {
          const currentDownloadedNumber = bookDoc.data()?.downloadedNumber || 0;
          await setDoc(
            bookRef,
            { downloadedNumber: currentDownloadedNumber + 1 },
            { merge: true }
          );
        }
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to download book. Please try again.");
      setIsDownloaded(false);
    } finally {
      setIsDownloading(false);
    }
    addToBooksList();
    addToDownloadedsList();
  };

  const addToDownloadedsList = async () => {
    const user = auth.currentUser;
    setIsLoading(true);
    try {
      const storedBooks = await AsyncStorage.getItem(`DownloadedBooks_${user?.uid}`);
      const BooksList = JSON.parse(storedBooks || "[]");
      if (BooksList.some((item: any) => item.bookId === book.id)) return;
      const newBook = {
        userId: user?.uid,
        bookId: book.id,
        title: book.title,
        coverImageUrl: book.coverImageUrl,
        addedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(
        `DownloadedBooks_${user?.uid}`,
        JSON.stringify([...BooksList, newBook])
      );
    } catch (error) {
      console.error("Error updating collection:", error);
      Alert.alert("Error", "Failed to update collection.");
    } finally {
      setIsLoading(false);
    }
  };

  const addToBooksList = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const storedBooksList = await AsyncStorage.getItem(`Books_${user.uid}`);
    let BooksList = storedBooksList ? JSON.parse(storedBooksList) : [];
    const bookIndex = BooksList.findIndex((item: any) => item.bookId === book.id);
    if (bookIndex === -1) {
      BooksList.push({
        userId: user.uid,
        bookId: book.id,
        title: book.title,
        coverImageUrl: book.coverImageUrl,
        addedAt: new Date().toISOString(),
        inLibrary: true,
        finished: false,
<<<<<<< HEAD
        version: book.version || 0,
=======
        wantToRead: false,
        version: book.version||0,
>>>>>>> 9f3204233907014723ae806bb7c153b0ecb15a73
      });
    } else {
      BooksList[bookIndex] = {
        ...BooksList[bookIndex],
        inLibrary: true,
        title: book.title,
        coverImageUrl: book.coverImageUrl,
        version: book.version || 0,
      };
    }
    await AsyncStorage.setItem(`Books_${user.uid}`, JSON.stringify(BooksList));
  };

  const handleAddToCollection = async () => {
    const user = auth.currentUser;
    setIsLoading(true);
    try {
      const storedBooks = await AsyncStorage.getItem(`WantToReadBooks_${user?.uid}`);
      const BooksList = JSON.parse(storedBooks || "[]");
      const bookIndex = BooksList.findIndex((item: any) => item.bookId === book.id);
      if (bookIndex !== -1) {
<<<<<<< HEAD
        const updatedBooksList = BooksList.filter((item: any) => item.bookId !== book.id);
=======
        const updatedBooksList = BooksList.filter(
          (item: any) => item.bookId !== book.id
        );
>>>>>>> 9f3204233907014723ae806bb7c153b0ecb15a73
        setIsAddedToCollection(false);
        await AsyncStorage.setItem(
          `WantToReadBooks_${user?.uid}`,
          JSON.stringify(updatedBooksList)
        );
      } else {
        const newBook = {
          userId: user?.uid,
          bookId: book.id,
          title: book.title,
          coverImageUrl: book.coverImageUrl,
          addedAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem(
          `WantToReadBooks_${user?.uid}`,
          JSON.stringify([...BooksList, newBook])
        );
        setIsAddedToCollection(true);

        const bookRef = doc(db, "books", book.id);
        const bookDoc = await getDoc(bookRef);
        if (bookDoc.exists()) {
          const currentWantToReadNumber = bookDoc.data()?.wantToReadNumber || 0;
          await setDoc(
            bookRef,
            { wantToReadNumber: currentWantToReadNumber + 1 },
            { merge: true }
          );
        }
      }
    } catch (error) {
      console.error("Error updating collection:", error);
      Alert.alert("Error", "Failed to update collection.");
    } finally {
      setIsLoading(false);
    }
  };

  const checkFileExistence = async () => {
    const directory = `${FileSystem.documentDirectory}${auth.currentUser?.uid}/books/${book.id}/`;
    const filePath = `${directory}${book.title}.epub`;
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    setIsDownloaded(fileInfo.exists);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[book.coverDominantColor || "#F8F8FF", "#F8F8FF"]}
        style={styles.bookCard}
      />
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: book.coverImageUrl }}
          cachePolicy={"memory-disk"}
          style={styles.bookImage}
          placeholder={require("@/assets/images/booksPlaceHolder.png")}
          placeholderContentFit="cover"
          contentFit="cover"
          transition={10}
        />
      </View>
      <View style={styles.body}>
        <Animated.View
          style={styles.headerDetail}
          entering={FadeInDown.delay(200).duration(500).springify().damping(12)}
        >
          <Text style={styles.title}>
            {book.title.length > 48
              ? `${book.title.slice(0, 48)}...`
              : book.title}
          </Text>
          <TouchableOpacity onPress={() => router.navigate({
            pathname: "/inside/author",
            params: { authorName: book.author },
          })}>
            <Text style={styles.author}>{book.author}</Text>
          </TouchableOpacity>
          <View style={styles.rating}>
            {[...Array(5)].map((_, index) => (
              <FontAwesome
                key={index}
                name="star"
                size={isIpad ? 30 : 24}
                color={index < book.averageRating ? "gold" : "gray"}
              />
            ))}
            <Text style={styles.reviewCount}> ({book.reviewCount || 0})</Text>
          </View>
        </Animated.View>
        <Animated.View
          style={styles.buttonContainer}
          entering={FadeInDown.delay(400).duration(500).springify().damping(12)}
        >
          <Button
            icon={isDownloaded ? "check-bold" : "download"}
            mode="contained"
            onPress={isDownloaded ? () => { } : handleDownload}
            buttonColor={isDownloaded ? "lightgray" : "orange"}
            textColor="black"
            style={styles.button}
            labelStyle={styles.buttonText}
            loading={isDownloading}
            disabled={
              isDownloading || (ageRestrictionEnabled && book.ageRate > userAge)
            }
          >
            {isDownloaded
              ? i18n.t("inLibrary")
              : isDownloading
                ? ` ${Math.round(downloadProgress * 100)}%`
                : i18n.t("download")}
          </Button>
          <Button
            icon={isAddedToCollection ? "check-bold" : "plus"}
            mode="contained"
            onPress={handleAddToCollection}
            buttonColor={isAddedToCollection ? "lightgray" : "orange"}
            textColor="black"
            style={styles.button}
            labelStyle={styles.buttonText}
            loading={isLoading}
          >
            {i18n.t("wantToRead")}
          </Button>
        </Animated.View>
        <View style={styles.horizontalLine} />
        <Animated.View
          entering={FadeInDown.delay(600).duration(500).springify().damping(12)}
        >
          <Text style={[styles.description, isRTL && { textAlign: "right" }]}>
            {book.shortDescription}
          </Text>
          <Text
            style={[styles.longDescription, isRTL && { textAlign: "right" }]}
          >
            {showMore
              ? book.longDescription
              : `${book.longDescription.slice(0, 200)}...`}
          </Text>
          <TouchableOpacity onPress={() => setShowMore(!showMore)}>
            <Text style={styles.showMoreText}>
              {showMore ? i18n.t("less") : i18n.t("more")}
            </Text>
          </TouchableOpacity>
        </Animated.View>
        <Animated.View
          entering={FadeInDown.delay(800).duration(500).springify().damping(12)}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.bookInfo}>
              <Text style={styles.infoText}>{i18n.t("pages")}</Text>
              <FontAwesome name="files-o" size={50} color="black" />
              <Text style={styles.infoText}>{book.printLength}</Text>
            </View>
            <View style={styles.bookInfo}>
              <Text style={styles.infoText}>{i18n.t("language")}</Text>
              <FontAwesome name="language" size={50} color="black" />
              <Text style={styles.infoText}>{book.language}</Text>
            </View>
            <View style={styles.bookInfo}>
              <Text style={styles.infoText}>{i18n.t("publicationDate")}</Text>
              <MaterialIcons name="date-range" size={50} color="black" />
              <Text style={styles.infoText}>{book.publicationDate}</Text>
            </View>
            {book.publisher.trim() && (
              <View style={styles.bookInfo}>
                <Text style={styles.infoText}>{i18n.t("publisher")}</Text>
                <MaterialIcons name="business" size={50} color="black" />
                <Text style={styles.infoText}>{book.publisher}</Text>
              </View>
            )}
            {book.translator.trim() && (
              <View style={styles.bookInfo}>
                <Text style={styles.infoText}>{i18n.t("translator")}</Text>
                <MaterialIcons name="translate" size={50} color="black" />
                <TouchableOpacity onPress={() => router.navigate({
                  pathname: "/inside/author",
                  params: { authorName: book.translator },
                })}>
                  <Text style={styles.infoText}>{book.translator}</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.bookInfo}>
              <Text style={styles.infoText}>{i18n.t("ageRating")}</Text>
              <FontAwesome name="ban" size={50} color="black" />
              <Text style={styles.infoText}>
                {book.ageRate ? "+" + book.ageRate : "none"}
              </Text>
            </View>
          </ScrollView>
        </Animated.View>
        <Review bookId={book.id} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    marginBottom: 25,
  },
  body: {
    padding: 10,
  },
  bookImage: {
    width: width / 2,
    height: (width / 2) * 1.5,
    backgroundColor: "white",
    shadowColor: "#000",
    elevation: 5,
  },
  imageContainer: {
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
    alignItems: "center",
    marginTop: 30,
  },
  bookCard: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "30%",
  },
  headerDetail: {
    width: width * 0.9,
    padding: 2,
    alignSelf: "center",
  },
  title: {
    fontSize: isIpad ? 28 : 22,
    fontWeight: "bold",
    marginVertical: 5,
    alignSelf: "center",
    textAlign: "center",
  },
  author: {
    fontSize: isIpad ? 24 : 18,
    paddingTop: 10,
    textAlign: "center",
  },
  rating: {
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 5,
  },
  reviewCount: {
    paddingTop: 5,
    fontSize: isIpad ? 20 : 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: isIpad ? "space-evenly" : "space-between",
  },
  button: {
    textAlign: "center",
    marginTop: 5,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: isIpad ? 22 : 18,
    fontFamily: "Helvetica",
  },
  description: {
    fontSize: isIpad ? 24 : 18,
    lineHeight: isIpad ? 30 : 24,
    fontWeight: "bold",
    marginVertical: 5,
    letterSpacing: 0.5,
  },
  longDescription: {
    marginVertical: 5,
    fontSize: isIpad ? 24 : 18,
    lineHeight: isIpad ? 30 : 24,
    textAlign: "justify",
    letterSpacing: 0.5,
  },
  showMoreText: {
    marginVertical: 5,
    fontWeight: "bold",
    fontSize: isIpad ? 24 : 18,
    color: "#0096FF",
    textAlign: "center",
  },
  bookInfo: {
    width: width / 3,
    justifyContent: "center",
    alignItems: "center",
    borderBottomColor: "gray",
    borderBottomWidth: 1,
    borderTopColor: "gray",
    borderTopWidth: 1,
  },
  infoText: {
    padding: 10,
    fontSize: isIpad ? 20 : 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  horizontalLine: {
    height: 1,
    backgroundColor: "gray",
    marginVertical: 10,
  },
});

export default memo(BookDetails);
