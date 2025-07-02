import React from "react";
import { Provider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "react-native";

import { theme } from "./app/core/theme";
import {
  StartScreen,
  LoginScreen,
  RegisterScreen,
  ResetPasswordScreen,
  UserTabs,
  UsersScreen,
  ProductScreen,
  AdminTabs,
  UserProduct,
  AdminProduct,
  AdminUSERS,
} from "./app/screens";
import CartProvider from "./app/components/Cart/CartContext";
import { Carrinho } from "./app/screens/UserTabs/SubPages/Carrinho";


const Stack = createStackNavigator();

export default function App() {
  return (
    <Provider theme={theme}>
      <NavigationContainer>
      <CartProvider>
        <StatusBar backgroundColor="#dc143c" barStyle={'dark'} />
        <Stack.Navigator
          initialRouteName="StartScreen"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="StartScreen" component={StartScreen} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
          <Stack.Screen name="UserTabs" component={UserTabs} />
          <Stack.Screen
            name="ResetPasswordScreen"
            component={ResetPasswordScreen}
          />
          <Stack.Screen name="AdminTabs" component={AdminTabs} />
          <Stack.Screen name="AdminProduct" component={AdminProduct} />
          <Stack.Screen name="AdminUSERS" component={AdminUSERS} />
          <Stack.Screen name="Carrinho" component={Carrinho} />
        </Stack.Navigator>
        </CartProvider>
      </NavigationContainer>
    </Provider>
  );
}

