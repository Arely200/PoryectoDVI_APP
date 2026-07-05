// src/screens/JuegoSnacks.js
import React, { useState, useMemo, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NIVELES, mezclar } from "../data/niveles";
import { sumarEstrellas, guardarProgresoNivel, registrarPartidaJugada } from "../utils/almacenamiento";
import { reproducirAcierto, reproducirFallo, reproducirVictoria } from "../utils/sonidos";
import ImagenAlimento from "../components/ImagenAlimento";
import Confeti from "../components/Confeti";

export default function JuegoSnacks({ route, navigation }) {
  const { nivelId } = route.params;
  const nivel = NIVELES.find((n) => n.id === nivelId);

  //VALIDACIÓN: Datos del nivel
  if (!nivel || !nivel.alimentos || nivel.alimentos.length === 0) {
    return (
      <LinearGradient colors={["#4CAF50", "#FFD93D"]} style={styles.contenedor}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorTitulo}>¡Ups!</Text>
          <Text style={styles.errorSubtitulo}>Este nivel no tiene alimentos</Text>
          <TouchableOpacity 
            style={styles.errorBoton} 
            onPress={() => navigation.navigate("Secciones")}
          >
            <Text style={styles.errorBotonTexto}>← Volver</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  const preguntas = useMemo(() => mezclar(nivel.alimentos), [nivelId]);

  const [indice, setIndice] = useState(0);
  const [estrellas, setEstrellas] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [fallos, setFallos] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [bloqueado, setBloqueado] = useState(false);
  const [confeti, setConfeti] = useState(false);
  const [juegoTerminado, setJuegoTerminado] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const yaNavego = useRef(false);

  const preguntaActual = preguntas[indice];
  const progreso = ((indice) / preguntas.length) * 100;

  useEffect(() => {
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

  // MENSAJES MOTIVADORES 
  const mensajesMotivadores = [
    "¡No pasa nada! Sigue así 💪",
    "¡Casi! Tú puedes 🌟",
    "¡Ánimo! La próxima será ✨",
    "¡Sigue intentando! 😊",
    "¡Buen intento! Continúa 🚀",
  ];

  async function responder(eligioSaludable) {
    if (bloqueado || juegoTerminado) return;
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
      setFallos((f) => f + 1);
    }

    setTimeout(async () => {
      setFeedback(null);
      setBloqueado(false);
      
      if (indice + 1 < preguntas.length) {
        setIndice((i) => i + 1);
      } else {
        // COMPLETÓ EL JUEGO
        setJuegoTerminado(true);
        // Calcular los valores finales correctamente
        const totalAciertos = aciertos + (esCorrecto ? 1 : 0);
        const totalFallos = fallos + (esCorrecto ? 0 : 1);
        
        await guardarProgresoNivel(nivelId, totalAciertos, preguntas.length);
        await registrarPartidaJugada();
        reproducirVictoria();
        setConfeti(true);
        
        setTimeout(() => {
          if (!yaNavego.current) {
            yaNavego.current = true;
            // ENVIAR TODOS LOS DATOS CORRECTAMENTE
            navigation.replace('PantallaResultados', {
              nivelId,
              aciertos: totalAciertos,
              total: preguntas.length,
              fallidos: totalFallos,  //ENVÍA LOS FALLOS
              perdido: false,
            });
          }
        }, 1500);
      }
    }, 1200);
  }

  //OBTENER MENSAJE DEL PERSONAJE 
  function getMensajeMono() {
    if (juegoTerminado) return "¡Eres increíble! 🌟";
    if (feedback === "acierto") return "¡Excelente! 🌟";
    if (feedback === "fallo") return mensajesMotivadores[Math.floor(Math.random() * mensajesMotivadores.length)];
    return "¡Piénsalo bien! 🤔";
  }

  return (
    <LinearGradient
      colors={["#14c8bf", "#107b7d", "#0d142b"]}
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

      {/* ARRA DE PROGRESO  */}
      <View style={styles.barraProgresoFondo}>
        <View style={[styles.barraProgresoFill, { width: `${progreso}%` }]} />
      </View>
      
      {/* CONTADOR DE ACIERTOS Y FALLOS */}
      <View style={styles.contadorContainer}>
        <Text style={styles.contadorTexto}>
          ✅ Aciertos: {aciertos}  ❌ Fallos: {fallos}
        </Text>
        <Text style={styles.contadorPreguntas}>{indice + 1} / {preguntas.length}</Text>
      </View>

      {/* TARJETA CON IMAGEN */}
      <Animated.View style={[
        styles.tarjeta,
        { transform: [{ scale: scaleAnim }, { translateX: shakeAnim }] },
      ]}>
        <Animated.View style={styles.imagenTarjetaWrapper}>
          <ImagenAlimento fuente={preguntaActual.imagen} tamanio={180} animar={false} estilo={styles.imagenTarjeta} />
        </Animated.View>
        <Text style={styles.nombreComida}>{preguntaActual.nombre}</Text>
      </Animated.View>

      {/* PREGUNTA*/}
      <View style={styles.cajaPregunta}>
        <Text style={styles.textoPregunta}>¿Es SALUDABLE o CHATARRA?</Text>
      </View>

      {/* BOTONES */}
      <View style={styles.filaBotones}>
        <TouchableOpacity
          style={[styles.boton, styles.botonSaludable]}
          onPress={() => responder(true)}
          disabled={bloqueado || juegoTerminado}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#4CAF50", "#07aa0f"]}
            style={styles.botonGradiente}
          >
            <Text style={styles.botonEmoji}>😊</Text>
            <Text style={styles.botonTexto}>SALUDABLE</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.boton, styles.botonChatarra]}
          onPress={() => responder(false)}
          disabled={bloqueado || juegoTerminado}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#fd5454", "#c10606"]}
            style={styles.botonGradiente}
          >
            <Text style={styles.botonEmoji}>😞</Text>
            <Text style={styles.botonTexto}>CHATARRA</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* FEEDBACK */}
      {feedback && (
        <View style={[styles.feedbackBox, feedback === "acierto" ? styles.feedbackOk : styles.feedbackMal]}>
          <Text style={styles.feedbackTexto}>
            {feedback === "acierto" ? "🎉 ¡CORRECTO! +1 ⭐" : "💪 ¡Casi! ¡Tú puedes!"}
          </Text>
        </View>
      )}

      {/* ======*/}
      <View style={styles.filaMono}>
        <Image source={require("../assets/imagenes/chef2.png")} style={styles.chefImage} resizeMode="contain" />
        <View style={styles.burbujaMono}>
          <Text style={styles.textoBurbuja}>{getMensajeMono()}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  // Contenedor principal de la pantalla
  contenedor: { flex: 1, paddingTop: 40, paddingHorizontal: 16, paddingBottom: 20 },
  
  // Estilos para la pantalla de error si el nivel no carga
  errorContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 20 
  },
  errorEmoji: { fontSize: 64, marginBottom: 20 },
  errorTitulo: { fontSize: 28, fontWeight: "900", color: "#fff", marginBottom: 10 },
  errorSubtitulo: { fontSize: 16, color: "rgba(255,255,255,0.8)", textAlign: "center", marginBottom: 30 },
  errorBoton: { backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 20, paddingVertical: 12, paddingHorizontal: 24 },
  errorBotonTexto: { fontSize: 18, fontWeight: "700", color: "#fff" },

  // Fondos decorativos en la pantalla
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
  // Barra superior con botón atrás, título y estrellas
  barraSuperior: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  botonVolver: { backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 15, paddingVertical: 8, paddingHorizontal: 15 },
  flecha: { fontSize: 24, color: "#fff", fontWeight: "900" },
  tituloNivel: { fontSize: 20, fontWeight: "800", color: "#fff", flex: 1, textAlign: "center" },
  estrellasBadge: { backgroundColor: "rgba(255,215,0,0.3)", borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12 },
  estrellas: { fontSize: 16, fontWeight: "900", color: "#FFD700" },
  
  barraProgresoFondo: { height: 8, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 6, overflow: "hidden", marginBottom: 4 },
  barraProgresoFill: { height: "100%", backgroundColor: "#80ff00", borderRadius: 6 },
  
  contadorContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  contadorTexto: { fontSize: 14, color: "#fff", fontWeight: "700" },
  contadorPreguntas: { fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: "700" },
  
  // Tarjeta principal que muestra la comida y la pregunta
  tarjeta: {
    backgroundColor: "rgba(255, 252, 252, 0.95)",
    borderRadius: 40,
    alignItems: "center",
    paddingVertical: 46,
    marginBottom: 28,
    elevation: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  imagenTarjetaWrapper: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    minHeight: 240,
  },
  imagenTarjeta: {
    width: 180,
    height: 180,
  },
  nombreComida: { fontSize: 28, fontWeight: "900", color: "#023f5e", marginTop: 15 },
  // Caja que contiene la pregunta del juego
  cajaPregunta: { backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 18, paddingVertical: 17, alignItems: "center", marginBottom: 20 },
  textoPregunta: { fontSize: 20, fontWeight: "900", color: "#023f5e" },
  // Fila de botones saludables / chatarras
  filaBotones: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginTop: -5, marginBottom: 20 },
  boton: { flex: 1, borderRadius: 20, overflow: "hidden", elevation: 8 },
  botonGradiente: { paddingVertical: 18, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 10 },
  botonSaludable: { shadowColor: "#052b06", shadowOffset: { width: 0, height:4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  botonChatarra: { shadowColor: "#912020", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  botonEmoji: { fontSize: 32 },
  botonTexto: { fontSize: 18, fontWeight: "900", color: "#fff" },
  feedbackBox: { borderRadius: 20, paddingVertical: 12
    , alignItems: "center", marginBottom: 10, borderWidth: 2, borderColor: "#fff" },
  feedbackOk: { backgroundColor: "#4CAF50" },
  feedbackMal: { backgroundColor: "#FF8A65" },
  feedbackTexto: { fontSize: 20, fontWeight: "900", color: "#fff" },
  // Barra del chef con mensaje motivador
  filaMono: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 18,
    paddingVertical: 10,
  },
  chefImage: { width: 40, height: 40, borderRadius: 20 },
  emojiMono: { fontSize: 40 },
  burbujaMono: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 18,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },

  textoBurbuja: {
    fontSize: 18,
    fontWeight: "900",
    color: "#023f5e",
    textAlign: "center",
  },
});