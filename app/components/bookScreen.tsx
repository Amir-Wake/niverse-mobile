import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import { Button } from "react-native-paper";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { auth } from "../../firebase";
import Review from "./review/review";
import i18n from "@/assets/languages/i18n";

const { width } = Dimensions.get("window");

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
}

const BookScreen = ({ book }: { book: Book }) => {
  const [showMore, setShowMore] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isAddedToCollection, setIsAddedToCollection] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ageRestrictionEnabled, setAgeRestrictionEnabled] = useState(false);
  const [isRTL, setIsRTL] = useState(false);
  const router = useRouter();
  const firestore = getFirestore();

  useEffect(() => {
    const checkFileExistence = async () => {
      const directory = `${FileSystem.documentDirectory}books/${book.title}/`;
      const filePath = `${directory}${book.title}.epub`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      setIsDownloaded(fileInfo.exists);
    };

    const checkIfAddedToCollection = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const q = query(
        collection(firestore, "users", user.uid, "WantToRead"),
        where("bookId", "==", book.id)
      );
      const querySnapshot = await getDocs(q);
      setIsAddedToCollection(!querySnapshot.empty);
    };

    const fetchUserAgeRestriction = async () => {
      const user = auth.currentUser;
      if (!user) return;
      
      const userDocRef = doc(firestore, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setAgeRestrictionEnabled(userData?.ageRestrictionEnabled);
      }
    };

    const setTextDirection = () => {
      if (book.language === "کوردی" || book.language === "Arabic") {
        setIsRTL(true);
      } else {
        setIsRTL(false);
      }
    };

    checkFileExistence();
    checkIfAddedToCollection();
    fetchUserAgeRestriction();
    setTextDirection();
  }, [book.title, book.id, book.language]);

  const handleDownload = async () => {
    if (ageRestrictionEnabled  && 13 < book.ageRate) {
      Alert.alert("Error", "You are not old enough to download this book.");
      return;
    }

    setIsDownloading(true);
    const directory = `${FileSystem.documentDirectory}books/${book.title}/`;

    try {
      await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`${process.env.EXPO_PUBLIC_BOOKS_API}books/${book.id}/file`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch download file URL');
      }

      const data = await response.json();

      const downloadResumable = FileSystem.createDownloadResumable(
        data.fileUrl,
        `${directory}${book.title}.epub`,
        {},
        (downloadProgress) => {
          const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress(progress);
        }
      );

      const result = await downloadResumable.downloadAsync();
      if (result) {
        await FileSystem.downloadAsync(
          book.coverImageUrl,
          `${directory}${book.title}.jpg`
        );
        setIsDownloaded(true);
        await addToCollectionIfNotExists("Downloaded");
      } else {
        console.error("Download failed");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to download file");
    } finally {
      setIsDownloading(false);
    }
  };

  const addToCollectionIfNotExists = async (collectionName: string) => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You need to be logged in to add books to your collection.");
      return;
    }

    try {
      const q = query(
        collection(firestore, "users", user.uid, collectionName),
        where("bookId", "==", book.id)
      );
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        await addDoc(collection(firestore, "users", user.uid, collectionName), {
          bookId: book.id,
          title: book.title,
          coverImageUrl: book.coverImageUrl,
          addedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error(`Error adding book to ${collectionName} collection:`, error);
      Alert.alert("Error", `Failed to add book to ${collectionName} collection.`);
    }
  };

  const handleAddToCollection = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You need to be logged in to add books to your collection.");
      return;
    }

    setIsLoading(true);

    try {
      const q = query(
        collection(firestore, "users", user.uid, "WantToRead"),
        where("bookId", "==", book.id)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docId = querySnapshot.docs[0].id;
        await deleteDoc(doc(firestore, "users", user.uid, "WantToRead", docId));
        setIsAddedToCollection(false);
        setIsLoading(false);
        return;
      }

      await addDoc(collection(firestore, "users", user.uid, "WantToRead"), {
        bookId: book.id,
        title: book.title,
        coverImageUrl: book.coverImageUrl,
        addedAt: new Date().toISOString(),
      });
      setIsAddedToCollection(true);
    } catch (error) {
      console.error("Error updating collection:", error);
      Alert.alert("Error", "Failed to update collection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: book.coverImageUrl }}
          cachePolicy={"memory-disk"}
          style={styles.bookImage}
          placeholder={require("../../assets/images/booksPlaceHolder.jpg")}
          placeholderContentFit="cover"
          contentFit="cover"
          transition={1000}
        />
      </View>
      <View style={styles.headerDetail}>
        <Text style={styles.title}>
          {book.title.length > 48 ? `${book.title.slice(0, 48)}...` : book.title}
        </Text>
        <Text style={styles.author}>{i18n.t('By')}: {book.author}</Text>
        <View style={styles.rating}>
          {[...Array(5)].map((_, index) => (
            <FontAwesome
              key={index}
              name="star"
              size={24}
              color={index < book.averageRating ? "gold" : "gray"}
            />
          ))}
          <Text style={styles.reviewCount}> ({book.reviewCount || 0})</Text>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          icon={isDownloaded ? "check-bold" : "download"}
          mode="contained"
          onPress={
            isDownloaded
              ? () =>
                  router.replace({
                    pathname: "/screens/bookModal",
                    params: {
                      fileUrl: `${FileSystem.documentDirectory}books/${book.title}/${book.title}.epub`,
                    },
                  })
              : handleDownload
          }
          buttonColor={isDownloaded ? "#FFBF00" : "orange"}
          textColor="black"
          style={styles.button}
          labelStyle={styles.buttonText}
          loading={isDownloading}
          disabled={ageRestrictionEnabled && 13 < book.ageRate}
        >
          {isDownloaded
            ? " Read "
            : isDownloading
            ? ` ${Math.round(downloadProgress * 100)}%`
            : "Download"}
        </Button>
        <Button
          icon={isAddedToCollection ? "check-bold" : "plus"}
          mode="contained"
          onPress={handleAddToCollection}
          buttonColor={isAddedToCollection ? "#FFBF00" : "orange"}
          textColor="black"
          style={styles.button}
          labelStyle={styles.buttonText}
          loading={isLoading}
        >
          {isAddedToCollection ? "Want to Read" : "Want to Read"}
        </Button>
      </View>
      <View style={styles.horizontalLine} />
      <View>
        <Text style={[styles.description, isRTL && { textAlign: "right" }]}>{book.shortDescription}</Text>
        <Text style={[styles.longDescription, isRTL && { textAlign: "right" }]}>
          {showMore ? book.longDescription : `${book.longDescription.slice(0, 200)}...`}
        </Text>
        <TouchableOpacity onPress={() => setShowMore(!showMore)}>
          <Text style={styles.showMoreText}>
            {showMore ? "Read Less" : "Read More"}
          </Text>
        </TouchableOpacity>
      </View>
      <View>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <View style={styles.bookInfo}>
            <Text style={styles.infoText}>Pages</Text>
            <FontAwesome name="files-o" size={50} color="black" />
            <Text style={styles.infoText}>{book.printLength}</Text>
          </View>
          <View style={styles.bookInfo}>
            <Text style={styles.infoText}>Language</Text>
            <FontAwesome name="language" size={50} color="black" />
            <Text style={styles.infoText}>{book.language}</Text>
          </View>
          <View style={styles.bookInfo}>
            <Text style={styles.infoText}>Publication Date</Text>
            <MaterialIcons name="date-range" size={50} color="black" />
            <Text style={styles.infoText}>{book.publicationDate}</Text>
          </View>
          <View style={styles.bookInfo}>
            <Text style={styles.infoText}>Publisher</Text>
            <MaterialIcons name="business" size={50} color="black" />
            <Text style={styles.infoText}>{book.publisher}</Text>
          </View>
          <View style={styles.bookInfo}>
            <Text style={styles.infoText}>Translator</Text>
            <MaterialIcons name="translate" size={50} color="black" />
            <Text style={styles.infoText}>{book.translator}</Text>
          </View>
          <View style={styles.bookInfo}>
            <Text style={styles.infoText}>Age Rating</Text>
            <FontAwesome name="ban" size={50} color="black" />
            <Text style={styles.infoText}>{book.ageRate?"+"+book.ageRate:"none"}</Text>
          </View>
        </ScrollView>
      </View>
      <Review bookId={book.id} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  bookImage: {
    width: 180,
    height: 270,
    alignSelf: "flex-start",
    backgroundColor: "white",
    shadowColor: "#000",
    elevation: 5,
  },
  imageContainer: {
    width: 190,
    height: 280,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  headerDetail: {
    width: width * 0.45,
    position: "absolute",
    padding: 4,
    alignSelf: "flex-end",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
    alignSelf: "center",
  },
  author: {
    fontSize: 20,
    paddingTop: 10,
    textAlign: "center",
  },
  rating: {
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 5,
  },
  reviewCount: {
    paddingTop: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  button: {
    textAlign: "center",
    marginTop: 5,
  },
  buttonText: {
    fontSize: 18,
  },
  description: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "bold",
  },
  longDescription: {
    marginVertical: 5,
    fontSize: 18,
    lineHeight: 24,
    textAlign: "justify",
  },
  showMoreText: {
    marginVertical: 5,
    fontWeight: "bold",
    fontSize: 18,
    color: "#0096FF",
    textAlign: "center",
  },
  bookInfo: {
    width: width/3,
    justifyContent: "center",
    alignItems: "center",
    borderBottomColor: "gray",
    borderBottomWidth: 1,
    borderTopColor: "gray",
    borderTopWidth: 1,
  },
  infoText: {
    padding: 10,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  horizontalLine: {
    height: 1,
    backgroundColor: "gray",
    marginVertical: 10,
  },
});

export default BookScreen;
