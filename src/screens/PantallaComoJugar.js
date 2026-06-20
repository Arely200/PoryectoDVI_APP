// src/screens/PantallaComoJugar.js
import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";

const PASOS = [
  { emoji: "👀", texto: "MIRA la comida" },
  { emoji: "🤔", texto: "PIENSA si es saludable o chatarra" },
  { emoji: "👆", texto: "TOCA el botón correcto" },
];

export default function PantallaComoJugar({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <Text style={styles.titulo}>📖 ¿CÓMO JUGAR?</Text>

      {PASOS.map((p, i) => (
        <View key={i} style={styles.paso}>
          <Text style={styles.emojiPaso}>{p.emoji}</Text>
          <Text style={styles.textoPaso}>PASO {i + 1}: {p.texto}</Text>
        </View>
      ))}

      <Text style={styles.premio}>¡COMPLETA LOS 3 NIVELES Y GANA PREMIOS!</Text>

      <View style={styles.burbuja}>
        <Text style={styles.mono}>🐒</Text>
        <Text style={styles.textoBurbuja}>¡Tú puedes hacerlo!</Text>
      </View>

      <TouchableOpacity
        style={styles.boton}
        onPress={() => navigation.navigate("Jugar", { screen: "Bienvenida" })}
      >
        <Text style={styles.textoBoton}>🎮 ¡A JUGAR!</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flexGrow: 1, backgroundColor: "#E3F2FD", alignItems: "center", padding: 24 },
  titulo: { fontSize: 28, fontWeight: "bold", color: "#1976D2", marginBottom: 20 },
  paso: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 16, padding: 14, width: "100%", marginBottom: 12 },
  emojiPaso: { fontSize: 36, marginRight: 14 },
  textoPaso: { fontSize: 15, fontWeight: "600", color: "#333", flexShrink: 1 },
  premio: { fontSize: 14, fontWeight: "bold", color: "#1976D2", textAlign: "center", marginTop: 16 },
  burbuja: { alignItems: "center", marginVertical: 20 },
  mono: { fontSize: 40 },
  textoBurbuja: { backgroundColor: "#fff", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14, marginTop: 4 },
  boton: { backgroundColor: "#4CAF50", paddingVertical: 16, paddingHorizontal: 36, borderRadius: 30 },
  textoBoton: { color: "#fff", fontWeight: "bold", fontSize: 18 },
});
