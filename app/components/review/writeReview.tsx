import { FontAwesome } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../../../firebase";
import axios from "axios";
import { useRouter, useLocalSearchParams } from "expo-router";

const WriteReview: React.FC = () => {
    const apiLink = `${process.env.EXPO_PUBLIC_REVIEWS_API}`;
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState("");
    const [comment, setComment] = useState("");
    const [reviewExists, setReviewExists] = useState(false);
    const user = auth.currentUser;
    const router = useRouter();
    const { bookId } = useLocalSearchParams();

    useEffect(() => {
        if (!user) return;
        const fetchUserReview = async () => {
            try {
                const response = await axios.get(
                    `${apiLink}${bookId}/reviews/${user.uid}`
                );
                if (!response.data[0]) return;
                setRating(response.data[0].rating);
                setTitle(response.data[0].title);
                setComment(response.data[0].comment);
                setReviewExists(true);
            } catch (error) {
                console.error("Error fetching user review:", error);
            }
        };
        fetchUserReview();
    }, [user, bookId]);

    const handleSubmit = async () => {
        if (!rating || !user) return;
        try {
            const reviewData = {
                rating,
                title,
                comment,
                userId: user.uid,
            };
            if (reviewExists) {
                await axios.put(`${apiLink}${bookId}/reviews/${user.uid}`, reviewData);
            } else {
                await axios.post(`${apiLink}${bookId}/review`, reviewData);
            }
            setRating(0);
            setTitle("");
            setComment("");
            router.back();
        } catch (error) {
            console.error("Error submitting review:", error);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ padding: 10, backgroundColor: "#fff", flex: 1 }}>
                <View>
                    <TouchableOpacity onPress={() => router.back()}>
                        <FontAwesome name="close" size={28} color="black" />
                    </TouchableOpacity>
                </View>
                <View style={{ marginVertical: 20, padding: 10 }}>
                    <Text style={styles.headerText}>Rate & Review</Text>
                    <Text style={styles.subHeaderText}>
                        Share your thoughts about this book
                    </Text>
                </View>
                <View style={styles.centeredView}>
                    <View style={styles.ratingContainer}>
                        {[...Array(5)].map((_, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => setRating(index + 1)}
                            >
                                <FontAwesome
                                    name={index < rating ? "star" : "star-o"}
                                    size={45}
                                    color="gold"
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.titleInput}
                            placeholder="Review Title"
                            value={title}
                            onChangeText={setTitle}
                            placeholderTextColor="#888"
                        />
                        <View style={styles.separator} />
                        <TextInput
                            style={styles.commentInput}
                            placeholder="What did you like or dislike?"
                            value={comment}
                            onChangeText={setComment}
                            multiline
                            placeholderTextColor="#888"
                        />
                    </View>
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitButtonText}>Submit</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        width: "100%",
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
    },
    titleInput: {
        width: "100%",
        height: 40,
        textAlign: "center",
        color: "black",
    },
    commentInput: {
        width: "100%",
        height: 100,
        padding: 10,
        color: "black",
    },
    separator: {
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    submitButton: {
        backgroundColor: "#000",
        padding: 10,
        width: "100%",
        borderRadius: 10,
        alignItems: "center",
        marginVertical: 10,
    },
    submitButtonText: {
        color: "#fff",
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
});

export default WriteReview;
