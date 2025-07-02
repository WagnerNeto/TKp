import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import { Camera, CameraView } from "expo-camera";
import Header from "@/app/components/Header";
import { theme } from "@/app/core/theme";
import { Ionicons } from "@expo/vector-icons";
import { firebase } from "../../firebase/firebaseConfig";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { useCart } from "@/app/components/Cart/CartContext"; // Hook do contexto do carrinho

export type RootStackParamList = {
  StartScreen: undefined;
  AccountScreen: undefined;
  Carrinho: undefined;
};

interface Product {
  id: string;
  name: string;
  price: number;
}

const HomeScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const { cartList, addCart } = useCart(); // Hook para gerenciar o carrinho
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);

    try {
      // Busca o produto no Firestore usando o ID do QR Code
      const product = await fetchProductFromFirestore(data);

      if (product) {
        // Adiciona o produto ao carrinho
        addCart({
          id: Number(product.id), // Certifique-se de usar o ID correto
          name: product.name,
          price: product.price,
        });

        Alert.alert("Produto adicionado!", `Produto: ${product.name}`);
      } else {
        Alert.alert("Produto não encontrado", "O produto escaneado não existe no sistema.");
      }
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um erro ao buscar o produto. Tente novamente.");
      console.error("Erro ao escanear o produto:", error);
    }
  };

  // Função para buscar o produto no Firestore
  const fetchProductFromFirestore = async (productId: string): Promise<Product | null> => {
    try {
      const productRef = firebase.firestore().collection("products").doc(productId);
      const productDoc = await productRef.get();

      if (productDoc.exists) {
        const productData = productDoc.data();
        if (productData && productData.name && productData.price) {
          return {
            id: productDoc.id,
            name: productData.name,
            price: productData.price,
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar produto:", error);
      throw error;
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Solicitando permissão para acessar a câmera...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={{ marginBottom: 16 }}>
          Permissão para acessar a câmera foi negada.
        </Text>
        <Button
          title="Tentar novamente"
          onPress={async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === "granted");
          }}
        />
      </View>
    );
  }

  return (
    <>
      <View style={styles.header}>
        <Image source={require("../../../assets/items/logo3.png")} style={styles.logo} />
        <TouchableOpacity onPress={() => navigation.navigate("Carrinho")} style={styles.cartButton}>
          {cartList.length > 0 && (
            <View style={styles.dot}>
              <Text style={styles.dotText}>{cartList.length}</Text>
            </View>
          )}
          <Ionicons name="cart-outline" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        {scanned && <Button title="Escanear novamente" onPress={() => setScanned(false)} />}
      </View>
    </>
  );
};


const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.tab, // Cor do cabeçalho
    height: 60, // Altura do cabeçalho
    flexDirection: "row", // Itens na horizontal
    alignItems: "center", // Alinhar itens verticalmente
    justifyContent: "flex-end", // Espaço entre a logo e o carrinho
    paddingHorizontal: 16, // Espaço nas laterais
  },
  logo: {
    height: 80, // Altura da logo
    width: 480, // Largura da logo (ajuste conforme necessário)
    resizeMode: "contain", // Ajusta a logo proporcionalmente
    marginHorizontal: -72, // Espaço nas laterais
  },
  cartButton: {
    position: "relative", // Permite posicionar o badge
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    position: "absolute",
    top: -5,
    right: -10,
    backgroundColor: "orange",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1, // Garante que o badge fica na frente
  },
  dotText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default HomeScreen;