// src/screens/JuegoSeleccionar.js
import React, { useState, useMemo, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NIVELES, mezclar } from "../data/niveles";
import { sumarEstrellas, guardarProgresoNivel, registrarPartidaJugada } from "../utils/almacenamiento";
import {
  reproducirAcierto, reproducirFallo, reproducirVictoria,
  vozSelBien, vozSelMal, vozInicioBebidas, vozDerrota, sonidoFondo,
  detenerSonidosActuales,
} from "../utils/sonidos";
import ImagenAlimento from "../components/ImagenAlimento";
import Confeti from "../components/Confeti";

export default function JuegoSeleccionar({ route, navigation }) {
  const { nivelId } = route.params;
  const nivel = NIVELES.find((n) => n.id === nivelId);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const yaNavego = useRef(false);
  const timerRef = useRef(null);
  const timeoutRef = useRef(null);

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

  // ── Animación de pulso ──
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // ── Voz de inicio con control de volumen ──
  useEffect(() => {
    timerRef.current = setTimeout(async () => {
      try {
        if (sonidoFondo) {
          await sonidoFondo.setVolumeAsync(0.08);
        }
        await vozInicioBebidas();
        timeoutRef.current = setTimeout(() => {
          if (sonidoFondo) {
            sonidoFondo.setVolumeAsync(0.5);
          }
        }, 4000);
      } catch (error) {
        console.log('Error en voz de inicio:', error);
        if (sonidoFondo) {
          sonidoFondo.setVolumeAsync(0.5);
        }
      }
    }, 500);

    return () => {
      detenerSonidosActuales();
      if (timerRef.current) clearTimeout(timerRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (sonidoFondo) {
        sonidoFondo.setVolumeAsync(0.5);
      }
    };
  }, []);

  // ── Limpiar al salir de la pantalla ──
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      detenerSonidosActuales();
      if (sonidoFondo) {
        sonidoFondo.setVolumeAsync(0.5);
      }
    });
    return unsubscribe;
  }, [navigation]);

  const items = useMemo(() => mezclar(nivel.alimentos), [nivelId]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [errores, setErrores] = useState([]);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [estrellas, setEstrellas] = useState(0);
  const [confeti, setConfeti] = useState(false);
  const [intentosFallidos, setIntentosFallidos] = useState(0);

  const saludables = items.filter(i => i.saludable);
  const totalSaludables = saludables.length;

  // ── Función para bajar y subir volumen al reproducir voces ──
  const bajarVolumen = async () => {
    try {
      if (sonidoFondo) {
        await sonidoFondo.setVolumeAsync(0.08);
      }
    } catch (e) {}
  };

  const subirVolumen = async () => {
    try {
      if (sonidoFondo) {
        await sonidoFondo.setVolumeAsync(0.5);
      }
    } catch (e) {}
  };

  const handleVolver = () => {
    detenerSonidosActuales();
    if (sonidoFondo) {
      sonidoFondo.setVolumeAsync(0.5);
    }
    navigation.navigate("Secciones");
  };

  function handleSeleccion(item) {
    if (juegoTerminado) return;
    if (seleccionados.includes(item.nombre) || errores.includes(item.nombre)) return;

    if (item.saludable) {
      // ✅ ACIERTO 
      const nuevosSeleccionados = [...seleccionados, item.nombre];
      setSeleccionados(nuevosSeleccionados);
      setEstrellas(nuevosSeleccionados.length);
      
      bajarVolumen();
      try { reproducirAcierto(); } catch (e) {}
      try { vozSelBien(); } catch (e) {}
      setTimeout(() => subirVolumen(), 2000);
      
      if (nuevosSeleccionados.length === totalSaludables) {
        setJuegoTerminado(true);
        const puntaje = totalSaludables;
        setEstrellas(puntaje);
        sumarEstrellas(puntaje);
        guardarProgresoNivel(nivelId, puntaje, totalSaludables);
        registrarPartidaJugada();
        bajarVolumen();
        try { reproducirVictoria(); } catch (e) {}
        setConfeti(true);
        setTimeout(() => subirVolumen(), 3000);
        
        setTimeout(() => {
          if (!yaNavego.current) {
            yaNavego.current = true;
            detenerSonidosActuales();
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
      // ❌ ERROR
      const nuevosErrores = [...errores, item.nombre];
      setErrores(nuevosErrores);
      const fallos = intentosFallidos + 1;
      setIntentosFallidos(fallos);
      
      bajarVolumen();
      try { reproducirFallo(); } catch (e) {}
      try { vozSelMal(); } catch (e) {} // ← Usa voz_sel_mal_1 y voz_sel_mal_2
      setTimeout(() => subirVolumen(), 2000);
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
        <TouchableOpacity onPress={handleVolver} style={styles.botonVolver}>
          <Text style={styles.textoVolver}>←</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>{nivel.titulo}</Text>
        <View style={styles.estrellasBadge}>
          <Text style={styles.estrellas}>⭐ {estrellas}</Text>
        </View>
      </View>

      <View style={styles.vidasContainer}>
        <Text style={styles.vidasTexto}>
          Aciertos: {seleccionados.length}   Fallos: {intentosFallidos}
        </Text>
      </View>

      <View style={styles.cajaInstruccion}>
        <Text style={styles.instruccion}>
          {juegoTerminado ? "🎉 ¡Completado!" : " Toca las bebidas saludables"}
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
        <Image source={require("../assets/imagenes/chef2.png")} style={styles.chefImage} resizeMode="contain" />
        <View style={styles.burbujaMono}>
          <Text style={styles.textoBurbuja}>
            {juegoTerminado ? "¡Eres increíble! 🌟" : 
             intentosFallidos > 3 ? "¡Sigue intentando, tú puedes! 💪" :
             intentosFallidos > 0 ? "¡Muy bien! Sigue así " : 
             "¡Toca las saludables! "}
          </Text>
        </View>
      </View>
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
    minHeight: 120,
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
  chefImage: { width: 40, height: 40, borderRadius: 20 },
  emojiMono: { fontSize: 40 },
  burbujaMono: { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 16, paddingVertical: 8, paddingHorizontal: 16 },
  textoBurbuja: { fontSize: 16, fontWeight: "700", color: "#fff" },
});