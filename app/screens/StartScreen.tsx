import React from "react";

import Background from "../components/Background";
import Logo from "../components/Logo";
import Header from "../components/Header";
import Button from "../components/Button";
import Paragraph from "../components/Paragraph";

export default function StartScreen({ navigation }: { navigation: any; }) {
  return (
    <Background>
      <Logo />
      <Header> Take Pay </Header>
      <Paragraph>
        
      </Paragraph>
      <Button
        mode="contained"
        onPress={() => navigation.navigate("LoginScreen")} style={undefined}      >
        Entrar
      </Button>
      <Button
        mode="outlined"
        onPress={() => navigation.navigate("RegisterScreen")} style={undefined}      >
        Crie uma Conta
      </Button>
    </Background>
  );
}
