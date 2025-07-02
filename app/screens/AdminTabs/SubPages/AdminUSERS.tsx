import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Animated,
  Button,
  Modal,
  TextInput,
} from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { firebase } from "../../../firebase/firebaseConfig";
import Ionicons from "@expo/vector-icons/Ionicons";
import { theme } from "@/app/core/theme";
import { Picker } from "@react-native-picker/picker";
import bcrypt from 'bcryptjs';


export type RootStackParamList = {
  StartScreen: undefined;
  AccountScreen: undefined;
  AdminUSERS: undefined;
};

interface User {
  id: string;
  name: string;
  email: string;
  userType: string;
  address: string;
  cpf: string;
}

const AdminUSERS = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Campos do formulário
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState("");
  const [address, setAddress] = useState("");
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState(""); // Novo campo de senha

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const usersSnapshot = await firebase.firestore().collection("users").get();
        const usersData: User[] = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || "",
          email: doc.data().email || "",
          userType: doc.data().userType || "",
          address: doc.data().address || "",
          cpf: doc.data().cpf || "",
        }));
        setUsers(usersData);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        Alert.alert("Erro", "Não foi possível carregar os usuários.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Função para adicionar novo usuário
    const handleAddUser = async () => {
      if (!name || !email || !userType || !address || !cpf || !password) {
        Alert.alert("Erro", "Por favor, preencha todos os campos.");
        return;
      }
    
      try {
        // Criptografar a senha com bcrypt
        const hashedPassword = await bcrypt.hash(password, 10); // 10 é o número de salt rounds
    
        // Criação do novo usuário com a senha criptografada
        const newUser = { name, email, userType, address, cpf, password: hashedPassword };
    
        // Adiciona o usuário ao Firestore
        await firebase.firestore().collection("users").add(newUser);
    
        // Atualiza a lista local
        setUsers((prevUsers) => [
          ...prevUsers,
          { id: new Date().getTime().toString(), ...newUser },
        ]);
    
        Alert.alert("Sucesso", "Usuário adicionado com sucesso!");
        setModalVisible(false);
        resetFormFields();
      } catch (error) {
        console.error("Erro ao adicionar usuário:", error);
        Alert.alert("Erro", "Não foi possível adicionar o usuário.");
      }
    };
    
  
    // Reseta os campos do formulário
    const resetFormFields = () => {
      setName("");
      setEmail("");
      setUserType("");
      setAddress("");
      setCpf("");
      setPassword(""); // Reseta o campo senha
    };

    const handleDeleteUser = (userId: string) => {
      Alert.alert(
        "Confirmação",
        "Tem certeza de que deseja excluir este usuário?",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Excluir",
            style: "destructive",
            onPress: async () => {
              try {
                await firebase.firestore().collection("users").doc(userId).delete();
                setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
                Alert.alert("Sucesso", "Usuário excluído.");
              } catch (error) {
                console.error("Erro ao excluir usuário:", error);
                Alert.alert("Erro", "Não foi possível excluir o usuário.");
              }
            },
          },
        ]
      );
    };
    

  const renderItem = ({ item }: { item: User }) => {
    const translateX = new Animated.Value(0);
  
    const handleGestureEvent = Animated.event(
      [{ nativeEvent: { translationX: translateX } }],
      { useNativeDriver: true }
    );
  
    const handleGestureStateChange = (event: any) => {
      if (event.nativeEvent.state === State.END) {
        const translationX = event.nativeEvent.translationX;
  
        if (translationX < -100) {
          handleDeleteUser(item.id); // Deslizar para a esquerda - excluir
        } else if (translationX > 100) {
          Alert.alert("Editar Usuário", `Editar informações do usuário com ID ${item.id}`); // Deslizar para a direita - editar
        }
  
        // Resetar posição após o gesto
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    };
  
    return (
      <View style={styles.swipeContainer}>
        {/* Ícone para Editar */}
        <Animated.View
          style={[
            styles.iconContainer,
            { left: 0, opacity: translateX.interpolate({
              inputRange: [0, 100],
              outputRange: [0, 1],
              extrapolate: "clamp",
            }) },
          ]}
        >
          <Ionicons name="create-outline" size={30} color="#4CAF50" />
        </Animated.View>
  
        {/* Ícone para Excluir */}
        <Animated.View
          style={[
            styles.iconContainer,
            { right: 0, opacity: translateX.interpolate({
              inputRange: [-100, 0],
              outputRange: [1, 0],
              extrapolate: "clamp",
            }) },
          ]}
        >
          <Ionicons name="trash-outline" size={30} color="#FF0000" />
        </Animated.View>
  
        <PanGestureHandler
          onGestureEvent={handleGestureEvent}
          onHandlerStateChange={handleGestureStateChange}
        >
          <Animated.View
            style={[
              styles.userICON,
              { transform: [{ translateX }] },
            ]}
          >
            <Text>{item.name || "Usuário sem nome"}</Text>
            <Text>{item.email || "Email não disponível"}</Text>
            <Text>{item.userType || "Tipo não especificado"}</Text>
            <Text>{item.address || "Endereço não disponível"}</Text>
            <Text>{item.cpf || "CPF não disponível"}</Text>
          </Animated.View>
        </PanGestureHandler>
      </View>
    );
  };
  

  

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={39} color="#FF0000" />
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#FF0000" style={styles.loader} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
      <TouchableOpacity style={styles.floatingButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={35} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Usuário</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry // Campo protegido para senha
            />
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={userType}
                onValueChange={(itemValue: any) => setUserType(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Selecione o tipo de usuário" value="" />
                <Picker.Item label="Administrador" value="Administrador" />
                <Picker.Item label="Afiliado" value="Afiliado" />
                <Picker.Item label="Usuário Comum" value="Usuário Comum" />
              </Picker>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Endereço"
              value={address}
              onChangeText={setAddress}
            />
            <TextInput
              style={styles.input}
              placeholder="CPF"
              value={cpf}
              onChangeText={setCpf}
              keyboardType="numeric"
            />
            <View style={styles.buttonContainer}>
              <Button
                title="Cancelar"
                onPress={() => setModalVisible(false)}
                color={theme.colors.primary}
              />
              <Button
                title="Adicionar"
                onPress={handleAddUser}
                color={theme.colors.primary}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  backButton: {
    position: "absolute",
    top: 45,
    left: 9,
    zIndex: 10,
  },
  loader: {
    marginTop: 20,
  },
  list: {
    padding: 16,
    marginTop: 85,
  },
  userItem: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    // Adicionado para efeito visual
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: theme.colors.tab,
    borderRadius: 50,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  modalTitle: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: theme.colors.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: "#fff", // Fundo branco para o Picker
    overflow: "hidden", // Evita que o Picker ultrapasse o contêiner
  },
  picker: {
    height: 50, // Ajusta a altura do Picker
    paddingLeft: 10, // Adiciona espaço interno
    color: "#333", // Cor do texto selecionado
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  swipeContainer: {
    position: "relative",
    marginBottom: 8,
  },
  
  iconContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    zIndex: 1,
  },
  
  userICON: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  
});

export default AdminUSERS;
