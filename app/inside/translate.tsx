import { View, Text, ScrollView } from 'react-native'
import React, { useEffect } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { GoogleGenAI } from "@google/genai";
import removeMarkdown from 'remove-markdown';

export default function Translate() {
  const apiKEY = `${process.env.EXPO_PUBLIC_GEN_API_KEY}`;
  const [aiResponse, setAiResponse] = React.useState<string | null>(null);
  const ai = new GoogleGenAI({ apiKey: apiKEY });
  const params = useLocalSearchParams()
  const { textInput, textLanguage } = params as {
    textInput: string
    textLanguage: string
  }
  useEffect(() => {
  async function translateAi() {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: "وەرگێڕ کوردی،ئینگلیزی"+"'"+textInput+"'",
    });
    const plainText = removeMarkdown(response.text || '');

    setAiResponse(plainText ?? null);
  }
    translateAi();
}, [textInput]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ height: 1, backgroundColor: 'black', width: '90%' }} />
      <ScrollView>
        
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 20, lineHeight: 30, textAlign: 'center'  }}>
            {aiResponse || "Translating..."}
          </Text>
        </View>
        <Text style={{ fontSize: 13, textAlign: 'center', lineHeight: 30, color: 'black', padding: 20, marginTop: 20 }}>
          This is a beta version of the translation tool using AI. Please note that the translation may not be perfect and should be used for informational purposes only.
        </Text>
      </ScrollView>
    </View>
  )
}