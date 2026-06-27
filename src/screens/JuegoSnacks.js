// src/screens/JuegoSnacks.js
import React, { useState, useMemo, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NIVELES, mezclar } from "../data/niveles";
import { sumarEstrellas, guardarProgresoNivel, registrarPartidaJugada } from "../utils/almacenamiento";
import { reproducirAcierto, reproducirFallo, reproducirVictoria } from "../utils/sonidos";
import ImagenAlimento from "../components/ImagenAlimento";
import Confeti from "../components/Confeti";

export default function JuegoSnacks({ route, navigation }) {
  const { nivelId } = route.params;
  const nivel = NIVELES.find((n) => n.id === nivelId);
  const preguntas = useMemo(() => mezclar(nivel.alimentos), [nivelId]);

  const [indice, setIndice] = useState(0);
  const [estrellas, setEstrellas] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [bloqueado, setBloqueado] = useState(false);
  const [confeti, setConfeti] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const yaNavego = useRef(false);

  const preguntaActual = preguntas[indice];
  const progreso = ((indice) / preguntas.length) * 100;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  function animarAcierto() {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.1, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }

  function animarFallo() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 5, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }

  async function responder(eligioSaludable) {
    if (bloqueado) return;
    setBloqueado(true);

    const esCorrecto = eligioSaludable === preguntaActual.saludable;

    if (esCorrecto) {
      setFeedback("acierto");
      reproducirAcierto();
      animarAcierto();
      setAciertos((a) => a + 1);
      await sumarEstrellas(1);
      setEstrellas((e) => e + 1);
    } else {
      setFeedback("fallo");
      reproducirFallo();
      animarFallo();
    }

    setTimeout(async () => {
      setFeedback(null);
      setBloqueado(false);
      if (indice + 1 < preguntas.length) {
        setIndice((i) => i + 1);
      } else {
        reproducirVictoria();
        const totalAciertos = aciertos + (esCorrecto ? 1 : 0);
        await guardarProgresoNivel(nivelId, totalAciertos, preguntas.length);
        await registrarPartidaJugada();
        
        setConfeti(true);
        
        setTimeout(() => {
          if (!yaNavego.current) {
            yaNavego.current = true;
            // ✅ PASAMOS esUltimoNivel: true para que PantallaResultados sepa que no hay siguiente nivel
            navigation.replace('PantallaResultados', {
              nivelId,
              aciertos: totalAciertos,
              total: preguntas.length,
              esUltimoNivel: true,
            });
          }
        }, 1500);
      }
    }, 1200);
  }

  return (
    <LinearGradient
      colors={["#4CAF50", "#FFD93D"]}
      style={styles.contenedor}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {confeti && <Confeti cantidad={50} duracion={3500} />}

      <View style={styles.fondoDecoracion}>
        <View style={styles.circulo1} />
        <View style={styles.circulo2} />
      </View>

      <View style={styles.barraSuperior}>
        <TouchableOpacity onPress={() => navigation.navigate("Secciones")} style={styles.botonVolver}>
          <Text style={styles.flecha}>←</Text>
        </TouchableOpacity>
        <Text style={styles.tituloNivel}>Nivel {nivelId}: {nivel.titulo}</Text>
        <View style={styles.estrellasBadge}>
          <Text style={styles.estrellas}>⭐ {estrellas}</Text>
        </View>
      </View>

      <View style={styles.barraProgresoFondo}>
        <View style={[styles.barraProgresoFill, { width: `${progreso}%` }]} />
      </View>
      <Text style={styles.contadorPreguntas}>{indice + 1} / {preguntas.length}</Text>

      <Animated.View style={[
        styles.tarjeta,
        { transform: [{ scale: scaleAnim }, { translateX: shakeAnim }] },
      ]}>
        <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
          <ImagenAlimento fuente={preguntaActual.imagen} tamanio={120} animar={false} />
        </Animated.View>
        <Text style={styles.nombreComida}>{preguntaActual.nombre}</Text>
      </Animated.View>

      <View style={styles.cajaPregunta}>
        <Text style={styles.textoPregunta}>¿Es SALUDABLE o CHATARRA?</Text>
      </View>

      <View style={styles.filaBotones}>
        <TouchableOpacity
          style={[styles.boton, styles.botonSaludable]}
          onPress={() => responder(true)}
          disabled={bloqueado}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#4CAF50", "#2E7D32"]}
            style={styles.botonGradiente}
          >
            <Text style={styles.botonEmoji}>😊</Text>
            <Text style={styles.botonTexto}>SALUDABLE</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.boton, styles.botonChatarra]}
          onPress={() => responder(false)}
          disabled={bloqueado}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#FF8A65", "#E64A19"]}
            style={styles.botonGradiente}
          >
            <Text style={styles.botonEmoji}>😞</Text>
            <Text style={styles.botonTexto}>CHATARRA</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {feedback && (
        <View style={[styles.feedbackBox, feedback === "acierto" ? styles.feedbackOk : styles.feedbackMal]}>
          <Text style={styles.feedbackTexto}>
            {feedback === "acierto" ? "🎉 ¡CORRECTO! +1 ⭐" : "💪 ¡Casi! ¡Tú puedes!"}
          </Text>
        </View>
      )}

      <View style={styles.filaMono}>
        <Text style={styles.emojiMono}>🐒</Text>
        <View style={styles.burbujaMono}>
          <Text style={styles.textoBurbuja}>
            {feedback === "acierto" ? "¡Excelente! 🌟" : feedback === "fallo" ? "¡No te rindas! 💪" : "¡Piénsalo bien!"}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, paddingTop: 40, paddingHorizontal: 16, paddingBottom: 20 },
  fondoDecoracion: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden" },
  circulo1: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  circulo2: {
    position: "absolute",
    bottom: -60,
    left: -60,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  barraSuperior: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  botonVolver: { backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 20, paddingVertical: 8, paddingHorizontal: 14 },
  flecha: { fontSize: 24, color: "#fff", fontWeight: "900" },
  tituloNivel: { fontSize: 16, fontWeight: "800", color: "#fff", flex: 1, textAlign: "center" },
  estrellasBadge: { backgroundColor: "rgba(255,215,0,0.3)", borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12 },
  estrellas: { fontSize: 16, fontWeight: "900", color: "#FFD700" },
  barraProgresoFondo: { height: 8, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 6, overflow: "hidden", marginBottom: 4 },
  barraProgresoFill: { height: "100%", backgroundColor: "#FFD700", borderRadius: 6 },
  contadorPreguntas: { fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: "700", textAlign: "center", marginBottom: 10 },
  tarjeta: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 32,
    alignItems: "center",
    paddingVertical: 30,
    marginBottom: 16,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  nombreComida: { fontSize: 26, fontWeight: "900", color: "#2E7D32", marginTop: 12 },
  cajaPregunta: { backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 16, paddingVertical: 14, alignItems: "center", marginBottom: 16 },
  textoPregunta: { fontSize: 20, fontWeight: "900", color: "#2E7D32" },
  filaBotones: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  boton: { flex: 1, borderRadius: 20, overflow: "hidden", elevation: 8 },
  botonGradiente: { paddingVertical: 18, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 10 },
  botonSaludable: { shadowColor: "#4CAF50", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  botonChatarra: { shadowColor: "#FF8A65", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  botonEmoji: { fontSize: 32 },
  botonTexto: { fontSize: 18, fontWeight: "900", color: "#fff" },
  feedbackBox: { borderRadius: 20, paddingVertical: 12, alignItems: "center", marginBottom: 10, borderWidth: 2, borderColor: "#fff" },
  feedbackOk: { backgroundColor: "#4CAF50" },
  feedbackMal: { backgroundColor: "#FF8A65" },
  feedbackTexto: { fontSize: 20, fontWeight: "900", color: "#fff" },
  filaMono: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 24, paddingVertical: 10, paddingHorizontal: 16 },
  emojiMono: { fontSize: 40 },
  burbujaMono: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 16, paddingVertical: 8, paddingHorizontal: 16 },
  textoBurbuja: { fontSize: 16, fontWeight: "700", color: "#fff" },
});