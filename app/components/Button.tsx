import React from "react";
import { StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Button as PaperButton, ButtonProps as PaperButtonProps } from "react-native-paper";

import { theme } from "../core/theme";

// Define os tipos das propriedades do botão
interface ButtonProps extends Omit<PaperButtonProps, "style"> {
  mode: "text" | "outlined" | "contained"; // Defina os valores possíveis para "mode"
  style?: StyleProp<ViewStyle>; // Tipo para estilos adicionais
}

export default function Button({ mode, style, ...props }: ButtonProps) {
  return (
    <PaperButton
      style={[
        styles.button,
        mode === "outlined" && { backgroundColor: theme.colors.surface },
        style,
      ]}
      labelStyle={styles.text}
      mode={mode}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    marginVertical: 10,
    paddingVertical: 2,
  },
  text: {
    fontWeight: "bold",
    fontSize: 15,
    lineHeight: 26,
  },
});
