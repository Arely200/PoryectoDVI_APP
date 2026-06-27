import React, { useEffect, useRef } from "react";
import { Text, Animated, StyleSheet } from "react-native";

const PERSONAJES = {
  mono: "🐒",
  oso: "🐻",
  panda: "🐼",
  zorro: "🦊",
  conejo: "🐰",
};

export default function Personaje({ 
  tipo = "mono", 
  tamanio = 60, 
  mensaje = "",
  animar = true,
  estilo = {}
}) {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animar) return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -12,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.06,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.contenedor,
        {
          transform: [{ translateY: bounceAnim }, { scale: scaleAnim }],
        },
        estilo,
      ]}
    >
      <Text style={[styles.emoji, { fontSize: tamanio }]}>
        {PERSONAJES[tipo] || "🐒"}
      </Text>
      {mensaje ? (
        <Animated.View style={styles.burbuja}>
          <Text style={styles.mensaje}>{mensaje}</Text>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: "center",
  },
  emoji: {
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 2, height: 4 },
    textShadowRadius: 6,
  },
  burbuja: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mensaje: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E7D32",
  },
});