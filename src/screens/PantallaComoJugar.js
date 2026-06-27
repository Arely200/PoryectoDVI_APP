// src/screens/PantallaComoJugar.js
import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const PASOS = [
  { emoji: "👀", texto: "MIRA la comida", color: "#FF6B6B" },
  { emoji: "🤔", texto: "PIENSA si es saludable o chatarra", color: "#4ECDC4" },
  { emoji: "👆", texto: "TOCA el botón correcto", color: "#FFD93D" },
];

const CONSEJOS = [
  { emoji: "🥗", texto: "Las frutas y verduras son SALUDABLES" },
  { emoji: "🍔", texto: "Las hamburguesas y papas son CHATARRA" },
  { emoji: "💧", texto: "El agua es la mejor bebida" },
];

export default function PantallaComoJugar({ navigation }) {
  return (
    <LinearGradient 
      colors={["#2E7D32", "#4CAF50", "#FFD93D"]}
      style={styles.contenedor}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* DECORACIÓN DE FONDO */}
      <View style={styles.fondoDecoracion}>
        <View style={styles.circulo1} />
        <View style={styles.circulo2} />
        <View style={styles.circulo3} />
        <View style={styles.circulo4} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* TÍTULO */}
        <View style={styles.header}>
          <Text style={styles.titulo}>📖 ¿CÓMO JUGAR?</Text>
          <View style={styles.tituloLinea} />
        </View>

        {/* PASOS */}
        <Text style={styles.seccionTitulo}>🎯 3 PASOS FÁCILES</Text>
        {PASOS.map((p, i) => (
          <LinearGradient
            key={i}
            colors={["#ffffff", p.color + "15"]}
            style={styles.pasoContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.paso}>
              <View style={[styles.pasoNumero, { backgroundColor: p.color }]}>
                <Text style={styles.pasoNumeroTexto}>{i + 1}</Text>
              </View>
              <Text style={styles.pasoEmoji}>{p.emoji}</Text>
              <Text style={styles.pasoTexto}>{p.texto}</Text>
            </View>
          </LinearGradient>
        ))}

        {/* CONSEJOS */}
        <Text style={styles.seccionTitulo}>💡 CONSEJOS ÚTILES</Text>
        <View style={styles.consejosContainer}>
          {CONSEJOS.map((c, i) => (
            <View key={i} style={styles.consejo}>
              <Text style={styles.consejoEmoji}>{c.emoji}</Text>
              <Text style={styles.consejoTexto}>{c.texto}</Text>
            </View>
          ))}
        </View>

        {/* BURBUJA DEL MONO */}
        <View style={styles.burbujaContainer}>
          <LinearGradient
            colors={["#FFF9C4", "#FFE082"]}
            style={styles.burbuja}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.mono}>🐒</Text>
            <View style={styles.burbujaTexto}>
              <Text style={styles.burbujaTextoGrande}>¡Tú puedes hacerlo!</Text>
              <Text style={styles.burbujaTextoChico}>Sigue los pasos y diviértete</Text>
            </View>
          </LinearGradient>
        </View>

        {/* BOTÓN JUGAR */}
        <TouchableOpacity
          style={styles.boton}
          onPress={() => navigation.navigate("Secciones")}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["#FFD93D", "#FF8A65"]}
            style={styles.botonGradiente}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.botonEmoji}>🎮</Text>
            <Text style={styles.botonTexto}>¡A JUGAR!</Text>
            <Text style={styles.botonFlecha}>→</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },

  // DECORACIÓN DE FONDO (igual que JuegoPlatoSaludable)
  fondoDecoracion: { 
    position: "absolute", 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    overflow: "hidden" 
  },
  circulo1: { 
    position: "absolute", 
    top: -80, 
    right: -80, 
    width: 280, 
    height: 280, 
    borderRadius: 140, 
    backgroundColor: "rgba(255,255,255,0.08)" 
  },
  circulo2: { 
    position: "absolute", 
    bottom: -60, 
    left: -60, 
    width: 220, 
    height: 220, 
    borderRadius: 110, 
    backgroundColor: "rgba(255,255,255,0.06)" 
  },
  circulo3: { 
    position: "absolute", 
    top: "30%", 
    right: -40, 
    width: 140, 
    height: 140, 
    borderRadius: 70, 
    backgroundColor: "rgba(255,255,255,0.05)" 
  },
  circulo4: { 
    position: "absolute", 
    bottom: "20%", 
    left: -30, 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: "rgba(255,215,0,0.08)" 
  },

  scrollContent: { 
    flexGrow: 1, 
    alignItems: "center", 
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
    position: "relative",
    zIndex: 1,
  },

  header: {
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  titulo: { 
    fontSize: 34, 
    fontWeight: "900", 
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  tituloLinea: {
    width: 60,
    height: 4,
    backgroundColor: "#FFD93D",
    borderRadius: 2,
    marginTop: 6,
  },

  seccionTitulo: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    alignSelf: "flex-start",
    marginTop: 16,
    marginBottom: 10,
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  pasoContainer: {
    width: "100%",
    borderRadius: 16,
    marginBottom: 10,
    padding: 2,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  paso: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    paddingHorizontal: 16,
    width: "100%",
  },
  pasoNumero: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  pasoNumeroTexto: {
    fontSize: 14,
    fontWeight: "900",
    color: "#fff",
  },
  pasoEmoji: { 
    fontSize: 28, 
    marginRight: 12,
  },
  pasoTexto: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#333",
    flex: 1,
    flexWrap: "wrap",
  },

  consejosContainer: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  consejo: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  consejoEmoji: { 
    fontSize: 24, 
    marginRight: 12,
  },
  consejoTexto: { 
    fontSize: 14, 
    fontWeight: "500", 
    color: "#444",
    flex: 1,
  },

  burbujaContainer: {
    width: "100%",
    marginVertical: 12,
  },
  burbuja: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "rgba(255,193,7,0.3)",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    gap: 12,
  },
  mono: { fontSize: 44 },
  burbujaTexto: {
    flex: 1,
  },
  burbujaTextoGrande: {
    fontSize: 18,
    fontWeight: "800",
    color: "#4E342E",
  },
  burbujaTextoChico: {
    fontSize: 12,
    color: "#795548",
    fontWeight: "500",
    marginTop: 2,
  },

  boton: {
    width: "100%",
    borderRadius: 30,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#FFD93D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    marginTop: 8,
  },
  botonGradiente: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  botonEmoji: { fontSize: 24 },
  botonTexto: { 
    color: "#fff", 
    fontWeight: "900", 
    fontSize: 22,
    letterSpacing: 1,
  },
  botonFlecha: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "700",
  },
});