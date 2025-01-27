import * as React from 'react';
import { useWindowDimensions } from 'react-native';
import { Reader, ReaderProvider } from '@epubjs-react-native/core';
import { useFileSystem } from '@epubjs-react-native/expo-file-system';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Header from './Header';
import  SearchList  from './SearchList';

function Inner() {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const searchListRef = React.useRef<BottomSheetModal>(null);
  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
    >
      <Header onPressSearch={() => searchListRef.current?.present()} />

      <Reader
        src="file:///var/mobile/Containers/Data/Application/E1238B9D-33A4-4A84-9160-E04EFD498602/Documents/ExponentExperienceData/@amir19225/ebookd/books/The Enchanted April/The Enchanted April.epub"
        height={height * 0.8}
        fileSystem={useFileSystem}
      />

      <SearchList
        ref={searchListRef}
        onClose={() => searchListRef.current?.dismiss()}
      />
    </GestureHandlerRootView>
  );
}

export default function Search() {
  return (
    <ReaderProvider>
      <Inner />
    </ReaderProvider>
  );
}
