// src/screens/PantallaResultados.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { NIVELES } from "../data/niveles";

export default function PantallaResultados({ route, navigation }) {
  const { nivelId, aciertos, total } = route.params;
  const hayMasNiveles = nivelId < NIVELES.length;

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>🎉 ¡NIVEL COMPLETADO!</Text>
      <Text style={styles.subtitulo}>Nivel {nivelId}: {NIVELES.find(n => n.id === nivelId)?.titulo}</Text>

      <View style={styles.tarjeta}>
        <Text style={styles.emoji}>⭐</Text>
        <Text style={styles.puntaje}>{aciertos} / {total}</Text>
        <Text style={styles.etiqueta}>respuestas correctas</Text>
      </View>

      <View style={styles.burbuja}>
        <Text style={styles.mono}>🐒</Text>
        <Text style={styles.textoBurbuja}>
          {aciertos === total ? "¡Lo lograste todo! 🎊" : "¡Sigue practicando!"}
        </Text>
      </View>

      {hayMasNiveles && (
        <TouchableOpacity
          style={styles.boton}
          onPress={() => navigation.replace("Juego", { nivelId: nivelId + 1 })}
        >
          <Text style={styles.textoBoton}>➡️ SIGUIENTE NIVEL</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.boton, styles.botonSecundario]}
        onPress={() => navigation.navigate("Secciones")}
      >
        <Text style={styles.textoBoton}>🏠 VOLVER AL INICIO</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#F1F8E9", alignItems: "center", justifyContent: "center", padding: 24 },
  titulo: { fontSize: 26, fontWeight: "bold", color: "#4CAF50", textAlign: "center" },
  subtitulo: { fontSize: 16, color: "#555", marginTop: 4, marginBottom: 20 },
  tarjeta: {
    backgroundColor: "#fff",
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 40,
    alignItems: "center",
    elevation: 3,
  },
  emoji: { fontSize: 40 },
  puntaje: { fontSize: 36, fontWeight: "bold", color: "#FBC02D", marginTop: 4 },
  etiqueta: { fontSize: 14, color: "#777" },
  burbuja: { alignItems: "center", marginVertical: 24 },
  mono: { fontSize: 40 },
  textoBurbuja: { backgroundColor: "#fff", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14, marginTop: 4 },
  boton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    marginTop: 10,
    width: "85%",
    alignItems: "center",
  },
  botonSecundario: { backgroundColor: "#90A4AE" },
  textoBoton: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
