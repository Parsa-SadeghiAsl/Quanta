// src/screens/Auth/SignUp.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { useNavigation } from "@react-navigation/native";

export default function SignUp() {
  const { register } = useAuth();
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!username || !email || !password) {
      setError("All fields are required.");
      return;
    }
    try {
      await register(username, email, password);
      // Navigation will happen automatically via AppNavigator's state change
    } catch (e: any) {
      setError("Failed to register. Please try again.");
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="none"
        onChangeText={setUsername}
        value={username}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={setEmail}
        value={email}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      <View style={styles.buttonContainer}>
      <Button title="Register" onPress={handleSubmit} />
      </View>
      <View style={styles.buttonContainer}>
      <Button title="Back to Sign In" onPress={() => navigation.goBack()} />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ccc", marginBottom: 15, padding: 10, borderRadius: 8 },
  error: { color: "red", marginBottom: 10, textAlign: "center" },
  buttonContainer: { marginVertical: 5 },

});