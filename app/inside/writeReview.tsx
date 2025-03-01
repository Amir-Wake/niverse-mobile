import { FontAwesome } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "@/firebase";
import axios, { AxiosError } from "axios";
import { useRouter, useLocalSearchParams } from "expo-router";
import i18n from "@/assets/languages/i18n";

interface ReviewData {
    rating: number;
    title: string;
    comment: string;
    userId: string;
}

const WriteReview: React.FC = () => {
    const apiLink = `${process.env.EXPO_PUBLIC_REVIEWS_API}`;
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState("");
    const [comment, setComment] = useState("");
    const [reviewExists, setReviewExists] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>("");
    
    const user = auth.currentUser;
    const router = useRouter();
    const { bookId } = useLocalSearchParams();

    const isKurdishArabicScript = (text: string) => {
        const kurdishArabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\u06A9\u06C5\u06D5\u06D2\u06D3]/;
        kurdishArabicRegex.test(text)? setComment('rtl'+text): setComment(text);
        return kurdishArabicRegex.test(text);
      };

    useEffect(() => {
        if (!user || !bookId) {
            router.back();
            return;
        }
        
        const fetchUserReview = async () => {
            try {
                const response = await axios.get<ReviewData[]>(
                    `${apiLink}${bookId}/reviews/${user.uid}`
                );
                if (!response.data?.[0]) return;
                
                const review = response.data[0];
                setRating(review.rating);
                setTitle(review.title);
                setComment(review.comment);
                setReviewExists(true);
            } catch (error) {
                const axiosError = error as AxiosError;
                setError(axiosError.message);
                Alert.alert("Error", "Failed to load your review");
            }
        };
        
        fetchUserReview();
    }, [user, bookId]);

    const handleSubmit = async () => {
        if (!rating || !user) {
            Alert.alert("Error", "Please provide a rating");
            return;
        }

        setIsLoading(true);
        setError("");
        try {
            const reviewData: ReviewData = {
                rating,
                title: title,
                comment: comment,
                userId: user.uid,
            };

            const endpoint = reviewExists
                ? `${apiLink}${bookId}/reviews/${user.uid}`
                : `${apiLink}${bookId}/review`;

            await (reviewExists
                ? axios.put(endpoint, reviewData)
                : axios.post(endpoint, reviewData));

            router.back();
        } catch (error) {
            const axiosError = error as AxiosError;
            setError(axiosError.message);
            Alert.alert("Error", "Failed to submit review");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <TouchableOpacity 
                    onPress={() => router.back()}
                    accessibilityLabel="Close review form"
                >
                    <FontAwesome name="close" size={28} color="black" />
                </TouchableOpacity>

                <View style={styles.headerContainer}>
                    <Text style={styles.headerText}>{i18n.t("rateReview")}</Text>
                    <Text style={styles.subHeaderText}>
                        {i18n.t("reviewSubHeading")}
                    </Text>
                </View>

                <View style={styles.centeredView}>
                    <View style={styles.ratingContainer}>
                        {[...Array(5)].map((_, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => setRating(index + 1)}
                                accessibilityLabel={`Rate ${index + 1} stars`}
                            >
                                <FontAwesome
                                    name={index < rating ? "star" : "star-o"}
                                    size={45}
                                    color={COLORS.gold}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.titleInput}
                            placeholder={i18n.t("title")}
                            value={title}
                            onChangeText={setTitle}
                            placeholderTextColor={COLORS.placeholder}
                            accessibilityLabel="Review title"
                        />
                        <Text style={{textAlign: "center",padding: 10}}>
                            {i18n.t("comment")}
                        </Text>
                        <TextInput
                            style={[styles.commentInput,{textAlign: comment.startsWith('rtl') ? 'right' : 'left'}]}
                            value={comment.startsWith('rtl') ? comment.slice(3) : comment}
                            onChangeText={(text)=>isKurdishArabicScript(text)}
                            placeholderTextColor={COLORS.placeholder}
                            accessibilityLabel="Review comment"
                        />
                    </View>

                    <TouchableOpacity 
                        style={[styles.submitButton, !rating && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={!rating || isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <Text style={styles.submitButtonText}>{i18n.t("submit")}</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const COLORS = {
    gold: '#FFD700',
    black: '#000000',
    white: '#FFFFFF',
    separator: '#CCCCCC',
    placeholder: '#888888',
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 10,
        backgroundColor: COLORS.white,
        flex: 1,
    },
    inputContainer: {
        width: "100%",
    },
    titleInput: {
        width: "100%",
        height: 40,
        textAlign: "center",
        color: COLORS.black,
        borderColor: "gray",
        borderWidth: 1,
        borderRadius: 10,
        
    },
    commentInput: {
        width: "100%",
        height: 100,
        padding: 10,
        color: COLORS.black,
        borderColor: "gray",
        borderWidth: 1,
        borderRadius: 10,
    },
    separator: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.separator,
    },
    submitButton: {
        backgroundColor: COLORS.black,
        padding: 10,
        width: "80%",
        borderRadius: 10,
        alignItems: "center",
        marginVertical: 10,
    },
    submitButtonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: "bold",
    },
    centeredView: {
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 20,
    },
    headerText: {
        fontSize: 28,
        textAlign: "center",
        fontWeight: "bold",
    },
    subHeaderText: {
        fontSize: 16,
        textAlign: "center",
        fontWeight: "200",
        marginVertical: 10,
    },
    ratingContainer: {
        flexDirection: "row",
        marginVertical: 8,
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
    headerContainer: {
        marginVertical: 20,
        padding: 10,
    },
});

export default WriteReview;
