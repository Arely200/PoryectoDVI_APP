// src/screens/JuegoSeleccionar.js
import React, { useState, useMemo, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NIVELES, mezclar } from "../data/niveles";
import { sumarEstrellas, guardarProgresoNivel, registrarPartidaJugada } from "../utils/almacenamiento";
import { reproducirAcierto, reproducirFallo, reproducirVictoria } from "../utils/sonidos";
import ImagenAlimento from "../components/ImagenAlimento";
import Confeti from "../components/Confeti";

export default function JuegoSeleccionar({ route, navigation }) {
  const { nivelId } = route.params;
  const nivel = NIVELES.find((n) => n.id === nivelId);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const mensajeAnim = useRef(new Animated.Value(0)).current;
  const yaNavego = useRef(false);

  // ========== VALIDACIÓN: Datos del nivel ==========
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

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const items = useMemo(() => mezclar(nivel.alimentos), [nivelId]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [errores, setErrores] = useState([]);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [estrellas, setEstrellas] = useState(0);
  const [mensajeAbajo, setMensajeAbajo] = useState(null);
  const [mensajeEmoji, setMensajeEmoji] = useState("");
  const [mostrarMensaje, setMostrarMensaje] = useState(false);
  const [confeti, setConfeti] = useState(false);
  const [intentosFallidos, setIntentosFallidos] = useState(0);

  const saludables = items.filter(i => i.saludable);
  const totalSaludables = saludables.length;

  const mostrarMensajeAbajo = (emoji, texto) => {
    setMensajeEmoji(emoji);
    setMensajeAbajo(texto);
    setMostrarMensaje(true);
    mensajeAnim.setValue(0);
    Animated.spring(mensajeAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      Animated.timing(mensajeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setMostrarMensaje(false);
        setMensajeAbajo(null);
      });
    }, 1800);
  };

  function handleSeleccion(item) {
    if (juegoTerminado) return;
    if (seleccionados.includes(item.nombre) || errores.includes(item.nombre)) return;

    if (item.saludable) {
      // ========== ACIERTO ==========
      const nuevosSeleccionados = [...seleccionados, item.nombre];
      setSeleccionados(nuevosSeleccionados);
      setEstrellas(nuevosSeleccionados.length);
      reproducirAcierto();
      mostrarMensajeAbajo("✅", "¡Bien hecho! Es saludable");
      
      if (nuevosSeleccionados.length === totalSaludables) {
        setJuegoTerminado(true);
        const puntaje = totalSaludables;
        setEstrellas(puntaje);
        sumarEstrellas(puntaje);
        guardarProgresoNivel(nivelId, puntaje, totalSaludables);
        registrarPartidaJugada();
        reproducirVictoria();
        setConfeti(true);
        
        setTimeout(() => {
          if (!yaNavego.current) {
            yaNavego.current = true;
            navigation.replace('PantallaResultados', {
              nivelId,
              aciertos: puntaje,
              total: totalSaludables,
              fallidos: errores.length,
              perdido: false,
            });
          }
        }, 1500);
      }
    } else {
      // ========== ERROR ==========
      const nuevosErrores = [...errores, item.nombre];
      setErrores(nuevosErrores);
      const fallos = intentosFallidos + 1;
      setIntentosFallidos(fallos);
      reproducirFallo();
      
      // Mensajes motivadores para niños (sin decir "perdiste")
      const mensajes = [
        "¡Ups! Esa no es saludable, ¡sigue intentando! 💪",
        "¡Casi! Esa no es, ¡tú puedes! 🌟",
        "¡No pasa nada! Intenta con otra 😊",
        "¡Sigue buscando la saludable! 🔍",
        "¡Ánimo! La siguiente será la buena ✨",
      ];
      const mensajeAleatorio = mensajes[Math.floor(Math.random() * mensajes.length)];
      mostrarMensajeAbajo("😊", mensajeAleatorio);
    }
  }

  function getItemStyle(item) {
    const estaSeleccionado = seleccionados.includes(item.nombre);
    const esError = errores.includes(item.nombre);
    
    if (estaSeleccionado) return styles.itemCorrecto;
    if (esError) return styles.itemError;
    return styles.itemNormal;
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
          <Text style={styles.textoVolver}>←</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>{nivel.titulo}</Text>
        <View style={styles.estrellasBadge}>
          <Text style={styles.estrellas}>⭐ {estrellas}</Text>
        </View>
      </View>

      {/* ========== MOSTRAR INTENTOS FALLIDOS ========== */}
      <View style={styles.vidasContainer}>
        <Text style={styles.vidasTexto}>
          ✅ Aciertos: {seleccionados.length}  ❌ Fallos: {intentosFallidos}
        </Text>
      </View>

      <View style={styles.cajaInstruccion}>
        <Text style={styles.instruccion}>
          {juegoTerminado ? "🎉 ¡Completado!" : "👆 Toca las bebidas saludables"}
        </Text>
      </View>

      <Animated.View style={[styles.contadorContainer, { transform: [{ scale: pulseAnim }] }]}>
        <Text style={styles.contador}>{seleccionados.length} de {totalSaludables}</Text>
      </Animated.View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.grid}>
          {items.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={getItemStyle(item)}
              onPress={() => handleSeleccion(item)}
              activeOpacity={0.7}
              disabled={juegoTerminado || seleccionados.includes(item.nombre) || errores.includes(item.nombre)}
            >
              <ImagenAlimento fuente={item.imagen} tamanio={85} animar={true} />
              <View style={styles.iconoContainer}>
                <Text style={styles.icono}>
                  {seleccionados.includes(item.nombre) ? "✅" : 
                   errores.includes(item.nombre) ? "❌" : ""}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {juegoTerminado && (
        <LinearGradient colors={["#4CAF50", "#2E7D32"]} style={styles.mensajeFinal}>
          <Text style={styles.mensajeFinalTexto}>🎉 ¡Excelente!</Text>
        </LinearGradient>
      )}

      <View style={styles.filaMono}>
        <Text style={styles.emojiMono}>🐒</Text>
        <View style={styles.burbujaMono}>
          <Text style={styles.textoBurbuja}>
            {juegoTerminado ? "¡Eres increíble! 🌟" : 
             intentosFallidos > 3 ? "¡Sigue intentando, tú puedes! 💪" :
             intentosFallidos > 0 ? "¡Muy bien! Sigue así 💪" : 
             "¡Toca las saludables! 👆"}
          </Text>
        </View>
      </View>

      {mostrarMensaje && mensajeAbajo && (
        <Animated.View style={[
          styles.mensajeAbajo,
          {
            opacity: mensajeAnim,
            transform: [{ scale: mensajeAnim }],
          }
        ]}>
          <LinearGradient 
            colors={mensajeEmoji === "✅" ? ["#4CAF50", "#2E7D32"] : ["#FF8A65", "#E64A19"]}
            style={styles.mensajeAbajoFondo}
          >
            <Text style={styles.mensajeAbajoEmoji}>{mensajeEmoji}</Text>
            <Text style={styles.mensajeAbajoTexto}>{mensajeAbajo}</Text>
          </LinearGradient>
        </Animated.View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, padding: 16, paddingTop: 44 },
  
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

  fondoDecoracion: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden" },
  circulo1: { position: "absolute", top: -80, right: -80, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(255,255,255,0.1)" },
  circulo2: { position: "absolute", bottom: -60, left: -60, width: 150, height: 150, borderRadius: 75, backgroundColor: "rgba(255,255,255,0.08)" },
  
  barraSuperior: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  botonVolver: { backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 20, padding: 8, paddingHorizontal: 14 },
  textoVolver: { fontSize: 24, color: "#fff", fontWeight: "900" },
  titulo: { fontSize: 18, fontWeight: "900", color: "#fff", flex: 1, textAlign: "center" },
  estrellasBadge: { backgroundColor: "rgba(255,215,0,0.3)", borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12 },
  estrellas: { fontSize: 16, fontWeight: "900", color: "#FFD700" },
  
  vidasContainer: { marginBottom: 8, alignItems: "center" },
  vidasTexto: { fontSize: 16, fontWeight: "700", color: "#fff", textAlign: "center" },

  cajaInstruccion: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 24, paddingVertical: 14, alignItems: "center", marginBottom: 8, borderWidth: 2, borderColor: "rgba(255,255,255,0.2)" },
  instruccion: { fontSize: 18, fontWeight: "900", color: "#fff", textAlign: "center" },
  contadorContainer: { alignItems: "center", marginBottom: 10 },
  contador: { fontSize: 18, fontWeight: "800", color: "#fff", backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 20, paddingVertical: 6, borderRadius: 20 },
  
  scrollContent: { flexGrow: 1, paddingBottom: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  
  itemNormal: { 
    width: "30%", 
    backgroundColor: "rgba(255,255,255,0.9)", 
    borderRadius: 20, 
    alignItems: "center", 
    justifyContent: "center", 
    paddingVertical: 12, 
    marginBottom: 12, 
    borderWidth: 3, 
    borderColor: "rgba(255,255,255,0.3)", 
    elevation: 4,
    minHeight: 130,
  },
  itemCorrecto: { 
    width: "30%", 
    backgroundColor: "#C8E6C9", 
    borderRadius: 20, 
    alignItems: "center", 
    justifyContent: "center", 
    paddingVertical: 16, 
    marginBottom: 12, 
    borderWidth: 4, 
    borderColor: "#4CAF50", 
    elevation: 4,
    minHeight: 130,
  },
  itemError: { 
    width: "30%", 
    backgroundColor: "#FFCCBC", 
    borderRadius: 20, 
    alignItems: "center", 
    justifyContent: "center", 
    paddingVertical: 12, 
    marginBottom: 12, 
    borderWidth: 4, 
    borderColor: "#FF8A65", 
    elevation: 4,
    minHeight: 130,
  },
  
  iconoContainer: { position: "absolute", top: 4, right: 4 },
  icono: { fontSize: 24 },
  
  mensajeFinal: { borderRadius: 20, padding: 14, marginTop: 10, alignItems: "center", borderWidth: 3, borderColor: "rgba(255,255,255,0.5)", elevation: 6 },
  mensajeFinalTexto: { fontSize: 24, fontWeight: "bold", color: "#fff" },
  
  filaMono: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 24, paddingVertical: 10, paddingHorizontal: 16, marginTop: 8 },
  emojiMono: { fontSize: 40 },
  burbujaMono: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 16, paddingVertical: 8, paddingHorizontal: 16 },
  textoBurbuja: { fontSize: 16, fontWeight: "700", color: "#fff" },

  mensajeAbajo: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    zIndex: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: "90%",
  },
  mensajeAbajoFondo: {
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  mensajeAbajoEmoji: { fontSize: 32 },
  mensajeAbajoTexto: {
    fontSize: 20,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
  },
});