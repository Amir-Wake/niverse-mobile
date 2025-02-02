import { FontAwesome, Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import axios from "axios";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
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

const AllReviews: React.FC<ReviewProps> = () => {
  const apiLink = `${process.env.EXPO_PUBLIC_REVIEWS_API}`;
  const [reviews, setReviews] = useState<Review[]>([]);
  const firestore = getFirestore();
  const router = useRouter();
  const { bookId } = useLocalSearchParams();

  const fetchReviews = async () => {
    try {
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
      setReviews(reviewsWithUserDetails);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [bookId]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={{padding: 10}}>
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome name="arrow-left" size={28} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.writeReview}>
          <TouchableOpacity
            style={{ alignItems: "center", alignContent: "center" }}
            onPress={() =>
              router.push(`/components/review/writeReview?bookId=${bookId}`)
            }
          >
            <Text
              style={{ fontSize: 16, textAlign: "center", fontWeight: "bold" }}
            >
              Leave or edit your review
            </Text>
            <View style={styles.ratingContainer}>
              {[...Array(5)].map((_, starIndex) => (
                <FontAwesome
                  key={starIndex}
                  name="star-o"
                  size={24}
                  color="gold"
                />
              ))}
            </View>
          </TouchableOpacity>
        </View>
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
                  size={24}
                  color="gold"
                />
              ))}
            </View>
            <Text style={styles.createdDate}>
              {review.createdDate ? review.createdDate.slice(0, 17) : ""}
            </Text>
            <Text style={styles.reviewTitle}>{review.title}</Text>
            <Text style={styles.reviewComment}>{review.comment}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
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
  },
  reviewComment: {
    fontSize: 20,
  },
});

export default AllReviews;
