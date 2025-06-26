//AIzaSyAH4vg-__dtrzfgdVzFT5NH9suuVc-jOnM
import React, { useState, useEffect, useRef } from "react";
import { useWindowDimensions, View, Platform, I18nManager, Clipboard, Share } from "react-native";
import {
  ReaderProvider,
  Reader,
  useReader,
  Themes,
  Bookmark,
  Annotation,
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
import AnnotationsList from "../Annotations/AnnotationsList";
import { COLORS } from "../Annotations/AnnotationForm";
import Translate from "../Translate/Translate";
import Settings from "../Settings/Settings";

interface ComponentProps {
  src: string;
  bookId: string;
}

interface StoredLocation {
  cfi: string;
}

function Component({ src, bookId }: ComponentProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const {
    theme,
    changeFontSize,
    goToLocation,
    currentLocation,
    bookmarks,
    getMeta,
    annotations,
    addAnnotation,
    removeAnnotation,
    goNext,
    goPrevious,
  } = useReader();

  const bookmarksListRef = useRef<BottomSheetModal>(null);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const searchListRef = useRef<BottomSheetModal>(null);
  const annotationsListRef = useRef<BottomSheetModal>(null);
  const translateRef = useRef<BottomSheetModal>(null);
  const settingsRef = useRef<BottomSheetModal>(null);

  const [tempMark, setTempMark] = useState<Annotation | null>(null);
  const [currentFontSize, setCurrentFontSize] = useState(18);
  const [defTheme, setDefTheme] = useState(Themes.LIGHT);
  const [bookmarkData, setBookmarkData] = useState<Bookmark[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [locationActive, setLocationActive] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [storedLocation, setStoredLocation] = useState<StoredLocation | null>(null);
  const [storedAnnotations, setStoredAnnotations] = useState<Annotation[]>([]);
  const [selection, setSelection] = useState<{ cfiRange: string; text: string } | null>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | undefined>(undefined);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");

  useEffect(() => {
    const saveAnnotations = async () => {
      if (isActive) {
        try {
          const annotationData = JSON.stringify({ annotations });
          await AsyncStorage.setItem(`annotations_${bookId}`, annotationData);
        } catch (error) {
          console.error("Failed to save annotations", error);
        }
      }
    };
    saveAnnotations();
  }, [annotations]);

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
        const storedBookmarks = await AsyncStorage.getItem(`bookmarks_${bookId}`);
        const storedTheme = await AsyncStorage.getItem("currentTheme");
        const storedFontSize = await AsyncStorage.getItem("currentFontSize_" + bookId);
        const getStoredLocation = await AsyncStorage.getItem(`location_${bookId}`);
        const storedAnnotations = await AsyncStorage.getItem(`annotations_${bookId}`);

        if (storedAnnotations) {
          const annotationsStored = JSON.parse(storedAnnotations);
          setStoredAnnotations(annotationsStored.annotations);
        }
        if (getStoredLocation) {
          setStoredLocation(JSON.parse(getStoredLocation) as StoredLocation);
        }
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
      setCurrentFontSize(currentFontSize + 1);
      changeFontSize(`${currentFontSize + 1}px`);
      storePreference("currentFontSize_" + bookId, JSON.stringify(currentFontSize + 1));
    }
  };

  const decreaseFontSize = () => {
    if (currentFontSize > MIN_FONT_SIZE) {
      setCurrentFontSize(currentFontSize - 1);
      changeFontSize(`${currentFontSize - 1}px`);
      storePreference("currentFontSize_" + bookId, JSON.stringify(currentFontSize - 1));
    }
  };

  const handleLocationChange = async () => {
    try {
      const locationData = JSON.stringify({
        cfi: currentLocation?.start.cfi,
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

  const handleOnReady = async () => {
    if (getMeta().language === "ku" || getMeta().language === "ar") {
      I18nManager.isRTL = true;
    } else if (getMeta().language === "en") {
      I18nManager.isRTL = false;
    }
    changeFontSize(`${currentFontSize}px`);
  };

  const handleLocationReady = async () => {
    setIsActive(true);
    goToLocation(storedLocation?.cfi || "");
  };

  const handleOnFinish = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("stored_userId");
      const Books = await AsyncStorage.getItem("Books_" + storedUserId);
      const parsedBooks = JSON.parse(Books || "[]");
      const book = parsedBooks.find((book: { bookId: string }) => book.bookId === bookId);
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

  return (
    <View
      style={{
        flex: 1,
        paddingTop: Platform.OS === "ios" ? insets.top - 10 : insets.top,
        backgroundColor: theme.body.background,
      }}
    >
      <Header
        currentText={currentText}
        openSettings={() => settingsRef.current?.present()}
      />
      <View style={{ flex: 1 }}>
        <View
          style={{ flex: 1 }}
          onTouchStart={(e) => {
            const touchX = e.nativeEvent.locationX;
            const touchWidth = width * 0.07;
            if (touchX < touchWidth) {
              getMeta().language === "ku" || getMeta().language === "ar"
                ? goNext()
                : goPrevious();
            } else if (touchX > width - touchWidth) {
              getMeta().language === "ku" || getMeta().language === "ar"
                ? goPrevious()
                : goNext();
            }
          }}
        >
          <Reader
            src={src}
            width={width}
            flow="paginated"
            spread="none"
            enableSelection
            fileSystem={useFileSystem}
            defaultTheme={defTheme}
            waitForLocationsReady
            onReady={handleOnReady}
            onSwipeLeft={() => setLocationActive(true)}
            onSwipeRight={() => setLocationActive(true)}
            onLocationsReady={handleLocationReady}
            onChangeBookmarks={handleUpdateBookmark}
            initialBookmarks={bookmarkData}
            initialLocation={storedLocation?.cfi || ""}
            onFinish={handleOnFinish}
            onWebViewMessage={setCurrentText}
            injectedJavascript={'document.body.style.overflow = "hidden";'}
            initialAnnotations={storedAnnotations}
            onAddAnnotation={(annotation) => {
              if (annotation.type === "highlight" && annotation.data?.isTemp) {
                setTempMark(annotation);
              }
            }}
            onPressAnnotation={(annotation) => {
              setSelectedAnnotation(annotation);
              annotationsListRef.current?.present();
            }}
            menuItems={[
              {
                label: "🟡",
                action: (cfiRange) => {
                  addAnnotation("highlight", cfiRange, undefined, {
                    color: COLORS[2],
                  });
                  return true;
                },
              },
              {
                label: "🔴",
                action: (cfiRange) => {
                  addAnnotation("highlight", cfiRange, undefined, {
                    color: COLORS[0],
                  });
                  return true;
                },
              },
              {
                label: "🟢",
                action: (cfiRange) => {
                  addAnnotation("highlight", cfiRange, undefined, {
                    color: COLORS[3],
                  });
                  return true;
                },
              },
              {
                label: "Add Note",
                action: (cfiRange, text) => {
                  setSelection({ cfiRange, text });
                  addAnnotation("highlight", cfiRange, { isTemp: true });
                  annotationsListRef.current?.present();
                  return true;
                },
              },
              {
                label: "Translate",
                action: (cfiRange, text) => {
                  setSelection({ cfiRange, text });
                  setSelectedLanguage(getMeta().language);
                  translateRef.current?.present();
                  return true;
                },
              },
              {
                label: "Copy",
                action: (cfiRange, text) => {
                  setSelection({ cfiRange, text });
                  Clipboard.setString(text);
                  return true;
                },
              },
              {
                label: "Share",
                action: (cfiRange, text) => {
                  setSelection({ cfiRange, text });
                  Share.share({ message: text });
                  return true;
                },
              },
            ]}
          />
        </View>
        <SearchList ref={searchListRef} onClose={() => searchListRef.current?.dismiss()} />
        <BookmarksList ref={bookmarksListRef} onClose={() => bookmarksListRef.current?.dismiss()} />
        <TableOfContents
          ref={bottomSheetRef}
          onPressSection={(section) => {
            goToLocation(section.href.split("/")[1]);
            bottomSheetRef.current?.dismiss();
          }}
          onClose={() => bottomSheetRef.current?.dismiss()}
        />
        <AnnotationsList
          ref={annotationsListRef}
          selection={selection}
          selectedAnnotation={selectedAnnotation}
          annotations={annotations}
          onClose={() => {
            setTempMark(null);
            setSelection(null);
            setSelectedAnnotation(undefined);
            if (tempMark) removeAnnotation(tempMark);
            annotationsListRef.current?.dismiss();
          }}
        />
        <Translate
          ref={translateRef}
          onClose={() => translateRef.current?.dismiss()}
          selectedText={selection?.text || ""}
          selectedLanguage={selectedLanguage}
        />
      </View>
      <View style={{ bottom: 10, width: width }}>
        <Footer />
      </View>
      <Settings
        ref={settingsRef}
        onClose={() => settingsRef.current?.dismiss()}
        increaseFontSize={increaseFontSize}
        decreaseFontSize={decreaseFontSize}
        onOpenAnnotationsList={() => {
          bookmarksListRef.current?.dismiss();
          searchListRef.current?.dismiss();
          bottomSheetRef.current?.dismiss();
          annotationsListRef.current?.present();
        }}
        onOpenBookmarksList={() => {
          searchListRef.current?.dismiss();
          bottomSheetRef.current?.dismiss();
          annotationsListRef.current?.dismiss();
          bookmarksListRef.current?.present();
        }}
        onOpenTocList={() => {
          bookmarksListRef.current?.dismiss();
          searchListRef.current?.dismiss();
          annotationsListRef.current?.dismiss();
          bottomSheetRef.current?.present();
        }}
        onPressSearch={() => {
          bookmarksListRef.current?.dismiss();
          bottomSheetRef.current?.dismiss();
          annotationsListRef.current?.dismiss();
          searchListRef.current?.present();
        }}
      />
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
