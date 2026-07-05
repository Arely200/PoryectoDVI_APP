import React, { useEffect, useRef } from "react";
import { Text, Animated, StyleSheet, View } from "react-native";

const PERSONAJES = {
  mono: "🐒",
  oso: "🐻",
  panda: "🐼",
  zorro: "🦊",
  conejo: "🐰",
};

export default function Personaje({ 
  tipo = "mono", 
  imagen = null,
  tamanio = 60, 
  mensaje = "",
  animar = true,
  estilo = {},
  circulo = true,
  bordeImagen = null,
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

  const radioImagen = bordeImagen != null ? bordeImagen : circulo ? tamanio / 2 : 12;

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
      {imagen ? (
        <Animated.View style={[styles.imagenContenedor, { width: tamanio, height: tamanio, borderRadius: radioImagen }]}>
          <Animated.Image
            source={imagen}
            style={[styles.imagen, { width: tamanio, height: tamanio, borderRadius: radioImagen }]}
            resizeMode="cover"
          />
        </Animated.View>
      ) : (
        <Text style={[styles.emoji, { fontSize: tamanio }]}> 
          {PERSONAJES[tipo] || "🐒"}
        </Text>
      )}
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
  imagenContenedor: {
    overflow: "hidden",
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  imagen: {
    width: "100%",
    height: "100%",
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