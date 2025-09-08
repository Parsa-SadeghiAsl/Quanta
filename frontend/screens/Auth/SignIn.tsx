// src/screens/Auth/SignIn.tsx
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator"; // Adjust path if needed

// Define props type for type safety with navigation
type Props = NativeStackScreenProps<RootStackParamList, 'SignIn'>;

export default function SignIn({ navigation }: Props) {
  const { signIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      await signIn(username, password);
    } catch (e: any) {
      setError("Invalid credentials. Please try again.");
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
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
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />
      <View style={styles.buttonContainer}>
        <Button title="Sign In" onPress={handleSubmit} />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Don't have an account? Sign Up"
          onPress={() => navigation.navigate("SignUp")} // This navigates to the SignUp screen
          color="#666"
        />
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