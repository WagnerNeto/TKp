import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Header from "@/app/components/Header";
import { theme } from "@/app/core/theme";

const AdminHome = ({ navigation }: { navigation: any }) => {
  return (
    <>
      <Header title="Painel de Controle" style={styles.header} />
      <View style={styles.dashboardContainer}>
        {/* Painéis de informações */}
        <View style={styles.dashboardRow}>
          <TouchableOpacity style={styles.dashboardBox} onPress={() => navigation.navigate("Relatórios")}>
            <Text style={styles.dashboardText}>Relatórios</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dashboardBox} onPress={() => navigation.navigate("AdminUSERS")}>
            <Text style={styles.dashboardText}>Usuários</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.dashboardRow}>
          <TouchableOpacity style={styles.dashboardBox} onPress={() => navigation.navigate("AdminProduct")}>
            <Text style={styles.dashboardText}>Produtos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dashboardBox} onPress={() => navigation.navigate("Relatórios")}>
            <Text style={styles.dashboardText}></Text>
          </TouchableOpacity>
        </View>
        <View style={styles.dashboardRow}>
          <TouchableOpacity style={styles.dashboardBox} onPress={() => navigation.navigate("Transações")}>
            <Text style={styles.dashboardText}>Transações</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dashboardBox} onPress={() => navigation.navigate("Configurações")}>
            <Text style={styles.dashboardText}>Configurações</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.tab,
    flex: 0.1,
  },
  dashboardContainer: {
    flex: 1,
    padding: 16,
    justifyContent: "space-evenly",
  },
  dashboardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dashboardBox: {
    width: "48%",
    height: 100,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dashboardText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
});

export default AdminHome;
