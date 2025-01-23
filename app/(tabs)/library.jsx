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
  Dimensions
} from "react-native";
import * as FileSystem from "expo-file-system";
import { Link, useRouter } from "expo-router";
import { Image } from "expo-image";
import { IconButton, Searchbar } from "react-native-paper";

const { height, width } = Dimensions.get("window");

export default function Library() {
  const [books, setBooks] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const router = useRouter();
  const [isSearching, setIsSearching] = React.useState(false);

  React.useEffect(() => {
    if (!isSearching) {
      fetchBooks();
      const interval = setInterval(async () => {
        const directory = `${FileSystem.documentDirectory}books/`;
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
      const directory = `${FileSystem.documentDirectory}books/`;
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

  const updateSearch = (search) => {
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

  const confirmDeleteBook = (folder) => {
    Alert.alert(
      "Delete Book",
      "Are you sure you want to delete this book?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: () => deleteBook(folder) },
      ],
      { cancelable: false }
    );
  };

  const deleteBook = async (folder) => {
    try {
      const directory = `${FileSystem.documentDirectory}books/${folder}`;
      await FileSystem.deleteAsync(directory, { idempotent: true });
      fetchBooks();
    } catch (error) {
      console.error("Error deleting book folder:", error);
      Alert.alert("Error", "Failed to delete book folder");
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.bookContainer} key={index}>
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/screens/bookModal",
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
      <Searchbar
        placeholder="Search for a book..."
        onChangeText={updateSearch}
        iconColor="black"
        value={search}
        style={styles.searchContainer}
      />
      <View style={styles.collectionContainer}>
        <TouchableOpacity style={styles.collection} onPress={() => router.push("/collections/collectionLists")}>
          <IconButton icon={"reorder-horizontal"} size={26} />
          <Text style={styles.collectionText}>Collections</Text>
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
    paddingTop: Platform.OS == "ios" ? 0 : height * 0.06,
    backgroundColor: "white",
  },
  searchContainer: {
    margin: 10,
    backgroundColor: "#E5E4E2",
    borderRadius: 10,
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
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#404040",
  },
  bookImage: {
    width: 160,
    height: 260,
    contentFit: "contentFit",
    borderRadius: 10,
    elevation: 5,
  },
});
