import * as React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  Platform,
  Keyboard,
  Dimensions,
  TextInput,
} from "react-native";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { IconButton } from "react-native-paper";
import i18n from "@/assets/languages/i18n";
import Ionicons from "react-native-vector-icons/Ionicons";
import { auth } from "@/firebase";

const { height } = Dimensions.get("window");

export default function Library() {
  interface Book {
    title: string;
    coverImagePath: string;
    filePath: string;
  }

  const [books, setBooks] = React.useState<Book[]>([]);
  const [search, setSearch] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    if (!isSearching) {
      fetchBooks();
      const interval = setInterval(async () => {
        const directory = `${FileSystem.documentDirectory}${auth.currentUser?.uid}/books/`;
        const bookFolders = await FileSystem.readDirectoryAsync(directory);
        if (bookFolders.length !== books.length) {
          fetchBooks();
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isSearching]);

  const fetchBooks = async () => {
    try {
      const directory = `${FileSystem.documentDirectory}${auth.currentUser?.uid}/books/`;
      const directoryInfo = await FileSystem.getInfoAsync(directory);

      if (!directoryInfo.exists) {
        setBooks([]);
        return;
      }

      const bookFolders = await FileSystem.readDirectoryAsync(directory);

      const bookData = await Promise.all(
        bookFolders.map(async (folder) => {
          const coverImagePath = `${directory}${folder}/${folder}.jpg`;
          const filePath = `${directory}${folder}/${folder}.epub`;
          const coverImageExists = await FileSystem.getInfoAsync(coverImagePath);
          const fileExists = await FileSystem.getInfoAsync(filePath);

          if (coverImageExists.exists && fileExists.exists) {
            return {
              title: folder,
              coverImagePath,
              filePath,
            };
          }
          return null;
        })
      );

      setBooks(bookData.filter((book) => book !== null));
    } catch (error) {
      console.error("Error reading books directory:", error);
      Alert.alert("Error", "Failed to read books directory");
    }
  };

  const updateSearch = (search: string) => {
    setSearch(search);
    if (search === "") {
      setIsSearching(false);
      fetchBooks();
    } else {
      setIsSearching(true);
      const filteredBooks = books.filter((book) =>
        book.title.toLowerCase().includes(search.toLowerCase())
      );
      setBooks(filteredBooks);
    }
  };

  const confirmDeleteBook = (folder: string) => {
    Alert.alert(
      i18n.t("deleteBook"),
      i18n.t("deleteBookText") + ` ${folder}`,
      [
        { text: i18n.t("cancel"), style: "cancel" },
        { text: i18n.t("ok"), onPress: () => deleteBook(folder) },
      ],
      { cancelable: false }
    );
  };

  const deleteBook = async (folder: string) => {
    try {
      const directory = `${FileSystem.documentDirectory}${auth.currentUser?.uid}/books/${folder}`;
      await FileSystem.deleteAsync(directory, { idempotent: true });
      fetchBooks();
    } catch (error) {
      console.error("Error deleting book folder:", error);
      Alert.alert("Error", "Failed to delete book folder");
    }
  };

  const renderItem = ({ item, index }: { item: Book; index: number }) => (
    <View style={styles.bookContainer} key={index}>
      <TouchableOpacity
        onPress={() =>
          router.navigate({
            pathname: "/inside/bookReader",
            params: { fileUrl: item.filePath },
          })
        }
        onLongPress={() => confirmDeleteBook(item.title)}
      >
        <Image
          source={{ uri: item.coverImagePath }}
          style={styles.bookImage}
          cachePolicy={"memory-disk"}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder={i18n.t("searchForBooks")}
          placeholderTextColor="black"
          style={styles.searchInput}
          value={search}
          onChangeText={updateSearch}
          onFocus={() => setIsSearching(true)}
        />
        <TouchableOpacity
          onPress={() => setIsSearching(!isSearching)}
          style={styles.searchButton}
        >
          <Ionicons name="search" size={30} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.collectionContainer}>
        <TouchableOpacity
          style={styles.collection}
          onPress={() => router.navigate("../collections")}
        >
          <IconButton icon={"reorder-horizontal"} size={26} />
          <Text style={styles.collectionText}>{i18n.t("collections")}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={books}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.container}
        onScrollBeginDrag={Keyboard.dismiss}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 0 : height * 0.06,
    backgroundColor: "white",
  },
  searchContainer: {
    flexDirection: "row",
    margin: 10,
    backgroundColor: "#E5E4E2",
    borderRadius: 10,
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    padding: 10,
    color: "black",
  },
  searchButton: {
    padding: 10,
  },
  container: {
    padding: 10,
  },
  row: {
    justifyContent: "space-between",
  },
  bookContainer: {
    flex: 1,
    padding: 10,
    margin: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5.84,
  },
  collectionContainer: {
    borderColor: "#404040",
    borderWidth: 1,
  },
  collection: {
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  collectionText: {
    fontSize: 20,
    paddingVertical: 15,
  },
  bookImage: {
    width: 160,
    height: 260,
    borderRadius: 10,
    elevation: 5,
  },
});
