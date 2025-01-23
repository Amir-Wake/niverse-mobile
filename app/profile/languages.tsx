import { View, Text, TouchableOpacity, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { setLanguage, getLanguage } from "../../assets/languages/i18n";

const Languages = () => {
    const router = useRouter();
    const [currentLanguage, setCurrentLanguage] = useState<string>("en");

    useEffect(() => {
        const fetchLanguage = async () => {
            const language = await getLanguage();
            setCurrentLanguage(language);
        };

        fetchLanguage();
    }, []);

    const handleLanguageChange = async (language: string) => {
        await setLanguage(language);
        Alert.alert("Language Changed", "The app will now refresh to apply the new language.", [
            {
                text: "OK",
                onPress: () => {
                    router.replace("/");
                },
            },
        ]);
    };

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
                <Text style={{ fontSize: 20 }}>Profile</Text>
            </TouchableOpacity>
            <View style={{ padding: 20 }}>
                <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>
                    Select Language
                </Text>
                <View style={{ borderWidth: 1, borderRadius: 10, borderColor: "#ccc", backgroundColor: "#fff" }}>
                    <TouchableOpacity
                        style={{
                            padding: 10,
                            backgroundColor: currentLanguage === 'en' ? '#ddd' : '#fff',
                            borderTopLeftRadius: 10,
                            borderTopRightRadius: 10,
                        }}
                        onPress={() => handleLanguageChange('en')}
                    >
                        <Text style={{ fontSize: 24 }}>English</Text>
                    </TouchableOpacity>
                    <View style={{ height: 1, backgroundColor: "#ccc" }} />
                    <TouchableOpacity
                        style={{
                            padding: 10,
                            backgroundColor: currentLanguage === 'ar' ? '#ddd' : '#fff',
                        }}
                        onPress={() => handleLanguageChange('ar')}
                    >
                        <Text style={{ fontSize: 24 }}>العربیە</Text>
                    </TouchableOpacity>
                    <View style={{ height: 1, backgroundColor: "#ccc" }} />
                    <TouchableOpacity
                        style={{
                            padding: 10,
                            backgroundColor: currentLanguage === 'ku' ? '#ddd' : '#fff',
                            borderBottomLeftRadius: 10,
                            borderBottomRightRadius: 10,
                        }}
                        onPress={() => handleLanguageChange('ku')}
                    >
                        <Text style={{ fontSize: 24 }}>کوردی</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default Languages;
