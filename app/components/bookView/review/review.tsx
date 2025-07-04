import { FontAwesome, Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import axios from "axios";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
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

const Review: React.FC<ReviewProps> = ({ bookId }) => {
  const apiLink = `${process.env.EXPO_PUBLIC_REVIEWS_API}`;
  const [reviews, setReviews] = useState<Review[]>([]);
  const firestore = getFirestore();
  const router = useRouter();

  const CACHE_KEY = `reviews_${bookId}`;
  const CACHE_EXPIRY = 24 * 60 * 60 * 1000;

  const fetchReviews = async () => {
    try {
      const cachedReviews = await AsyncStorage.getItem(CACHE_KEY);
      const cachedTime = await AsyncStorage.getItem(`${CACHE_KEY}_time`);
      const now = new Date().getTime();

      if (cachedReviews && cachedTime && now - parseInt(cachedTime) < CACHE_EXPIRY) {
        setReviews(JSON.parse(cachedReviews));
        return;
      }

      const response = await axios.get(`${apiLink}${bookId}/reviews`);
      const reviewsWithUserDetails = await Promise.all(
        response.data
          .filter((review: any) => review.comment && review.title)
          .slice(0, 5)
          .map(async (review: any) => {
            const userDoc = await getDoc(doc(firestore, "users", review.userId));
            const userData = userDoc.data();
            return {
              ...review,
              userName: userData?.name || i18n.t("anonymous"),
              userImage: userData?.profileImageUrl || "",
            };
          })
      );

      setReviews(reviewsWithUserDetails);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(reviewsWithUserDetails));
      await AsyncStorage.setItem(`${CACHE_KEY}_time`, now.toString());
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [bookId]);

  return (
    <View style={styles.container}>
      <View style={styles.writeReview}>
        <TouchableOpacity
          style={{ alignItems: "center", alignContent: "center" }}
          onPress={() => router.push(`/inside/writeReview?bookId=${bookId}`)}
        >
          <Text style={{ fontSize: isIpad?20:16, textAlign: "center", fontWeight: "bold" }}>
            {i18n.t("leaveReview")}
          </Text>
          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, starIndex) => (
              <FontAwesome key={starIndex} name="star-o" size={isIpad?32:26} color="gold" />
            ))}
          </View>
        </TouchableOpacity>
      </View>
      {reviews.map((review, index) => (
        <View key={index} style={styles.reviewContainer}>
          <View style={styles.userContainer}>
            {review.userImage ? (
              <Image source={{ uri: review.userImage }} style={styles.userImage} />
            ) : (
              <Ionicons name="person-circle-outline" size={40} color="black" />
            )}
            <Text style={styles.userName}>{review.userName}</Text>
          </View>
          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, starIndex) => (
              <FontAwesome
                key={starIndex}
                name={starIndex < review.rating ? "star" : "star-o"}
                size={24}
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
      <View style={styles.writeReview}>
        <TouchableOpacity onPress={() => router.push(`../../../inside/allReviews?bookId=${bookId}`)}>
          <Text style={{ fontSize: isIpad?20:16, textAlign: "center", fontWeight: "bold" }}>
            {i18n.t("allReviews")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  reviewContainer: {
    padding: 10,
    backgroundColor: "#fff",
    marginVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  writeReview: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userName: {
    fontSize: 18,
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
    fontSize: 20,
    fontWeight: "bold",
    paddingVertical: 4,
    textAlign: "center",
  },
  reviewComment: {
    fontSize: 20,
    textAlign: "center",
  },
});

export default Review;
