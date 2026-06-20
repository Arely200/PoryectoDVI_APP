// src/screens/PantallaInicio.js
import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { leerNombre, guardarNombre } from "../utils/almacenamiento";

const SECCIONES = [
  { id: 1, titulo: "VERDURAS VS CHATARRA", emoji: "🥦", color: "#4CAF50", pantalla: "JuegoArrastrar" },
  { id: 2, titulo: "FRUTAS VS DULCES", emoji: "🍎", color: "#FF7043", pantalla: "JuegoArmarPlato" },
  { id: 3, titulo: "BEBIDAS: SANAS VS CHATARRA", emoji: "🧃", color: "#29B6F6", pantalla: "JuegoPlato" },
  { id: 4, titulo: "SNACKS: SANOS VS CHATARRA", emoji: "🥜", color: "#8D6E63", pantalla: "Juego" },
];

export default function PantallaInicio({ navigation }) {
  const [nombre, setNombre] = useState("");
  const [pidiendoNombre, setPidiendoNombre] = useState(false);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const guardado = await leerNombre();
        if (!guardado) {
          setPidiendoNombre(true);
        } else {
          setNombre(guardado);
        }
      })();
    }, [])
  );

  async function manejarSeleccionSeccion(seccion) {
    if (pidiendoNombre) {
      const nombreFinal = nombre.trim() || "Amigo";
      await guardarNombre(nombreFinal);
      setPidiendoNombre(false);
    }
    navigation.navigate(seccion.pantalla, { nivelId: seccion.id });
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>🍎 COMIDA DIVERTIDA</Text>

      {pidiendoNombre ? (
        <View style={styles.cajaNombre}>
          <Text style={styles.preguntaNombre}>¿Cómo te llamas?</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Escribe tu nombre"
            maxLength={20}
          />
        </View>
      ) : (
        <View style={styles.burbuja}>
          <Text style={styles.mono}>🐒</Text>
          <Text style={styles.textoBurbuja}>¡Elige una sección para jugar!</Text>
        </View>
      )}

      <View style={styles.grid}>
        {SECCIONES.map((s, i) => (
          <TouchableOpacity
            key={s.id}
            style={[styles.cuadro, { backgroundColor: s.color }, i % 2 !== 0 ? styles.desplazadoAbajo : null]}
            onPress={() => manejarSeleccionSeccion(s)}
            activeOpacity={0.85}
          >
            <Text style={styles.emojiCuadro}>{s.emoji}</Text>
            <Text style={styles.tituloCuadro}>{s.titulo}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.cuadro, styles.cuadroPremios]}
          onPress={() => navigation.getParent()?.navigate("Logros")}
          activeOpacity={0.85}
        >
          <Text style={styles.emojiCuadro}>🏆</Text>
          <Text style={styles.tituloCuadro}>VER MIS PREMIOS</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.piePagina}>Para niños de 4 a 7 años</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#F1F8E9", alignItems: "center", paddingTop: 50, paddingHorizontal: 20 },
  titulo: { fontSize: 26, fontWeight: "bold", color: "#4CAF50", textAlign: "center", marginBottom: 16 },
  cajaNombre: { width: "100%", alignItems: "center", marginBottom: 16 },
  preguntaNombre: { fontSize: 16, color: "#333", marginBottom: 8 },
  input: {
    width: "80%",
    borderWidth: 2,
    borderColor: "#4CAF50",
    borderRadius: 16,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    textAlign: "center",
  },
  burbuja: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  mono: { fontSize: 32, marginRight: 8 },
  textoBurbuja: { backgroundColor: "#fff", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, fontSize: 14, flexShrink: 1 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", width: "100%" },
  cuadro: { width: "47%", aspectRatio: 1, borderRadius: 22, alignItems: "center", justifyContent: "center", marginBottom: 18, padding: 10, elevation: 3 },
  desplazadoAbajo: { marginTop: 40 },
  cuadroPremios: { backgroundColor: "#7E57C2", width: "100%", aspectRatio: 2.4, marginTop: 6 },
  emojiCuadro: { fontSize: 40, marginBottom: 8 },
  tituloCuadro: { fontSize: 13, fontWeight: "bold", color: "#fff", textAlign: "center" },
  piePagina: { marginTop: 8, fontSize: 12, color: "#888" },
});