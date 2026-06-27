// src/screens/PantallaBienvenida.js
import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Personaje from "../components/Personaje"; // ✅ Importa el componente

const { width, height } = Dimensions.get("window");

export default function PantallaBienvenida({ navigation }) {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnims = useRef([0,1,2,3,4,5].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -20, duration: 900, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();

    floatAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 400),
          Animated.timing(anim, { toValue: -18, duration: 1400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 1400, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  const handleJugar = () => {
    navigation.replace("Secciones");
  };

  return (
    <LinearGradient
      colors={["#E8F5E9", "#A5D6A7", "#66BB6A"]}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={styles.contenedor}
    >
      {/* DECORACIÓN DE FONDO */}
      <View style={styles.fondoDecoracion}>
        <View style={styles.circulo1} />
        <View style={styles.circulo2} />
        <View style={styles.circulo3} />
        <View style={styles.circulo4} />
      </View>

      {/* EMOTICONES FLOTANTES */}
      <View style={styles.flotantesContainer}>
        <Animated.Text style={[styles.flotante, styles.flotante1, { transform: [{ translateY: floatAnims[0] }] }]}>
          🍎
        </Animated.Text>
        <Animated.Text style={[styles.flotante, styles.flotante2, { transform: [{ translateY: floatAnims[1] }] }]}>
          🥑
        </Animated.Text>
        <Animated.Text style={[styles.flotante, styles.flotante3, { transform: [{ translateY: floatAnims[2] }] }]}>
          🥦
        </Animated.Text>
        <Animated.Text style={[styles.flotante, styles.flotante4, { transform: [{ translateY: floatAnims[3] }] }]}>
          🍕
        </Animated.Text>
        <Animated.Text style={[styles.flotante, styles.flotante5, { transform: [{ translateY: floatAnims[4] }] }]}>
          🍇
        </Animated.Text>
        <Animated.Text style={[styles.flotante, styles.flotante6, { transform: [{ translateY: floatAnims[5] }] }]}>
          🌽
        </Animated.Text>
      </View>

      <Animated.View style={[styles.centro, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        
        {/* ✅ MASCOTA CON EL COMPONENTE PERSONAJE */}
        <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
          <Personaje 
            tipo="mono"        // 🐒
            tamanio={100}      // Tamaño grande para la bienvenida
            animar={true}      // Rebota solito
            mensaje="¡Bienvenido!" 
            estilo={styles.mascotaPersonaje}
          />
        </Animated.View>

        <View style={styles.cajaTitle}>
          <Text style={styles.titulo}>COMIDA</Text>
          <Text style={styles.tituloDestacado}>DIVERTIDA</Text>
        </View>

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={styles.boton}
            onPress={handleJugar}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#FFD93D", "#FFA000"]}
              style={styles.botonGradiente}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.textoBoton}>🎮 ¡JUGAR!</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.estrellitas}>
          {["⭐", "⭐", "⭐"].map((s, i) => (
            <Text key={i} style={styles.estrella}>{s}</Text>
          ))}
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  contenedor: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    position: "relative",
  },

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
    backgroundColor: "rgba(255,255,255,0.15)" 
  },
  circulo2: { 
    position: "absolute", 
    bottom: -60, 
    left: -60, 
    width: 220, 
    height: 220, 
    borderRadius: 110, 
    backgroundColor: "rgba(255,255,255,0.10)" 
  },
  circulo3: { 
    position: "absolute", 
    top: "30%", 
    right: -40, 
    width: 140, 
    height: 140, 
    borderRadius: 70, 
    backgroundColor: "rgba(255,255,255,0.08)" 
  },
  circulo4: { 
    position: "absolute", 
    bottom: "20%", 
    left: -30, 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: "rgba(255,215,0,0.10)" 
  },

  flotantesContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  flotante: {
    position: "absolute",
    fontSize: 40,
    opacity: 0.6,
  },
  flotante1: { top: 30, left: 20 },
  flotante2: { top: 80, right: 20 },
  flotante3: { top: 150, left: -10 },
  flotante4: { top: 200, right: -10 },
  flotante5: { bottom: 130, left: 10 },
  flotante6: { bottom: 80, right: 10 },

  centro: { 
    alignItems: "center", 
    justifyContent: "center", 
    flex: 1,
    zIndex: 10,
  },
  
  mascotaPersonaje: {
    marginBottom: 5,
  },

  cajaTitle: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 30, 
    paddingHorizontal: 30, 
    paddingVertical: 14,
    alignItems: "center", 
    marginBottom: 30,
    borderWidth: 2, 
    borderColor: "rgba(255,255,255,0.3)",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  titulo: { 
    fontSize: 44, 
    fontWeight: "900", 
    color: "#2E7D32", 
    letterSpacing: 2,
  },
  tituloDestacado: { 
    fontSize: 44, 
    fontWeight: "900", 
    color: "#E65100", 
    letterSpacing: 1,
  },

  boton: {
    borderRadius: 60,
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#FFA000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  botonGradiente: {
    paddingVertical: 20, 
    paddingHorizontal: 60, 
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
  },
  textoBoton: { 
    fontSize: 32, 
    fontWeight: "900", 
    color: "#1B5E20" 
  },
  estrellitas: { 
    flexDirection: "row", 
    gap: 10, 
    marginTop: 18 
  },
  estrella: { 
    fontSize: 24,
    opacity: 0.7,
  },
});