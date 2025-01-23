import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { IconButton } from "react-native-paper";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function Collections() {
  const router = useRouter();

  const collections = [
    { name: 'Want to Read', route: '/collections/wantToRead', icon: 'logout-variant' },
    { name: 'Downloaded', route: '/collections/downloaded', icon: 'download' },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableOpacity
        style={{ flexDirection: "row", alignItems: "center" }}
        onPress={() => router.back()}
      >
        <Ionicons
          name="chevron-back-outline"
          size={35}
          style={{ padding: 10 }}
        />
        <Text style={{ fontSize: 20 }}>Library</Text>
      </TouchableOpacity>
    <View style={styles.container}>
      <Text style={styles.collectionsHeader}>Collections</Text>
      {collections.map((collection, index) => (
        <TouchableOpacity
          key={index}
          style={styles.collectionItem}
          onPress={() => router.push(collection.route as any)}
        >
          <IconButton icon={collection.icon} size={30}/> 
          <Text style={styles.collectionText}>{collection.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  collectionsHeader: {
    fontSize: 36,
    padding: 10,
  },
  collectionItem: {
    flexDirection: "row",
    width: "100%",
    borderColor: "lightgrey",
    borderWidth: 1,
    padding: 10,
  },
  collectionText: {
    fontSize: 20,
    padding: 15,
  },
});
