// src/components/TarjetaMedalla.js
// Tarjeta visual para mostrar cada medalla en la pantalla de Logros.

import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function TarjetaMedalla({ emoji, requisito, nombre, obtenida }) {
  return (
    <View style={[styles.tarjeta, obtenida && styles.tarjetaObtenida]}>
      <Text style={[styles.emoji, !obtenida && styles.atenuado]}>{emoji}</Text>
      <Text style={[styles.nombre, !obtenida && styles.atenuado]}>{nombre}</Text>
      <Text style={styles.requisito}>{requisito} ⭐</Text>
      {obtenida && <Text style={styles.check}>✅</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    flex: 1,
    backgroundColor: "#F1F1F1",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },
  tarjetaObtenida: {
    backgroundColor: "#E8F5E9",
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  emoji: { fontSize: 36 },
  atenuado: { opacity: 0.35 },
  nombre: { fontSize: 12, fontWeight: "bold", marginTop: 4, textAlign: "center" },
  requisito: { fontSize: 11, color: "#777", marginTop: 2 },
  check: { position: "absolute", top: 4, right: 4, fontSize: 14 },
});
