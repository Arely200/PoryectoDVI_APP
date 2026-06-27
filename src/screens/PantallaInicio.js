// src/screens/PantallaInicio.js
import React, { useState, useCallback, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Animated, ScrollView, Dimensions } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { leerNombre, guardarNombre } from "../utils/almacenamiento";
import Personaje from "../components/Personaje";

const { width } = Dimensions.get("window");

const SECCIONES = [
  { id: 1, titulo: "VERDURAS", subtitulo: "vs Chatarra", emoji: "🥦", colors: ["#4CAF50", "#2E7D32"], pantalla: "JuegoCanastas" },
  { id: 2, titulo: "FRUTAS", subtitulo: "vs Dulces", emoji: "🍎", colors: ["#FF8A65", "#E64A19"], pantalla: "JuegoPlatoSaludable" },
  { id: 3, titulo: "BEBIDAS", subtitulo: "Sanas vs Chatarra", emoji: "🧃", colors: ["#64B5F6", "#0D47A1"], pantalla: "JuegoSeleccionar" },
  { id: 4, titulo: "SNACKS", subtitulo: "Sanos vs Chatarra", emoji: "🍇", colors: ["#FFD93D", "#F57C00"], pantalla: "JuegoSnacks" },
];

export default function PantallaInicio({ navigation }) {
  const [nombre, setNombre] = useState("");
  const [pidiendoNombre, setPidiendoNombre] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const guardado = await leerNombre();
        if (!guardado) setPidiendoNombre(true);
        else setNombre(guardado);
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
    <LinearGradient colors={["#4CAF50", "#FFD93D"]} style={styles.contenedor} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View style={styles.fondoDecoracion}>
        <View style={styles.circulo1} />
        <View style={styles.circulo2} />
        <View style={styles.circulo3} />
      </View>

      <Animated.View style={[styles.contenido, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.header}>
          <Personaje tipo="mono" tamanio={60} mensaje={`¡Hola${nombre ? `, ${nombre}` : ", Campeón"}!`} />
          <Text style={styles.subSaludo}>¿Qué quieres jugar hoy?</Text>
        </View>

        {pidiendoNombre && (
          <View style={styles.cajaNombre}>
            <Text style={styles.preguntaNombre}>¿Cómo te llamas? ✏️</Text>
            <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Escribe tu nombre" maxLength={20} autoFocus />
            <TouchableOpacity style={styles.botonNombre} onPress={() => { const n = nombre.trim() || "Amigo"; guardarNombre(n); setPidiendoNombre(false); setNombre(n); }}>
              <Text style={styles.textoBotonNombre}>✅ ¡VAMOS!</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.grid}>
            {SECCIONES.map((seccion) => (
              <TouchableOpacity key={seccion.id} style={styles.cardContainer} onPress={() => manejarSeleccionSeccion(seccion)} activeOpacity={0.85}>
                <LinearGradient colors={seccion.colors} style={styles.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <View style={styles.cardEmojiContainer}><Text style={styles.cardEmoji}>{seccion.emoji}</Text></View>
                  <Text style={styles.cardTitulo}>{seccion.titulo}</Text>
                  <Text style={styles.cardSubtitulo}>{seccion.subtitulo}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
  fondoDecoracion: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden" },
  circulo1: { position: "absolute", top: -100, right: -80, width: 250, height: 250, borderRadius: 125, backgroundColor: "rgba(255,255,255,0.08)" },
  circulo2: { position: "absolute", bottom: -80, left: -60, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(255,255,255,0.06)" },
  circulo3: { position: "absolute", top: "50%", left: -50, width: 150, height: 150, borderRadius: 75, backgroundColor: "rgba(255,255,255,0.04)" },
  contenido: { flex: 1, paddingTop: 40, paddingHorizontal: 16 },
  header: { alignItems: "center", marginBottom: 16 },
  subSaludo: { fontSize: 18, color: "rgba(255,255,255,0.9)", fontWeight: "600", marginTop: 2 },
  cajaNombre: { backgroundColor: "rgba(255,255,255,0.95)", borderRadius: 28, padding: 20, marginBottom: 16, alignItems: "center", elevation: 10 },
  preguntaNombre: { fontSize: 22, fontWeight: "700", color: "#2E7D32", marginBottom: 12 },
  input: { width: "100%", borderWidth: 3, borderColor: "#4CAF50", borderRadius: 18, padding: 14, fontSize: 20, backgroundColor: "#fff", textAlign: "center" },
  botonNombre: { marginTop: 14, backgroundColor: "#4CAF50", paddingVertical: 14, paddingHorizontal: 36, borderRadius: 32 },
  textoBotonNombre: { color: "#fff", fontWeight: "900", fontSize: 18 },
  scrollContent: { paddingBottom: 30 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  cardContainer: { width: "48%", marginBottom: 16 },
  card: { borderRadius: 28, padding: 20, alignItems: "center", minHeight: 160, justifyContent: "center", elevation: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 10, borderWidth: 2, borderColor: "rgba(255,255,255,0.3)" },
  cardEmojiContainer: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 50, padding: 12, marginBottom: 10 },
  cardEmoji: { fontSize: 54 },
  cardTitulo: { fontSize: 19, fontWeight: "900", color: "#fff", textAlign: "center", textShadowColor: "rgba(0,0,0,0.2)", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  cardSubtitulo: { fontSize: 13, color: "rgba(255,255,255,0.85)", textAlign: "center", marginTop: 4, fontWeight: "600" },
});