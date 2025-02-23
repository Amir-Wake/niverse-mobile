/* eslint-disable react/no-unused-prop-types */

/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { forwardRef, useState } from "react";
import {
  ActivityIndicator,
  View,
  StyleSheet,
  TouchableOpacity,
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
import { Text } from "react-native-paper";
import SearchResult from "./SearchResult";
import { contrast } from "../fullReader/utils";
import i18n from "@/assets/languages/i18n";
import { Ionicons } from "@expo/vector-icons";

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
  } = useReader();

  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<SearchResultType[]>(searchResults.results);
  const [page, setPage] = useState(1);

  const snapPoints = React.useMemo(() => ["60%", "95%"], []);

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
          }, 3000);
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
          <View>
            <TouchableOpacity
              onPress={() => {
                setSearchTerm("");
                onClose();
              }}
              style={{ padding: 10 }}
            >
              <Text
                variant="titleMedium"
                style={{
                  color: contrast[theme.body.background],
                  fontFamily: "helvetica",
                }}
              >
                {i18n.t("close")}
              </Text>
            </TouchableOpacity>
          </View>
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
                search(event.nativeEvent.text, 1, 20);
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
        index={2}
        snapPoints={snapPoints}
        enablePanDownToClose
        style={styles.container}
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
          maxToRenderPerBatch={20}
          onEndReachedThreshold={0.2}
          onEndReached={fetchMoreData}
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  searchSection: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#DCDCDC",
    borderColor: "black",
    borderWidth: 1,
  },
  searchIcon: {
    padding: 10,
  },
  input: {
    flex: 1,
    paddingTop: 10,
    paddingRight: 10,
    paddingBottom: 10,
    paddingLeft: 10,
  },
});

export default SearchList;
