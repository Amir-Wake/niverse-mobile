/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useReader, Annotation } from '@epubjs-react-native/core';
import {
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Button, Text } from 'react-native-paper';
import { contrast } from '../fullReader/utils';
import AnnotationForm from './AnnotationForm';
import AnnotationItem from './AnnotationItem';
import Selection from './utils';
import i18n from "@/assets/languages/i18n";

interface Props {
  selection: Selection | null;
  selectedAnnotation?: Annotation;
  annotations: Annotation[];
  onClose: () => void;
}
export type Ref = BottomSheetModalMethods;

 const AnnotationsList = forwardRef<Ref, Props>(
  ({ selection, selectedAnnotation, annotations, onClose }, ref) => {
    const { theme, removeAnnotation, goToLocation } = useReader();

    const snapPoints = React.useMemo(() => ['95%'], []);

    const renderItem = React.useCallback(
      // eslint-disable-next-line react/no-unused-prop-types
      ({ item }: { item: Annotation }) => (
        <AnnotationItem
          annotation={item}
          onPressAnnotation={(annotation) => {
            goToLocation(annotation.cfiRange);
            onClose();
          }}
          onRemoveAnnotation={(annotation) => {
            /**
             * Required for the "add note" scenario, as an "underline" and "mark" type annotation is created in it and both work as one...
             */
            if (annotation.data?.key) {
              const withMarkAnnotations = annotations.filter(
                ({ data }) => data.key === annotation.data.key
              );

              withMarkAnnotations.forEach((_annotation) =>
                removeAnnotation(_annotation)
              );
            } else {
              removeAnnotation(annotation);
            }
          }}
        />
      ),
      [annotations, goToLocation, onClose, removeAnnotation]
    );

    const header = React.useCallback(
      () => (
        <View style={{ backgroundColor: theme.body.background }}>
          <View style={[styles.title,{borderBottomColor: contrast[theme.body.background]}]}>
          <Button
              mode="text"
              textColor={contrast[theme.body.background]}
              onPress={onClose}
            >
              {i18n.t('close')}
            </Button>
            <Text
              variant="titleMedium"
              style={{ color: contrast[theme.body.background] }}
            >
              {i18n.t('annotations')}
            </Text>
          </View>

          {(selection || selectedAnnotation) && (
            <AnnotationForm
              annotation={selectedAnnotation}
              selection={selection}
              onClose={onClose}
            />
          )}
        </View>
      ),
      [onClose, selectedAnnotation, selection, theme.body.background]
    );

    return (
      <BottomSheetModalProvider>
        <BottomSheetModal
          ref={ref}
          index={1}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          onChange={(index) => {
            if (index === 0) onClose(); // Close the modal completely when swiped down
          }}
          android_keyboardInputMode="adjustResize"
          style={{
            ...styles.container,
            backgroundColor: theme.body.background,
            borderColor: contrast[theme.body.background],
            borderWidth: 1,
          }}
          handleStyle={{ backgroundColor: theme.body.background }}
          backgroundStyle={{ backgroundColor: theme.body.background }}
          handleIndicatorStyle={{
            backgroundColor: contrast[theme.body.background],
          }}
          onDismiss={onClose}
        >
          <BottomSheetFlatList<Annotation>
            data={annotations.filter(
              (annotation) =>
                !annotation?.data?.isTemp && annotation.type !== 'mark'
            )}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.cfiRange}
            renderItem={renderItem}
            ListHeaderComponent={header}
            style={{ width: '100%' }}
            maxToRenderPerBatch={20}
          />
        </BottomSheetModal>
      </BottomSheetModalProvider>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    borderBottomWidth: 1,
  },
  input: {
    width: '100%',
    borderRadius: 10,
    fontSize: 16,
    lineHeight: 20,
    padding: 8,
    backgroundColor: 'rgba(151, 151, 151, 0.25)',
  },
});

export default AnnotationsList;