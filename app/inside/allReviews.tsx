import { FontAwesome, Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from "react-native";
import axios from "axios";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import i18n from "@/assets/languages/i18n";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from "expo-device";

interface ReviewProps {
  bookId: string;
}

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  createdDate: string;
  userName: string;
  userImage: string;
}

const isIpad = Device.deviceType === Device.DeviceType.TABLET;

const AllReviews: React.FC<ReviewProps> = () => {
  const apiLink = `${process.env.EXPO_PUBLIC_REVIEWS_API}`;
  const [reviews, setReviews] = useState<Review[]>([]);
  const firestore = getFirestore();
  const router = useRouter();
  const { bookId } = useLocalSearchParams();

  const fetchReviews = async () => {
    try {
      const cachedReviews = await AsyncStorage.getItem(`allreviews_${bookId}`);
      const cachedTimestamp = await AsyncStorage.getItem(`allreviews_timestamp_${bookId}`);
      const currentTime = new Date().getTime();

      if (cachedReviews && cachedTimestamp && currentTime - parseInt(cachedTimestamp) < 24 * 60 * 60 * 1000) {
        setReviews(JSON.parse(cachedReviews));
        return;
      }

      const response = await axios.get(`${apiLink}${bookId}/reviews`);
      const reviewsWithUserDetails = await Promise.all(
        response.data.map(async (review: any) => {
          const userDoc = await getDoc(doc(firestore, "users", review.userId));
          const userData = userDoc.data();
          return {
            ...review,
            userName: userData?.name || "Anonymous",
            userImage: userData?.profileImageUrl || "",
          };
        })
      );

      const filteredReviews = reviewsWithUserDetails.filter(
        (review) => review.title && review.comment
      );

      setReviews(filteredReviews);
      await AsyncStorage.setItem(`allreviews_${bookId}`, JSON.stringify(filteredReviews));
      await AsyncStorage.setItem(`allreviews_timestamp_${bookId}`, currentTime.toString());
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [bookId]);

  return (
    <SafeAreaView style={styles.container}>
        <View style={{padding: 10}}>
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome name="remove" size={28} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.writeReview}>
          <TouchableOpacity
            style={{ alignItems: "center", alignContent: "center" }}
            onPress={() =>
              router.push(`./writeReview?bookId=${bookId}`)
            }
          >
            <Text
              style={{ fontSize: isIpad?20:16, textAlign: "center", fontWeight: "bold" }}
            >
              {i18n.t("leaveReview")}
            </Text>
            <View style={styles.ratingContainer}>
              {[...Array(5)].map((_, starIndex) => (
                <FontAwesome
                  key={starIndex}
                  name="star-o"
                  size={isIpad?30:24}
                  color="gold"
                />
              ))}
            </View>
          </TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1, backgroundColor: "#f0f0f0", padding: 10 }}>
        {reviews.map((review, index) => (
          <View key={index} style={styles.reviewContainer}>
            <View style={styles.userContainer}>
              {review.userImage ? (
                <Image
                  source={{ uri: review.userImage }}
                  style={styles.userImage}
                />
              ) : (
                <Ionicons
                  name="person-circle-outline"
                  size={40}
                  color="black"
                />
              )}
              <Text style={styles.userName}>{review.userName}</Text>
            </View>
            <View style={styles.ratingContainer}>
              {[...Array(5)].map((_, starIndex) => (
                <FontAwesome
                  key={starIndex}
                  name={starIndex < review.rating ? "star" : "star-o"}
                  size={isIpad?30:24}
                  color="gold"
                />
              ))}
            </View>
            <Text style={styles.createdDate}>
              {review.createdDate ? review.createdDate.slice(0, 17) : ""}
            </Text>
            <Text style={styles.reviewTitle}>{review.title}</Text>
            <Text style={[styles.reviewComment,{textAlign: review.comment.startsWith("rtl")?"right":"left"}]}>{review.comment.replace(/^rtl|^ltr/, '')}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    padding: 10,
    paddingTop: 10,
  },
  reviewContainer: {
    flex: 1,
    padding: 20,
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#FFFFFF",
  },
  writeReview: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  userImage: {
    width: isIpad?60:40,
    height: isIpad?60:40,
    borderRadius: 40,
  },
  userName: {
    fontSize: isIpad?24:18,
    padding: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    marginVertical: 4,
  },
  createdDate: {
    paddingVertical: 4,
    fontWeight: "300",
  },
  reviewTitle: {
    fontSize: isIpad?26:20,
    fontWeight: "bold",
    paddingVertical: 4,
    textAlign: "center",
  },
  reviewComment: {
    fontSize: isIpad?26:20,
  },
});

export default AllReviews;
