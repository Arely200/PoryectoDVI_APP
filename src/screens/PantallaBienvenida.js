// src/screens/PantallaBienvenida.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function PantallaBienvenida({ navigation }) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.emojiEsquinaSuperiorIzq}>🍔</Text>
      <Text style={styles.emojiEsquinaSuperiorDer}>🥦</Text>

      <View style={styles.centro}>
        <Text style={styles.titulo}>Comida{"\n"}Divertida</Text>

        <TouchableOpacity
          style={styles.boton}
          onPress={() => navigation.navigate("Secciones")}
        >
          <Text style={styles.textoBoton}>¡JUGAR!</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.emojiEsquinaInferiorIzq}>🍎</Text>
      <Text style={styles.emojiEsquinaInferiorDer}>🍕</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: "#A8E6CF",
    justifyContent: "center",
    alignItems: "center",
  },
  centro: { alignItems: "center" },
  titulo: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#FFD93D",
    textAlign: "center",
    textShadowColor: "#E8A800",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
    marginBottom: 50,
  },
  boton: {
    backgroundColor: "#4CD964",
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 35,
    elevation: 4,
  },
  textoBoton: { fontSize: 22, fontWeight: "bold", color: "#1B5E20" },
  emojiEsquinaSuperiorIzq: { position: "absolute", top: 30, left: 20, fontSize: 60 },
  emojiEsquinaSuperiorDer: { position: "absolute", top: 30, right: 20, fontSize: 60 },
  emojiEsquinaInferiorIzq: { position: "absolute", bottom: 30, left: 20, fontSize: 60 },
  emojiEsquinaInferiorDer: { position: "absolute", bottom: 30, right: 20, fontSize: 60 },
});