import React, { useState } from "react";
import { Alert } from "react-native";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { firebase } from "../firebase/firebaseConfig"; // Certifique-se de que a configuração está correta
import { app } from "../firebase/firebaseConfig"; // Configuração Firebase

import Background from "../components/Background";
import BackButton from "../components/BackButton";
import Logo from "../components/Logo";
import Header from "../components/Header";
import TextInput from "../components/TextInput";
import Button from "../components/Button";
import { emailValidator } from "../helpers/emailValidator";

export default function ResetPasswordScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState({ value: "", error: "" });
  const [loading, setLoading] = useState(false);

  // Função para verificar se o email existe na tabela "usersclient"
  const checkEmailInFirestore = async (email: string) => {
    const usersClientRef = firebase.firestore().collection("usersclient");
    const snapshot = await usersClientRef.where("email", "==", email).get();

    return !snapshot.empty;
  };

  const sendResetPasswordEmailHandler = async () => {
    const emailError = emailValidator(email.value);
    if (emailError) {
      setEmail({ ...email, error: emailError });
      return;
    }

    setLoading(true);

    try {
      // Verifica se o email existe na coleção "usersclient"
      const emailExists = await checkEmailInFirestore(email.value);

      if (!emailExists) {
        setLoading(false);
        Alert.alert("Erro", "Nenhum usuário encontrado com este email.");
        return;
      }

      const auth = getAuth(app);

      // Se o email existir, envia o link para redefinir a senha
      await sendPasswordResetEmail(auth, email.value);

      setLoading(false);
      Alert.alert(
        "Email enviado",
        "Verifique sua caixa de entrada para o link de redefinição de senha.",
        [{ text: "OK", onPress: () => navigation.navigate("LoginScreen") }]
      );
    } catch (error: any) {
      setLoading(false);
      let errorMessage = "Ocorreu um erro. Tente novamente.";

      if (error.code === "auth/user-not-found") {
        errorMessage = "Nenhum usuário encontrado com este email.";
      }

      Alert.alert("Erro", errorMessage);
    }
  };

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Logo />
      <Header>Redefinir sua senha</Header>
      <TextInput
        label="Email"
        returnKeyType="done"
        value={email.value}
        onChangeText={(text: any) => setEmail({ value: text, error: "" })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
        description="Você receberá um email com o link de redefinição."
      />
      <Button
        mode="contained"
        onPress={sendResetPasswordEmailHandler}
        loading={loading}
        disabled={loading}
        style={{ marginTop: 16 }}
      >
        Continuar
      </Button>
    </Background>
  );
}
