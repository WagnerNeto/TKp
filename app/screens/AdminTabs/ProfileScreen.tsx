import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { firebase } from "../../firebase/firebaseConfig";

export type RootStackParamList = {
  StartScreen: undefined;
  AccountScreen: undefined;
  AdminUSERS: undefined;
  AdminProduct: undefined;
};

const AccountScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [user, setUser] = useState<any>(null);

  // Recuperar dados do usuário do Firebase
  useEffect(() => {
    const currentUser = firebase.auth().currentUser;
    if (currentUser) {
      setUser(currentUser);
    } else {
      console.warn("Nenhum usuário autenticado encontrado.");
    }
  }, []);

  // Funções para os botões
  const handleEditProfile = () =>
    Alert.alert("Editar Perfil", "Funcionalidade não implementada.");
  const handleAddUser = () =>
    Alert.alert("Adicionar Usuário", "Funcionalidade não implementada.");
  const handleProductCatalog = () =>
    Alert.alert("Catálogo de Produtos", "Funcionalidade não implementada.");
  const handleLogout = () => {
    Alert.alert(
      "Sair",
      "Tem certeza de que deseja sair?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            try {
              await firebase.auth().signOut();
              await AsyncStorage.clear();
              console.log("Usuário desconectado");
              navigation.navigate("StartScreen");
            } catch (error) {
              console.error("Erro ao fazer logout:", error);
              Alert.alert("Erro", "Ocorreu um erro ao sair. Tente novamente.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };


  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header} />

      {/* Profile Info */}
      <View style={styles.profileContainer}>
        <View style={styles.avatar} />
        <Text style={styles.username}>{user?.displayName || "Usuário"}</Text>
        <Text style={styles.email}>{user?.email || "Email não disponível"}</Text>
        <Text style={styles.bio}>You don't have a bio yet...</Text>
      </View>

      {/* Opções */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Perfil</Text>
        <TouchableOpacity style={styles.option} onPress={handleEditProfile}>
          <Text style={styles.optionText}>Editar Perfil</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.option} onPress={() => navigation.navigate("AdminUSERS")}>
          <Text style={styles.optionText}>Usuários</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.option}  onPress={() => navigation.navigate("AdminProduct")}>
          <Text style={styles.optionText}>Produtos</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.option} onPress={handleLogout}>
          <Text style={styles.optionText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  profileContainer: {
    alignItems: "center",
    padding: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ddd",
    marginBottom: 16,
  },
  username: {
    color: "#000",
    fontSize: 20,
    fontWeight: "bold",
  },
  email: {
    color: "#666",
    fontSize: 14,
    marginVertical: 4,
  },
  bio: {
    color: "#444",
    fontSize: 14,
    marginVertical: 8,
  },
  section: {
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: "#666",
    fontSize: 12,
    marginBottom: 8,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  optionText: {
    color: "#000",
    fontSize: 16,
  },
});


export default AccountScreen;
