// src/screens/PantallaLogros.js
import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { leerNombre, leerEstrellas, leerProgreso, leerEstadisticas, reiniciarProgreso } from "../utils/almacenamiento";
import { NIVELES } from "../data/niveles";

const MEDALLAS = [
  { emoji: "🥉", requisito: 5, nombre: "PRINCIPIANTE" },
  { emoji: "🥈", requisito: 10, nombre: "CAMPEÓN" },
  { emoji: "🥇", requisito: 15, nombre: "SUPER HÉROE" },
];

export default function PantallaLogros() {
  const [nombre, setNombre] = useState("");
  const [estrellas, setEstrellas] = useState(0);
  const [progreso, setProgreso] = useState({});
  const [stats, setStats] = useState({ partidasJugadas: 0, ultimaVez: null });

  async function cargarDatos() {
    setNombre(await leerNombre());
    setEstrellas(await leerEstrellas());
    setProgreso(await leerProgreso());
    setStats(await leerEstadisticas());
  }

  useFocusEffect(useCallback(() => { cargarDatos(); }, []));

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
        {/* HEADER - Saludo más abajo */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.emojiHeader}>🏆</Text>
          </View>
          <Text style={styles.saludo}>👋 ¡Hola, {nombre || "Amigo"}!</Text>
          <View style={styles.tituloLinea} />
        </View>

        {/* ESTRELLAS */}
        <View style={styles.cajaEstrellas}>
          <LinearGradient
            colors={["#FFF9C4", "#FFE082"]}
            style={styles.cajaEstrellasGradiente}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.totalEstrellas}>⭐ {estrellas} ⭐</Text>
          </LinearGradient>
        </View>

        {/* MEDALLAS */}
        <Text style={styles.seccion}>🏅 Medallas</Text>
        <View style={styles.filaMedallas}>
          {MEDALLAS.map((m) => (
            <View key={m.nombre} style={[styles.tarjetaMedalla, estrellas >= m.requisito && styles.tarjetaObtenida]}>
              <Text style={[styles.emojiMedalla, estrellas < m.requisito && styles.atenuado]}>{m.emoji}</Text>
              <Text style={[styles.nombreMedalla, estrellas < m.requisito && styles.atenuado]}>{m.nombre}</Text>
              <Text style={styles.requisitoMedalla}>{m.requisito} ⭐</Text>
              {estrellas >= m.requisito && <Text style={styles.checkMedalla}>✅</Text>}
            </View>
          ))}
        </View>

        {/* PROGRESO */}
        <Text style={styles.seccion}>📊 Progreso por nivel</Text>
        {NIVELES.map((n) => {
          const data = progreso[n.id];
          const completado = data && data.aciertos === data.total;
          return (
            <View key={n.id} style={styles.filaNivel}>
              <Text style={styles.iconoNivel}>
                {!data ? "🔒" : completado ? "✅" : "⏳"}
              </Text>
              <Text style={styles.nombreNivel}>Nivel {n.id}: {n.titulo}</Text>
              <Text style={[styles.detalleNivel, completado && styles.detalleCompletado]}>
                {data ? `${data.aciertos}/${data.total}` : "Sin jugar"}
              </Text>
            </View>
          );
        })}

        {/* ESTADÍSTICAS */}
        <Text style={styles.seccion}>📈 Estadísticas</Text>
        <View style={styles.estadisticasContainer}>
          <View style={styles.estadisticaItem}>
            <Text style={styles.estadisticaEmoji}>🎮</Text>
            <Text style={styles.estadisticaTexto}>Partidas jugadas: {stats.partidasJugadas}</Text>
          </View>
          <View style={styles.estadisticaItem}>
            <Text style={styles.estadisticaEmoji}>🕒</Text>
            <Text style={styles.estadisticaTexto}>Última vez: {stats.ultimaVez ? new Date(stats.ultimaVez).toLocaleDateString() : "Aún no juega"}</Text>
          </View>
        </View>

        {/* BOTÓN REINICIAR */}
        <TouchableOpacity 
          style={styles.botonReiniciar} 
          onPress={() => Alert.alert("Reiniciar progreso", "¿Seguro?", [
            { text: "Cancelar", style: "cancel" }, 
            { text: "Sí", onPress: async () => { await reiniciarProgreso(); cargarDatos(); } }
          ])}
        >
          <LinearGradient
            colors={["#E53935", "#C62828"]}
            style={styles.botonReiniciarGradiente}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.textoReiniciar}>🗑️ REINICIAR PROGRESO</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },

  // DECORACIÓN DE FONDO
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
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 30,
    position: "relative",
    zIndex: 1,
  },

  header: { 
    alignItems: "center", 
    marginBottom: 16,
    marginTop: 20,
  },
  headerTop: {
    marginBottom: 4,
  },
  emojiHeader: {
    fontSize: 40,
  },
  saludo: { 
    fontSize: 26, 
    fontWeight: "bold", 
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
    marginTop: 4,
  },
  tituloLinea: {
    width: 60,
    height: 3,
    backgroundColor: "#FFD93D",
    borderRadius: 2,
    marginTop: 6,
  },

  cajaEstrellas: { 
    marginVertical: 12,
    borderRadius: 30,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  cajaEstrellasGradiente: { 
    paddingVertical: 14, 
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,215,0,0.3)",
    borderRadius: 30,
  },
  totalEstrellas: { 
    fontSize: 34, 
    fontWeight: "bold", 
    color: "#F57C00" 
  },

  seccion: { 
    fontSize: 20, 
    fontWeight: "bold", 
    color: "#FFFFFF",
    marginTop: 18, 
    marginBottom: 10, 
    borderBottomWidth: 2, 
    borderBottomColor: "rgba(255,255,255,0.2)", 
    paddingBottom: 6,
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  filaMedallas: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    gap: 8 
  },
  tarjetaMedalla: { 
    flex: 1, 
    backgroundColor: "rgba(255,255,255,0.9)", 
    borderRadius: 16, 
    padding: 12, 
    alignItems: "center", 
    borderWidth: 2, 
    borderColor: "rgba(255,255,255,0.3)", 
    minHeight: 100, 
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  tarjetaObtenida: { 
    backgroundColor: "rgba(255,255,255,0.95)", 
    borderColor: "#FFD93D",
    borderWidth: 3,
  },
  emojiMedalla: { 
    fontSize: 34 
  },
  atenuado: { 
    opacity: 0.3 
  },
  nombreMedalla: { 
    fontSize: 11, 
    fontWeight: "bold", 
    marginTop: 4, 
    textAlign: "center", 
    color: "#333" 
  },
  requisitoMedalla: { 
    fontSize: 10, 
    color: "#777", 
    marginTop: 2, 
    fontWeight: "600" 
  },
  checkMedalla: { 
    position: "absolute", 
    top: 4, 
    right: 4, 
    fontSize: 14 
  },

  filaNivel: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "rgba(255,255,255,0.9)", 
    borderRadius: 14, 
    padding: 14, 
    marginBottom: 8, 
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  iconoNivel: { 
    fontSize: 20, 
    marginRight: 12 
  },
  nombreNivel: { 
    flex: 1, 
    fontSize: 15, 
    color: "#333", 
    fontWeight: "600" 
  },
  detalleNivel: { 
    fontSize: 14, 
    color: "#777", 
    fontWeight: "500" 
  },
  detalleCompletado: {
    color: "#4CAF50",
    fontWeight: "700",
  },

  estadisticasContainer: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  estadisticaItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  estadisticaEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  estadisticaTexto: { 
    fontSize: 15, 
    color: "#444", 
    fontWeight: "500" 
  },

  botonReiniciar: { 
    marginTop: 16, 
    marginBottom: 20, 
    borderRadius: 20, 
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#E53935",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  botonReiniciarGradiente: { 
    paddingVertical: 14, 
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 20,
  },
  textoReiniciar: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: 16 
  },
});