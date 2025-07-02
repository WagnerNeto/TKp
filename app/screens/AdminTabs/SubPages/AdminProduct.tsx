import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Button,
  Animated,
  Image,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { firebase } from "../../../firebase/firebaseConfig";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Print from "expo-print";
import { shareAsync } from "expo-sharing";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import QRCode from "react-native-qrcode-svg";

export type RootStackParamList = {
  StartScreen: undefined;
  AccountScreen: undefined;
  UsersScreen: undefined;
};

const AdminProduct = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productQuantity, setProductQuantity] = useState("");
  const [qrCodeRef, setQrCodeRef] = useState(null); // Referência para o QR Code

  React.useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const productsSnapshot = await firebase
          .firestore()
          .collection("products")
          .get();
        const productData = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productData);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        Alert.alert("Erro", "Não foi possível carregar os produtos.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddProduct = async () => {
    if (!productName || !productPrice || !productQuantity) {
      Alert.alert("Erro", "Todos os campos são obrigatórios!");
      return;
    }

    try {
      const productId = `product_${Date.now()}`;
      const productData = {
        name: productName,
        price: parseFloat(productPrice),
        quantity: parseInt(productQuantity, 10),
        id: productId,
      };

      await firebase.firestore().collection("products").doc(productId).set(productData);

      setProducts((prev) => [...prev, productData]);
      setModalVisible(false);
      Alert.alert("Sucesso", "Produto adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      Alert.alert("Erro", "Não foi possível adicionar o produto.");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await firebase.firestore().collection("products").doc(productId).delete();
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== productId)
      );
      Alert.alert("Sucesso", "Produto excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      Alert.alert("Erro", "Não foi possível excluir o produto.");
    }
  };

  const generateQRCodePDF = async (productData: any) => {
    if (!qrCodeRef) {
      Alert.alert("Erro", "QR Code não pôde ser gerado.");
      return;
    }

    try {
      qrCodeRef.toDataURL(async (base64) => {
        const html = `
          <html>
            <body style="text-align: center; font-family: Arial, sans-serif;">
              <h1>Produto: ${productData.name}</h1>
              <p>Preço: R$ ${productData.price.toFixed(2)}</p>
              <p>Quantidade: ${productData.quantity}</p>
              <img src="data:image/png;base64,${base64}" alt="QR Code" />
            </body>
          </html>
        `;

        const { uri } = await Print.printToFileAsync({ html });
        await shareAsync(uri, { UTI: "application/pdf", mimeType: "application/pdf" });
        Alert.alert("Sucesso", "QR Code gerado e salvo com sucesso!");
      });
    } catch (error) {
      console.error("Erro ao gerar o PDF:", error);
      Alert.alert("Erro", "Não foi possível gerar o QR Code.");
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const translateX = new Animated.Value(0);

    const handleGestureEvent = Animated.event(
      [{ nativeEvent: { translationX: translateX } }],
      { useNativeDriver: true }
    );

    const handleGestureStateChange = (event: any) => {
      if (event.nativeEvent.state === State.END) {
        const translationX = event.nativeEvent.translationX;

        if (translationX < -100) {
          Alert.alert(
            "Confirmação",
            "Deseja realmente excluir este produto?",
            [
              { text: "Cancelar", style: "cancel" },
              { text: "Excluir", onPress: () => handleDeleteProduct(item.id) },
            ]
          );
        } else if (translationX > 100) {
          generateQRCodePDF(item);
        }

        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    };

    return (
      <View style={styles.swipeContainer}>
        <Animated.View
          style={[
            styles.productItem,
            { transform: [{ translateX }] },
          ]}
        >
          <Text style={styles.productName}>{item.name || "Produto sem nome"}</Text>
          <Text style={styles.productDescription}>
            Preço: R$ {item.price?.toFixed(2)}
          </Text>
          <Text>Quantidade: {item.quantity}</Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={39} color="#dc143c" />
      </TouchableOpacity>
      <Image source={require("../../../../assets/items/logo.png")} style={styles.logo} />
      {loading ? (
        <ActivityIndicator size="large" color="#000" style={styles.loader} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Produto</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do Produto"
              value={productName}
              onChangeText={setProductName}
            />
            <TextInput
              style={styles.input}
              placeholder="Preço"
              keyboardType="numeric"
              value={productPrice}
              onChangeText={setProductPrice}
            />
            <TextInput
              style={styles.input}
              placeholder="Quantidade"
              keyboardType="numeric"
              value={productQuantity}
              onChangeText={setProductQuantity}
            />
            <Button title="Salvar" onPress={handleAddProduct} />
            <Button
              title="Cancelar"
              onPress={() => setModalVisible(false)}
              color="red"
            />
          </View>
        </View>
      </Modal>
      
      {/* QR Code para captura */}
      <QRCode
        value="Placeholder"
        getRef={(c) => setQrCodeRef(c)}
        size={150}
        quietZone={10}
        style={{ display: "none" }} // Esconde o QR Code
      />

      {/* Botão Flutuante */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={45} color="#dc143c" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loader: {
    marginTop: 20,
  },
  list: {
    padding: 16,
    marginTop: 30,
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
    zIndex: 10,
  },
  productItem: {
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
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  productDescription: {
    fontSize: 14,
    color: "#666",
  },
  floatingButton: {
    position: "absolute",
    bottom: 820,
    right: 0,
    //backgroundColor: theme.colors.tab,
    borderRadius: 50,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    //elevation: 5,
    zIndex: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
    width: "100%",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 9,
    zIndex: 10,
  },
  logo: {
    height: 80, // Altura da logo
    width: 575, // Largura da logo (ajuste conforme necessário)
    resizeMode: "contain", // Ajusta a logo proporcionalmente
    marginHorizontal: -72, // Espaço nas laterais
  },
});

export default AdminProduct;
