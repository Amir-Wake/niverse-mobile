/* eslint-disable react/no-unused-prop-types */

/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { forwardRef, useState } from "react";
import {
  ActivityIndicator,
  View,
  StyleSheet,
} from "react-native";
import {
  SearchResult as SearchResultType,
  useReader,
} from "@epubjs-react-native/core";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetFlatList,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { IconButton, Text } from "react-native-paper";
import SearchResult from "./SearchResult";
import { contrast } from "../fullReader/utils";
import i18n from "@/assets/languages/i18n";
import { Ionicons } from "@expo/vector-icons";
import * as Device from 'expo-device';

const isIpad = Device.deviceType === Device.DeviceType.TABLET;

interface Props {
  onClose: () => void;
}
export type Ref = BottomSheetModalMethods;

const SearchList = forwardRef<Ref, Props>(({ onClose }, ref) => {
  const {
    searchResults,
    goToLocation,
    search,
    clearSearchResults,
    isSearching,
    addAnnotation,
    removeAnnotationByCfi,
    theme,
    injectJavascript
  } = useReader();

  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<SearchResultType[]>(searchResults.results);
  const [page, setPage] = useState(1);

  const snapPoints = React.useMemo(() => ["95%"], []);

  const renderItem = React.useCallback(
    ({ item }: { item: SearchResultType }) => (
      <SearchResult
        searchTerm={searchTerm}
        searchResult={item}
        onPress={(searchResult) => {
          goToLocation(searchResult.cfi);
          addAnnotation("highlight", searchResult.cfi);
          setTimeout(() => {
            removeAnnotationByCfi(searchResult.cfi);
          }, 5000);
          clearSearchResults();
          setPage(1);
          setData([]);
          onClose();
        }}
      />
    ),
    [
      addAnnotation,
      clearSearchResults,
      goToLocation,
      onClose,
      removeAnnotationByCfi,
      searchTerm,
    ]
  );

  const header = React.useCallback(
    () => (
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: "lightgray",
        }}
      >
        <View style={styles.title}>
            <IconButton
              icon="close"
              size={isIpad?28:18}
              mode="contained-tonal"
              iconColor={contrast[theme.body.background]}
              style={{
                backgroundColor: "rgba(151, 151, 151, 0.25)",
                borderRadius: 20,
                padding: 0,
                margin: 0,
              }}
              onPress={()=>onClose()}
            />
          <View style={styles.searchSection}>
            <BottomSheetTextInput
              inputMode="search"
              returnKeyType="search"
              returnKeyLabel="Search"
              autoCorrect={false}
              autoCapitalize="none"
              defaultValue={searchTerm}
              style={styles.input}
              onSubmitEditing={(event) => {
                setSearchTerm(event.nativeEvent.text);
                clearSearchResults();
                setData([]);
                setPage(1);
                injectJavascript(`
                  (function() {
                    try {
                      console.log("Search initiated");
                      const page = ${1};
                      const limit = ${40};
                      const term = ${JSON.stringify(event.nativeEvent.text)};                
                      const reactNativeWebview = window.ReactNativeWebView !== undefined && window.ReactNativeWebView !== null
                        ? window.ReactNativeWebView
                        : window;
                
                      if (!term || term.trim() === "") {
                        reactNativeWebview.postMessage(
                          JSON.stringify({ type: 'onSearch', results: [], totalResults: 0 })
                        );
                        return;
                      }
                
                      Promise.all(
                        book.spine.spineItems.map((item) => {
                          return item.load(book.load.bind(book)).then(() => {
                            let results = item.find(term.trim());
                            const locationHref = item.href;
                
                            let [match] = flatten(book.navigation.toc).filter((chapter) => {
                              return book.canonical(chapter.href).includes(locationHref);
                            });
                
                            if (results.length > 0) {
                              results = results.map((result) => ({
                                ...result,
                                section: {
                                  ...match,
                                  index: book.navigation.toc.findIndex((elem) => elem.id === match?.id),
                                },
                              }));
                            }
                
                            return Promise.resolve(results);
                          });
                        })
                      )
                        .then((results) => {
                          const items = [].concat.apply([], results);
                          reactNativeWebview.postMessage(
                            JSON.stringify({
                              type: 'onSearch',
                              results: items.slice((page - 1) * limit, page * limit),
                              totalResults: items.length,
                            })
                          );
                        })
                        .catch((err) => {
                          console.error("Error during search:", err.message);
                          reactNativeWebview.postMessage(
                            JSON.stringify({ type: 'onSearch', results: [], totalResults: 0 })
                          );
                        });
                    } catch (error) {
                      console.error("Unexpected error in injected JavaScript:", error.message);
                      window.ReactNativeWebView.postMessage(
                        JSON.stringify({ type: 'onSearch', results: [], totalResults: 0 })
                      );
                    }
                  })();
                `);
                
              }}
            />
            <Ionicons
              name="search"
              size={20}
              style={styles.searchIcon}
              color="black"
            />
          </View>
        </View>

        {isSearching && (
          <View style={styles.title}>
            <Text
              variant="bodyMedium"
              style={{
                fontStyle: "italic",
                color: contrast[theme.body.background],
                fontSize: isIpad ? 24 : 18,
              }}
            >
              {i18n.t("searching")}
            </Text>
          </View>
        )}
      </View>
    ),
    [theme.body.background,onClose]
  );

  const footer = React.useCallback(
    () => (
      <View style={{ padding: 20 }}>
        {isSearching && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <ActivityIndicator animating />
            <Text
              variant="bodyMedium"
              style={{
                fontStyle: "italic",
                marginLeft: 5,
                color: contrast[theme.body.background],
                fontSize: isIpad ? 24 : 18,
              }}
            >
              {i18n.t("moreResult")}
            </Text>
          </View>
        )}

        {data.length > 0 &&
          data.length === searchResults.totalResults &&
          !isSearching && (
            <Text
              variant="bodyMedium"
              style={{
                fontStyle: "italic",
                textAlign: "center",
                color: contrast[theme.body.background],
                fontSize: isIpad ? 24 : 18,
              }}
            >
              {i18n.t("noMoreResult")}
            </Text>
          )}
      </View>
    ),
    [
      data.length,
      isSearching,
      searchResults.totalResults,
      theme.body.background,
    ]
  );

  const empty = React.useCallback(
    () => (
      <View style={{ padding: 20 }}>
        <Text
          variant="bodyMedium"
          style={{
            fontStyle: "italic",
            color: contrast[theme.body.background],
            textAlign: "center",
            fontSize: isIpad ? 24 : 18,
            paddingVertical: 20,
          }}
        >
          {i18n.t("noResult")}
        </Text>
      </View>
    ),
    [theme.body.background]
  );

  const handleClose = React.useCallback(() => {
    clearSearchResults();
    setPage(1);
    setData([]);
  }, [clearSearchResults]);

  const fetchMoreData = React.useCallback(() => {
    if (searchResults.results.length > 0 && !isSearching) {
      search(searchTerm, page + 1, 20);
      setPage(page + 1);
    }
  }, [isSearching, page, search, searchResults.results.length, searchTerm]);

  React.useEffect(() => {
    if (searchResults.results.length > 0) {
      setData((oldState) => [...oldState, ...searchResults.results]);
    }
  }, [clearSearchResults, searchResults]);

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={ref}
        index={1}
        snapPoints={snapPoints}
        enablePanDownToClose
        style={styles.container}
        onChange={(index) => {
          if (index === 0) onClose(); 
        }}
        handleIndicatorStyle={{
          backgroundColor: contrast[theme.body.background],
        }}
        backgroundStyle={{
          backgroundColor: theme.body.background,
          borderColor: contrast[theme.body.background],
          borderWidth: 1,
        }}
        onDismiss={handleClose}
        android_keyboardInputMode="adjustResize"
      >
        {header()}
        {/* <BottomSheetScrollView> */}
        <BottomSheetFlatList<SearchResultType>
          data={data}
          showsVerticalScrollIndicator={true}
          indicatorStyle={"black"}
          keyExtractor={(item, index) => item.cfi.concat(index.toString())}
          renderItem={renderItem}
          // ListHeaderComponent={header}
          ListFooterComponent={footer}
          ListEmptyComponent={empty}
          style={{ width: "100%" }}
          // maxToRenderPerBatch={20}
          // onEndReachedThreshold={0.2}
          // onEndReached={fetchMoreData}
        />
        {/* </BottomSheetScrollView> */}
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
});

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    marginBottom: 5,
  },
  searchSection: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#DCDCDC",
    borderColor: "black",
    borderWidth: 1,
    marginHorizontal: 10,
  },
  searchIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    padding: 10,
  },
});

export default SearchList;
