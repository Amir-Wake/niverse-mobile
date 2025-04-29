import React, { useState, useEffect, useRef } from "react";
import { useWindowDimensions, View, Platform, I18nManager } from "react-native";
import {
  ReaderProvider,
  Reader,
  useReader,
  Themes,
  Bookmark,
} from "@epubjs-react-native/core";
import { useFileSystem } from "@epubjs-react-native/expo-file-system";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "./Header";
import Footer from "./Footer";
import { MAX_FONT_SIZE, MIN_FONT_SIZE } from "./utils";
import BookmarksList from "../Bookmarks/BookmarksList";
import TableOfContents from "../TableOfContents/TableOfContents";
import SearchList from "../Search/SearchList";

interface ComponentProps {
  src: string;
  bookId: string;
}

function Component({ src, bookId }: ComponentProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const {
    theme,
    changeFontSize,
    goToLocation,
    currentLocation,
    bookmarks,
    getMeta,
    injectJavascript,
    goNext,
  } = useReader();

  const bookmarksListRef = useRef<BottomSheetModal>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const searchListRef = useRef<BottomSheetModal>(null);
  const [currentFontSize, setCurrentFontSize] = useState(18);
  const [defTheme, setDefTheme] = useState(Themes.LIGHT);
  const [bookmarkData, setBookmarkData] = useState<Bookmark[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [locationActive, setLocationActive] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [styleIndex, setStyleIndex] = useState(0);

  useEffect(() => {
    if (bookmarks && isActive) {
      setBookmarkData(bookmarks);
      handleUpdateBookmark();
    }
  }, [bookmarks]);

  useEffect(() => {
    if (currentLocation && locationActive) {
      handleLocationChange();
    }
  }, [currentLocation]);

  useEffect(() => {
    const getStoredTheme = async () => {
      try {
        const storedBookmarks = await AsyncStorage.getItem(
          `bookmarks_${bookId}`
        );
        const storedTheme = await AsyncStorage.getItem("currentTheme");
        const storedFontSize = await AsyncStorage.getItem(
          "currentFontSize_" + bookId
        );
        if (storedTheme) {
          setDefTheme(JSON.parse(storedTheme));
        }
        if (storedBookmarks) {
          const bookmarksStored = JSON.parse(storedBookmarks);
          setBookmarkData(bookmarksStored.bookmarks);
        }
        if (storedFontSize) {
          setCurrentFontSize(parseInt(storedFontSize));
          changeFontSize(`${parseInt(storedFontSize)}px`);
        }
      } catch (error) {
        console.error("Failed to retrieve stored theme", error);
      }
    };

    getStoredTheme();
  }, []);

  const storePreference = async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error("Failed to save preference", error);
    }
  };

  const increaseFontSize = () => {
    if (currentFontSize < MAX_FONT_SIZE) {
      let tempCurrentLocation = currentLocation?.start.cfi;
      setCurrentFontSize(currentFontSize + 1);
      changeFontSize(`${currentFontSize + 1}px`);
      tempCurrentLocation && goToLocation(tempCurrentLocation);
      storePreference(
        "currentFontSize_" + bookId,
        JSON.stringify(currentFontSize + 1)
      );
    }
  };

  const decreaseFontSize = () => {
    if (currentFontSize > MIN_FONT_SIZE) {
      let tempCurrentLocation = currentLocation?.start.cfi;
      setCurrentFontSize(currentFontSize - 1);
      changeFontSize(`${currentFontSize - 1}px`);
      tempCurrentLocation && goToLocation(tempCurrentLocation);
      storePreference(
        "currentFontSize_" + bookId,
        JSON.stringify(currentFontSize - 1)
      );
    }
  };

  const switchFontFamily = () => {
    setStyleIndex((prev) => (prev + 1) % 3);
    if (styleIndex === 0) {
      boldStyle();
      AsyncStorage.setItem("fontFamily_" + bookId, "boldStyle");
    } else if (styleIndex === 1) {
      justifyStyle();
      AsyncStorage.setItem("fontFamily_" + bookId, "justifyStyle");
    } else if (styleIndex === 2) {
      spacedStyle();
      AsyncStorage.setItem("fontFamily_" + bookId, "spacedStyle");
    }
  };

  const handleLocationChange = async () => {
    let locationcfi = "";
    try {
      if (!currentText) return;
      const parsed =
        typeof currentText === "string" ? JSON.parse(currentText) : currentText;
      if (parsed.type === "onCurrentText") {
        locationcfi = parsed.cfi;
      }
    } catch (error) {
      console.error("Failed to parse currentText:", error);
      return;
    }
    try {
      const locationData = JSON.stringify({
        src,
        cfi: locationcfi,
      });
      await AsyncStorage.setItem(`location_${bookId}`, locationData);
    } catch (error) {
      console.error("Failed to save location", error);
    }
  };

  const handleUpdateBookmark = async () => {
    if (bookmarks) {
      try {
        const bookmarkData = JSON.stringify({ src, bookmarks });
        await AsyncStorage.setItem(`bookmarks_${bookId}`, bookmarkData);
      } catch (error) {
        console.error("Failed to save bookmarks", error);
      }
    }
  };
  const changeFont = async () => {
    const storedFontFamily = await AsyncStorage.getItem(`fontFamily_${bookId}`);
    if (storedFontFamily) {
      if (storedFontFamily === "boldStyle") {
        boldStyle();
      } else if (storedFontFamily === "justifyStyle") {
        justifyStyle();
      } else if (storedFontFamily === "spacedStyle") {
        spacedStyle();
      }
      const storedLocation = await AsyncStorage.getItem(`location_${bookId}`);
      let location;
      if (storedLocation) {
        location = JSON.parse(storedLocation);
      }
      goToLocation(location.cfi);
    }
  };

  const handleLocationReady = async () => {
    const storedLocation = await AsyncStorage.getItem(`location_${bookId}`);
    let location;
    if (storedLocation) {
      location = JSON.parse(storedLocation);
    }
    goToLocation(location.cfi);
    goNext();
    changeFont();
  };

  const handleOnFinish = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("stored_userId");
      const Books = await AsyncStorage.getItem("Books_" + storedUserId);
      const parsedBooks = JSON.parse(Books || "[]");
      const book = parsedBooks.find(
        (book: { bookId: string }) => book.bookId === bookId
      );
      if (book) {
        const updatedBook = { ...book, finished: true };
        AsyncStorage.setItem(
          "Books_" + storedUserId,
          JSON.stringify(
            parsedBooks.map((b: { bookId: string }) =>
              b.bookId === bookId ? updatedBook : b
            )
          )
        );
      }
    } catch (error) {
      console.error("Failed to update finished books list", error);
    }
  };
  const boldStyle = () => {
    injectJavascript(`
      rendition.getContents().forEach(contents => {
        contents.document.querySelectorAll('p').forEach(p => {
          p.style.fontWeight = 'bold';
          p.style.lineHeight = '1.4';
      const currentAlign = window.getComputedStyle(p).textAlign;
      if (currentAlign !== 'center') {
        p.style.textAlign = 'inherit'; // Reset alignment if not center
      }        });
      });
    `);
    AsyncStorage.setItem("fontFamily_" + bookId, "boldStyle");
  };
  const justifyStyle = () => {
    injectJavascript(`
      rendition.getContents().forEach(contents => {
        contents.document.querySelectorAll('p').forEach(p => {
          p.style.fontWeight = 'normal';
          p.style.lineHeight = '1.4';
      const currentAlign = window.getComputedStyle(p).textAlign;
      if (currentAlign !== 'center') {
        p.style.textAlign = 'justify'; // Apply justify alignment if not center
      }        });
      });
    `);
    AsyncStorage.setItem("fontFamily_" + bookId, "justifyStyle");
  };

  const spacedStyle = () => {
    injectJavascript(`
      rendition.getContents().forEach(contents => {
        contents.document.querySelectorAll('p').forEach(p => {
          p.style.fontWeight = 'normal';
          p.style.lineHeight = '1.6';
      const currentAlign = window.getComputedStyle(p).textAlign;
      if (currentAlign !== 'center') {
        p.style.textAlign = 'inherit'; // Reset alignment if not center
      }        });
      });
    `);
    AsyncStorage.setItem("fontFamily_" + bookId, "spacedStyle");
  };

  const handleOnReady = () => {
    if (getMeta().language == "ku" || "ar") {
      I18nManager.isRTL = true;
    }
    if (getMeta().language == "en") {
      I18nManager.isRTL = false;
    }
    setIsActive(true);
    changeFontSize(`${currentFontSize}px`);
    changeFont();
  };
  return (
    <View
      style={{
        flex: 1,
        paddingTop: Platform.OS === "ios" ? insets.top - 10 : insets.top,
        backgroundColor: theme.body.background,
      }}
    >
      <Header
        currentFontSize={currentFontSize}
        increaseFontSize={increaseFontSize}
        decreaseFontSize={decreaseFontSize}
        switchFontFamily={switchFontFamily}
        onPressSearch={() => searchListRef.current?.present()}
        onOpenBookmarksList={() => bookmarksListRef.current?.present()}
        onOpenTocList={() => bottomSheetRef.current?.present()}
        currentText={currentText}
      />
      <View style={{ flex: 1 }}>
        <Reader
          src={src}
          width={width}
          flow={"paginated"}
          spread="none"
          enableSelection={false}
          fileSystem={useFileSystem}
          defaultTheme={defTheme}
          waitForLocationsReady
          onSwipeLeft={() => setLocationActive(true)}
          onSwipeRight={() => setLocationActive(true)}
          onLocationsReady={handleLocationReady}
          onChangeBookmarks={handleUpdateBookmark}
          initialBookmarks={bookmarkData}
          onFinish={handleOnFinish}
          onWebViewMessage={(message) => {
            setCurrentText(message);
          }}
          injectedJavascript={'document.body.style.overflow = "hidden";'}
          onReady={handleOnReady}
        />
        <SearchList
          ref={searchListRef}
          onClose={() => searchListRef.current?.dismiss()}
        />
        <BookmarksList
          ref={bookmarksListRef}
          onClose={() => bookmarksListRef.current?.dismiss()}
        />
        <TableOfContents
          ref={bottomSheetRef}
          onPressSection={(section) => {
            goToLocation(section.href.split("/")[1]);
            bottomSheetRef.current?.dismiss();
          }}
          onClose={() => bottomSheetRef.current?.dismiss()}
        />
      </View>
      <View style={{ bottom: 10, width: width }}>
        <Footer />
      </View>
    </View>
  );
}

interface FullReaderProps {
  src: string;
  bookId: string;
}

export default function FullReader({ src, bookId }: FullReaderProps) {
  return (
    <ReaderProvider>
      <Component src={src} bookId={bookId} />
    </ReaderProvider>
  );
}
