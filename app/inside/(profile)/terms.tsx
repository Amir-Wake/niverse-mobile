import { ScrollView, View, Text } from "react-native";
import React from "react";
import { useRouter } from "expo-router";

const Terms = () => {
  const router = useRouter();
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView
        style={{ padding: 20, backgroundColor: "#FAF9F6", borderRadius: 20 }}
      >
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 10 }}>
          Terms and Conditions
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>
          Welcome to our app. These terms and conditions outline the rules and
          regulations for the use of our app.
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>
          <Text style={{ fontWeight: "bold" }}>Acceptance of Terms:</Text> By
          accessing and using our app, you accept and agree to be bound by the
          terms and provision of this agreement. If you do not agree to abide by
          the above, please do not use this service.
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>
          <Text style={{ fontWeight: "bold" }}>Changes to Terms:</Text> We
          reserve the right to modify these terms at any time. You should check
          this page periodically for changes. By using this app after we post
          any changes, you agree to accept those changes, whether or not you
          have reviewed them.
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>
          <Text style={{ fontWeight: "bold" }}>User Responsibilities:</Text> You
          are responsible for your use of the app and for any consequences
          thereof. You agree to use the app in compliance with all applicable
          local, state, national, and international laws, rules, and
          regulations. You must not use the service in any harmful manner,
          including but not limited to misleading others, swearing, or engaging
          in any form of discrimination. This includes, but is not limited to,
          actions that could cause harm to others, spread misinformation, use
          offensive language, or discriminate based on race, gender, religion,
          nationality, disability, sexual orientation, or any other
          characteristic protected by law. Any such behavior is strictly
          prohibited and may result in immediate termination of your access to
          the app, without prior notice or liability. In addition, we reserve
          the right to take any necessary legal action, report your behavior to
          relevant authorities, and cooperate with law enforcement to ensure
          compliance with these terms. You are also expected to respect the
          moral and cultural values of others, and refrain from sharing any
          content that is hateful, disrespectful, or offensive to any individual
          or group. This includes, but is not limited to, content that promotes
          violence, hatred, or discrimination against any person or group based
          on their race, ethnicity, religion, gender, sexual orientation, or any
          other characteristic.
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>
          <Text style={{ fontWeight: "bold" }}>Termination:</Text> We may
          terminate or suspend access to our app immediately, without prior
          notice or liability, for any reason whatsoever, including without
          limitation if you breach the terms. This includes, but is not limited
          to, any behavior that is harmful, misleading, offensive, or
          discriminatory. We are committed to maintaining a safe and respectful
          environment for all users, and any actions that undermine this goal
          will not be tolerated. In the event of termination, we reserve the
          right to take any necessary legal action, report your behavior to
          relevant authorities, and cooperate with law enforcement to ensure
          compliance with these terms. We also reserve the right to terminate or
          suspend access to our app if we believe that your actions are in
          violation of the moral and cultural values that we strive to uphold.
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 10 }}>
          <Text style={{ fontWeight: "bold" }}>Governing Law:</Text> These terms
          shall be governed and construed in accordance with the laws of our
          country, without regard to its conflict of law provisions. We are
          committed to protecting the moral and cultural values of our
          community, and we expect all users to adhere to these values. Any
          disputes arising from the use of our app will be resolved in
          accordance with the laws of our country, and we will cooperate fully
          with law enforcement and other authorities to ensure compliance with
          these terms. We also reserve the right to take any necessary legal
          action to protect our rights and the rights of our users, and to
          ensure that our app remains a safe and respectful environment for all.
        </Text>
        <Text style={{ fontSize: 16, marginBottom: 50 }}>
          <Text style={{ fontWeight: "bold" }}>Contact Us:</Text> If you have
          any questions about these Terms, please contact us.
        </Text>
      </ScrollView>
    </View>
  );
};

export default Terms;
