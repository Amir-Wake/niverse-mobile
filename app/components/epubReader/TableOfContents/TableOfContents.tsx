/* eslint-disable react/no-unused-prop-types */

/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { forwardRef, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import {
  Toc,
  Section as SectionType,
  useReader,
} from "@epubjs-react-native/core";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetFlatList,
} from "@gorhom/bottom-sheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { IconButton, Text } from "react-native-paper";
import Section from "./Section";
import { contrast } from "../fullReader/utils";
import i18n from "@/assets/languages/i18n";
import * as Device from 'expo-device';

const isIpad = Device.deviceType === Device.DeviceType.TABLET;

interface Props {
  onPressSection: (section: SectionType) => void;
  onClose: () => void;
}
export type Ref = BottomSheetModalMethods;

const TableOfContents = forwardRef<Ref, Props>(
  ({ onPressSection, onClose }, ref) => {
    const { toc, section, theme } = useReader();

    const [searchTerm, setSearchTerm] = useState("");
    const [data, setData] = useState<Toc>(toc);

    const snapPoints = React.useMemo(() => ["95%"], []);

    const renderItem = React.useCallback(
      ({ item }: { item: SectionType }) => (
        <Section
          searchTerm={searchTerm}
          isCurrentSection={section?.id === item?.id}
          section={item}
          onPress={(_section) => {
            onPressSection(_section);
          }}
        />
      ),
      [onPressSection, searchTerm, section?.id]
    );

    const header = React.useCallback(
      () => (
        <View
          style={{
            backgroundColor: theme.body.background,
            borderBottomColor: "gray",
            borderBottomWidth: 1,
            paddingBottom: 5,
          }}
        >
          <View style={styles.title}>
            <IconButton
              icon="close"
              size={isIpad?26:16}
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
            <Text
              variant="titleMedium"
              style={{
                color: contrast[theme.body.background],
                fontFamily: "helvetica",
                padding: 10,
                fontSize: isIpad ? 24 : 18,
              }}
            >
              {i18n.t("toc")}
            </Text>
          </View>
        </View>
      ),
      [onClose, theme.body.background, toc]
    );

    React.useEffect(() => {
      setData(toc);
    }, [toc]);
    return (
      <BottomSheetModalProvider>
        <BottomSheetModal
          ref={ref}
          index={1}
          snapPoints={snapPoints}
          enablePanDownToClose
          android_keyboardInputMode="adjustResize"
          onChange={(index) => {
            if (index === 0) onClose();
          }}
          handleIndicatorStyle={{
            backgroundColor: contrast[theme.body.background],
          }}
          style={{
            ...styles.container,
            backgroundColor: theme.body.background,
            borderColor: contrast[theme.body.background],
            borderWidth: 1,
            borderRadius: 10,
          }}
          handleStyle={{ backgroundColor: theme.body.background }}
          backgroundStyle={{ backgroundColor: theme.body.background }}
          onDismiss={() => setSearchTerm("")}
        >
          {header()}
          <BottomSheetFlatList
            data={data}
            showsVerticalScrollIndicator={true}
            indicatorStyle={"black"}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            style={{ width: "100%",marginBottom: 40}}
            maxToRenderPerBatch={20}
          />
        </BottomSheetModal>
      </BottomSheetModalProvider>
    );
  }
);

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
    marginTop: 10,
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
  input: {
    flex: 1,
    width: "100%",
    borderRadius: 10,
    fontSize: 16,
    lineHeight: 20,
    padding: 10,
  },
});

export default TableOfContents;
