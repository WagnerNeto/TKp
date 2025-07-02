import React, { useState } from "react";
import { View, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { Text } from "react-native-paper";
import { firebase } from '../firebase/firebaseConfig';
import bcrypt from "bcryptjs"; // Importa o bcryptjs
import 'react-native-get-random-values'; 

import Background from "../components/Background";
import Logo from "../components/Logo";
import Header from "../components/Header";
import Button from "../components/Button";
import TextInput from "../components/TextInput";
import BackButton from "../components/BackButton";
import { theme } from "../core/theme";
import { emailValidator } from "../helpers/emailValidator";
import { passwordValidator } from "../helpers/passwordValidator";
import { nameValidator } from "../helpers/nameValidator";

export default function RegisterScreen({ navigation }: { navigation: any }) {
  const [name, setName] = useState({ value: "", error: "" });
  const [email, setEmail] = useState({ value: "", error: "" });
  const [password, setPassword] = useState({ value: "", error: "" });
  const [loading, setLoading] = useState(false);

  // Configura o bcrypt para usar o fallback
bcrypt.setRandomFallback(require('react-native-get-random-values').randomUUID);

const onSignUpPressed = async () => {
  try {
    // Validações
    const nameError = nameValidator(name.value);
    const emailError = emailValidator(email.value);
    const passwordError = passwordValidator(password.value);
    
    if (nameError || emailError || passwordError) {
      setName({ ...name, error: nameError });
      setEmail({ ...email, error: emailError });
      setPassword({ ...password, error: passwordError });
      return;
    }

    // Gera o salt e o hash da senha
    const salt = bcrypt.genSaltSync(10);  // Gera o salt
    const hashedPassword = bcrypt.hashSync(password.value, salt);  // Cria o hash da senha

    // Armazenar o usuário no Firestore
    await firebase.firestore().collection("UsersClient").add({
      name: name.value,
      email: email.value,
      password: hashedPassword,  // Armazena o hash no banco
      userType: "Usuário Comum",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    Alert.alert("Sucesso", "Usuário cadastrado com sucesso!");
    navigation.reset({
      index: 0,
      routes: [{ name: "Tabs" }],
    });
  } catch (error) {
    console.error("Erro ao realizar o cadastro:", error);
    Alert.alert("Erro", "Falha ao realizar o cadastro. Tente novamente.");
  } finally {
      setLoading(false);
    }
  };

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Logo />
      <Header>Crie sua conta</Header>
      <TextInput
        label="Nome"
        returnKeyType="next"
        value={name.value}
        onChangeText={(text: any) => setName({ value: text, error: "" })}
        error={!!name.error}
        errorText={name.error} description={undefined}      />
      <TextInput
        label="Email"
        returnKeyType="next"
        value={email.value}
        onChangeText={(text: any) => setEmail({ value: text, error: "" })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address" description={undefined}      />
      <TextInput
        label="Senha"
        returnKeyType="done"
        value={password.value}
        onChangeText={(text: any) => setPassword({ value: text, error: "" })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry description={undefined}      />
      <Button
        mode="contained"
        onPress={onSignUpPressed}
        style={{ marginTop: 24 }}
        loading={loading}
      >
        Criar conta
      </Button>
      <View style={styles.row}>
        <Text>Já tem uma conta?</Text>
        <TouchableOpacity onPress={() => navigation.replace("LoginScreen")}>
          <Text style={styles.link}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  link: {
    fontWeight: "bold",
    color: theme.colors.primary,
    marginLeft: 4,
  },
});
