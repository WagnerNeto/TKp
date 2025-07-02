import React from "react";
import { TouchableOpacity, Image, StyleSheet } from "react-native";
import { getStatusBarHeight } from "react-native-status-bar-height";

export default function BackButton({ goBack }) {
  return (
    <TouchableOpacity onPress={goBack} style={styles.container}>
      <Image
        style={styles.image}
        source={require("../../assets/items/back.png")}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 15 + getStatusBarHeight(),
    left: -23,
  },
  image: {
    width: 24,
    height: 27,
  },
});
