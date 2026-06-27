// src/components/ImagenAlimento.js
import React, { useEffect, useRef } from "react";
import { Image, StyleSheet, Animated } from "react-native";

export default function ImagenAlimento({ 
  fuente, 
  tamanio = 80,
  animar = true,
  estilo = {},
  efecto = "flotar"
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animar) return;

    // Efecto 1: Flotación suave
    if (efecto === "flotar") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 1400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    // Efecto 2: Brillo pulsante
    if (efecto === "brillo") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    // Efecto 3: Respiración + rotación
    if (efecto === "respirar") {
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
    }

    // Efecto 4: Balanceo (como si estuviera en el agua)
    if (efecto === "balancear") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: -1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-6deg', '6deg'],
  });

  const glow = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  return (
    <Animated.View
      style={[
        styles.contenedor,
        {
          transform: [
            { translateY: bounceAnim },
            { scale: scaleAnim },
            { rotate: rotate }
          ],
          opacity: glow,
        },
        estilo
      ]}
    >
      <Image
        source={fuente}
        style={[styles.imagen, { width: tamanio, height: tamanio }]}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  imagen: {
    borderRadius: 16,
  },
});