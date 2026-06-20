// src/screens/PantallaLogros.js
import React, { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import TarjetaMedalla from "../components/TarjetaMedalla";
import {
  leerNombre,
  leerEstrellas,
  leerProgreso,
  leerEstadisticas,
  reiniciarProgreso,
} from "../utils/almacenamiento";
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

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [])
  );

  function confirmarReinicio() {
    Alert.alert(
      "Reiniciar progreso",
      "Esta opción es solo para maestros. ¿Seguro que deseas borrar todo el progreso del niño?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, reiniciar",
          style: "destructive",
          onPress: async () => {
            await reiniciarProgreso();
            cargarDatos();
          },
        },
      ]
    );
  }

  function iconoNivel(nivelId) {
    const datos = progreso[nivelId];
    if (!datos) return "🔒";
    if (datos.aciertos === datos.total) return "✅";
    return "⏳";
  }

  function textoNivel(nivelId) {
    const datos = progreso[nivelId];
    if (!datos) return "Sin jugar";
    return `${datos.aciertos}/${datos.total}`;
  }

  return (
    <ScrollView style={styles.contenedor} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.saludo}>¡Hola, {nombre || "Amigo"}!</Text>

      <View style={styles.cajaEstrellas}>
        <Text style={styles.totalEstrellas}>⭐ {estrellas} ⭐</Text>
      </View>

      <Text style={styles.seccion}>Medallas</Text>
      <View style={styles.filaMedallas}>
        {MEDALLAS.map((m) => (
          <TarjetaMedalla
            key={m.nombre}
            emoji={m.emoji}
            nombre={m.nombre}
            requisito={m.requisito}
            obtenida={estrellas >= m.requisito}
          />
        ))}
      </View>

      <Text style={styles.seccion}>Progreso por nivel</Text>
      {NIVELES.map((n) => (
        <View key={n.id} style={styles.filaNivel}>
          <Text style={styles.iconoNivel}>{iconoNivel(n.id)}</Text>
          <Text style={styles.nombreNivel}>Nivel {n.id}: {n.titulo}</Text>
          <Text style={styles.detalleNivel}>{textoNivel(n.id)}</Text>
        </View>
      ))}

      <Text style={styles.seccion}>Estadísticas</Text>
      <Text style={styles.estadistica}>🎮 Partidas jugadas: {stats.partidasJugadas}</Text>
      <Text style={styles.estadistica}>
        🕒 Última vez: {stats.ultimaVez ? new Date(stats.ultimaVez).toLocaleDateString() : "Aún no juega"}
      </Text>

      <TouchableOpacity style={styles.botonReiniciar} onPress={confirmarReinicio}>
        <Text style={styles.textoReiniciar}>🗑️ REINICIAR PROGRESO</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#F1F8E9" },
  saludo: { fontSize: 24, fontWeight: "bold", color: "#2E7D32" },
  cajaEstrellas: { alignItems: "center", marginVertical: 16 },
  totalEstrellas: { fontSize: 30, fontWeight: "bold", color: "#FBC02D" },
  seccion: { fontSize: 16, fontWeight: "bold", color: "#333", marginTop: 20, marginBottom: 8 },
  filaMedallas: { flexDirection: "row" },
  filaNivel: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  iconoNivel: { fontSize: 18, marginRight: 10 },
  nombreNivel: { flex: 1, fontSize: 14, color: "#333" },
  detalleNivel: { fontSize: 14, color: "#777" },
  estadistica: { fontSize: 14, color: "#555", marginBottom: 4 },
  botonReiniciar: {
    marginTop: 28,
    backgroundColor: "#E57373",
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
  },
  textoReiniciar: { color: "#fff", fontWeight: "bold" },
});
