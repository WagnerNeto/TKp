import React, { useState, useEffect } from "react";
import { TouchableOpacity, StyleSheet, View, Alert } from "react-native";
import { Text } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import bcrypt from "bcryptjs";

import Background from "../components/Background";
import Logo from "../components/Logo";
import Header from "../components/Header";
import Button from "../components/Button";
import TextInput from "../components/TextInput";
import BackButton from "../components/BackButton";
import { theme } from "../core/theme";
import { emailValidator } from "../helpers/emailValidator";
import { passwordValidator } from "../helpers/passwordValidator";
import { firebase } from "../firebase/firebaseConfig";

export default function LoginScreen({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState({ value: "", error: "" });
  const [password, setPassword] = useState({ value: "", error: "" });
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    checkForStoredCredentials();
  }, []);

  // Verifica se há credenciais armazenadas
  const checkForStoredCredentials = async () => {
    try {
      const storedEmail = await SecureStore.getItemAsync("userEmail");
      const storedPasswordHash = await SecureStore.getItemAsync("userPasswordHash");

      if (storedEmail && storedPasswordHash) {
        promptBiometricLogin(storedEmail, storedPasswordHash);
      }
    } catch (error) {
      console.error("Erro ao verificar credenciais armazenadas:", error);
    }
  };

  // Autenticação biométrica
  const promptBiometricLogin = async (storedEmail: string, storedPasswordHash: string) => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      if (!compatible || !enrolled) return;

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Autenticação Biométrica",
      });

      if (result.success) {
        // Verificar credenciais nas coleções
        const loginSuccess = await attemptBiometricLogin(storedEmail, storedPasswordHash);
        if (!loginSuccess) {
          //Alert.alert("Erro", "Login biométrico falhou.");
        }
      } else {
        //Alert.alert("Erro", "Autenticação biométrica falhou.");
      }
    } catch (error) {
      console.error("Erro no login biométrico:", error);
      //Alert.alert("Erro", "Falha ao realizar login com biometria.");
    }
  };

  // Tentativa de login com biometria
  const attemptBiometricLogin = async (storedEmail: string, storedPasswordHash: string) => {
    try {
      // Verificar nas coleções
      const userSnapshot = await firebase
        .firestore()
        .collection("users")
        .where("email", "==", storedEmail)
        .get();

      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();

        if (bcrypt.compareSync(storedPasswordHash, userData.password)) {
          //Alert.alert("Sucesso", `Login como ${userData.userType} realizado!`);
          navigation.reset({
            index: 0,
            routes: [{ name: "AdminTabs" }], // Administradores/Afiliados
          });
          return true;
        }
      }

      const clientSnapshot = await firebase
        .firestore()
        .collection("UsersClient")
        .where("email", "==", storedEmail)
        .get();

      if (!clientSnapshot.empty) {
        const clientDoc = clientSnapshot.docs[0];
        const clientData = clientDoc.data();

        if (bcrypt.compareSync(storedPasswordHash, clientData.password)) {
          //Alert.alert("Sucesso", "Login como usuário comum realizado!");
          navigation.reset({
            index: 0,
            routes: [{ name: "UserTabs" }], // Usuários comuns
          });
          return true;
        }
      }

      //Alert.alert("Erro", "Credenciais armazenadas inválidas.");
      return false;
    } catch (error) {
      //console.error("Erro no login com biometria:", error);
      return false;
    }
  };

  // Login manual
  const onLoginPressed = async () => {
    if (loading) return;
  
    const emailError = emailValidator(email.value);
    const passwordError = passwordValidator(password.value);
  
    if (emailError || passwordError) {
      setEmail({ ...email, error: emailError });
      setPassword({ ...password, error: passwordError });
      return;
    }
  
    setLoading(true);
    try {
      const adminOrAffiliateSnapshot = await firebase.firestore().collection("users").where("email", "==", email.value).get();
  
      if (!adminOrAffiliateSnapshot.empty) {
        const userDoc = adminOrAffiliateSnapshot.docs[0];
        const userData = userDoc.data();
  
        console.log("Dados do usuário:", userData);
  
        if (!userData.password) {
          throw new Error("Hash da senha está ausente no Firestore.");
        }
  
        if (!bcrypt.compareSync(password.value, userData.password)) {
          Alert.alert("Erro", "Senha inválida.");
          return;
        }
  
        // Armazenar credenciais
        await SecureStore.setItemAsync("userEmail", email.value);
        await SecureStore.setItemAsync("userPasswordHash", userData.password);
  
        //Alert.alert("Sucesso", `Login como ${userData.userType} realizado!`);
        navigation.reset({
          index: 0,
          routes: [{ name: "AdminTabs" }],
        });
        return;
      }
  
      const clientSnapshot = await firebase.firestore().collection("UsersClient").where("email", "==", email.value).get();
  
      if (!clientSnapshot.empty) {
        const clientDoc = clientSnapshot.docs[0];
        const clientData = clientDoc.data();
  
        console.log("Dados do cliente:", clientData);
  
        if (!clientData.password) {
          throw new Error("Hash da senha está ausente no Firestore.");
        }
  
        if (!bcrypt.compareSync(password.value, clientData.password)) {
          Alert.alert("Erro", "Senha inválida.");
          return;
        }
  
        // Armazenar credenciais
        await SecureStore.setItemAsync("userEmail", email.value);
        await SecureStore.setItemAsync("userPasswordHash", clientData.password);
  
        //Alert.alert("Sucesso", "Login como usuário comum realizado!");
        navigation.reset({
          index: 0,
          routes: [{ name: "UserTabs" }],
        });
        return;
      }
  
      Alert.alert("Erro", "Usuário não encontrado.");
    } catch (error: any) {
      console.error("Erro no login:", error.message);
      Alert.alert("Erro", error.message || "Credenciais inválidas.");
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Logo />
      <Header>Bem-vindo</Header>
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
      <View style={styles.passwordContainer}>
        <TextInput
          label="Senha"
          returnKeyType="done"
          value={password.value}
          onChangeText={(text: any) => setPassword({ value: text, error: "" })}
          error={!!password.error}
          errorText={password.error}
          secureTextEntry={!passwordVisible} description={undefined}        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setPasswordVisible(!passwordVisible)}
        >
          {/* @ts-ignore */}
          <Icon
            name={passwordVisible ? "visibility" : "visibility-off"}
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>
      <Button mode="contained" onPress={onLoginPressed} loading={loading} style={{ marginTop: 16 }}>
        Entrar
      </Button>
      <Button
        mode="outlined"
        onPress={checkForStoredCredentials}
        style={{ marginTop: 16 }}
      >
        Login com biometria
      </Button>
      <View style={styles.row}>
        <Text>Você ainda não tem uma conta?</Text>
        <TouchableOpacity onPress={() => navigation.replace("RegisterScreen")}>
          <Text style={styles.link}> Criar nova conta!</Text>
        </TouchableOpacity>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 30,
  },
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
