// src/components/BotonRespuesta.js
// Botón cuadrado grande reutilizado en la pantalla de juego
// para las opciones "SALUDABLE" y "CHATARRA".

import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

export default function BotonRespuesta({ emoji, texto, color, onPress, deshabilitado }) {
  return (
    <TouchableOpacity
      style={[styles.boton, { backgroundColor: color }]}
      onPress={onPress}
      disabled={deshabilitado}
      activeOpacity={0.8}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.texto}>{texto}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  boton: {
    flex: 1,
    paddingVertical: 28,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
    elevation: 3,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  texto: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
});
