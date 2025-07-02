import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native";
import { CartItem } from "../../../components/Cart/CartItem";
import { useCart } from "../../../components/Cart/CartContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { theme } from "@/app/core/theme";
import { useNavigation, NavigationProp } from "@react-navigation/native";

export type RootStackParamList = {
  HomeScreen: undefined;
  AccountScreen: undefined;
  UsersScreen: undefined;
};

export function Carrinho() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const isFocused = useIsFocused();
    const { cartList, addCart, subCart, totalCarrinho } = useCart();

    const [cartListLocal, setCartListLocal] = useState(cartList);

    useEffect(() => {
        if (isFocused) {
            setCartListLocal(cartList);
        }
    }, [isFocused, cartList]);

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
               <Ionicons name="arrow-back" size={41} color="#FF0000" />
            </TouchableOpacity>
            <FlatList
                style={styles.listCustom}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={<Text style={{ textAlign: "center", padding: 16, fontSize: 16 }}>Carrinho vazio!</Text>}
                data={cartListLocal}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <CartItem
                        data={item}
                        addItem={() => addCart(item)}
                        subItem={() => subCart(item)}
                    />
                )}
                ListFooterComponent={<Text style={{ textAlign: "left", padding: 14, fontSize: 20 }}>Total R$ {totalCarrinho.toFixed(2)}</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FAFAFA",
        paddingStart: 14,
        paddingEnd: 14,
        paddingTop: 14,
    },
    listCustom: {
        flex: 1,
        marginTop: 50,
    },
    backButton: {
      position: "absolute",
      top: 10,
      left: 10,
      zIndex: 10,
    },
});