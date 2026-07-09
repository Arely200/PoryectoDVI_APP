// src/screens/PantallaBienvenida.js
import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "react-native";

import { 
  vozBienvenida, 
  sonidoFondo,
  iniciarMusicaFondo,
  detenerSonidosActuales,
} from "../utils/sonidos";

const { width, height } = Dimensions.get("window");

const STARS = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  top: Math.random() * height,
  left: Math.random() * width,
  size: Math.random() * 3 + 1.5,
  duration: Math.random() * 2000 + 1500,
  delay: Math.random() * 2000,
}));

function StarDot({ top, left, size, duration, delay }) {
  const opacity = useRef(new Animated.Value(0.2)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 0.9, duration, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.2, duration, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={{
      position: "absolute",
      top, left,
      width: size, height: size,
      borderRadius: size / 2,
      backgroundColor: "white",
      opacity,
    }} />
  );
}

export default function PantallaBienvenida({ navigation }) {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const scaleAnim  = useRef(new Animated.Value(0.8)).current;
  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const floatAnims = useRef([0, 1, 2, 3, 4, 5].map(() => new Animated.Value(0))).current;
  const timerRef = useRef(null);
  const timeoutRef = useRef(null);

  // ── Animaciones visuales ──
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -20, duration: 900, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0,   duration: 900, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 700, useNativeDriver: true }),
      ])
    ).start();

    floatAnims.forEach((anim, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 400),
          Animated.timing(anim, { toValue: -18, duration: 1400, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0,   duration: 1400, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  // ── Iniciar música al montar ──
  useEffect(() => {
    const iniciarMusica = async () => {
      try {
        await iniciarMusicaFondo();
      } catch (error) {
        console.log("Error iniciando música:", error);
      }
    };
    iniciarMusica();

    return () => {
      // Limpiar timeouts
      if (timerRef.current) clearTimeout(timerRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // ── Voz de bienvenida con control de volumen ──
  useEffect(() => {
    timerRef.current = setTimeout(async () => {
      try {
        // 1. Bajar música al mínimo
        if (sonidoFondo) {
          await sonidoFondo.setVolumeAsync(0.05);
        }
        
        // 2. Reproducir voz
        await vozBienvenida();
        
        // 3. Restaurar música después de la voz
        timeoutRef.current = setTimeout(async () => {
          if (sonidoFondo) {
            await sonidoFondo.setVolumeAsync(0.5);
          }
        }, 4500);
        
      } catch (error) {
        console.log("Error en voz de bienvenida:", error);
        // Si hay error, restaurar música igual
        setTimeout(async () => {
          if (sonidoFondo) {
            await sonidoFondo.setVolumeAsync(0.5);
          }
        }, 2000);
      }
    }, 900);
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // ── Limpiar al salir de la pantalla ──
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      // Detener cualquier sonido en reproducción
      detenerSonidosActuales();
      // Restaurar volumen
      if (sonidoFondo) {
        sonidoFondo.setVolumeAsync(0.5);
      }
    });
    return unsubscribe;
  }, [navigation]);

  // ── Ocultar tab bar ──
  useEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => parent?.setOptions({ tabBarStyle: undefined });
  }, [navigation]);

  const handleJugar = () => {
    // Detener sonidos y restaurar volumen antes de navegar
    detenerSonidosActuales();
    if (sonidoFondo) {
      sonidoFondo.setVolumeAsync(0.5);
    }
    navigation.replace("Secciones");
  };

  return (
    <View style={styles.contenedor}>

      {/* FONDO */}
      <LinearGradient
        colors={["#14c8bf", "#107b7d", "#0d142b"]}
        style={StyleSheet.absoluteFill}
      />

      {/* GLOWS */}
      <View style={[styles.glow, styles.glow1]} />
      <View style={[styles.glow, styles.glow2]} />
      <View style={[styles.glow, styles.glow3]} />

      {/* ESTRELLAS */}
      {STARS.map((s) => <StarDot key={s.id} {...s} />)}

      {/* CÍRCULOS DECORATIVOS */}
      <View style={styles.fondoDecoracion}>
        <View style={styles.circulo1} />
        <View style={styles.circulo2} />
        <View style={styles.circulo3} />
        <View style={styles.circulo4} />
      </View>

      {/* EMOTICONES FLOTANTES */}
      <View style={styles.flotantesContainer}>
        {[
          [floatAnims[0], styles.flotante1, "🍎"],
          [floatAnims[1], styles.flotante2, "🥑"],
          [floatAnims[2], styles.flotante3, "🥦"],
          [floatAnims[3], styles.flotante4, "🍕"],
          [floatAnims[4], styles.flotante5, "🍇"],
          [floatAnims[5], styles.flotante6, "🌽"],
        ].map(([anim, pos, emoji], i) => (
          <Animated.Text
            key={i}
            style={[styles.flotante, pos, { transform: [{ translateY: anim }] }]}
          >
            {emoji}
          </Animated.Text>
        ))}
      </View>

      {/* CONTENIDO CENTRAL */}
      <Animated.View style={[styles.centro, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>

        {/* MASCOTA */}
        <Animated.View style={[styles.mascotaContenedor, { transform: [{ translateY: bounceAnim }, { scale: scaleAnim }] }]}>
          <Image
            source={require("../assets/imagenes/chef2.png")}
            style={styles.mascotaImagen}
            resizeMode="contain"
          />
        </Animated.View>

        {/* TÍTULO */}
        <View style={styles.cajaTitle}>
          <Text style={styles.titulo}>COME</Text>
          <Text style={styles.tituloDestacado}>SALUDABLE</Text>
        </View>

        {/* BOTÓN JUGAR */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity style={styles.boton} onPress={handleJugar} activeOpacity={0.8}>
            <LinearGradient
              colors={["#03eb16ef", "#09f5fdf5"]}
              style={styles.botonGradiente}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.textoBoton}>¡JUGAR!</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* ESTRELLAS */}
        <View style={styles.estrellitas}>
          {["⭐", "⭐", "⭐"].map((s, i) => (
            <Text key={i} style={styles.estrella}>{s}</Text>
          ))}
        </View>

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  glow: { position: "absolute", borderRadius: 999 },
  glow1: { width: 280, height: 280, top: -80,   left: -60,  backgroundColor: "#fb9494", opacity: 0.25 },
  glow2: { width: 240, height: 240, bottom: -60, right: -50, backgroundColor: "#fdd122", opacity: 0.25 },
  glow3: { width: 160, height: 160, top: "38%",  left: "28%",backgroundColor: "#0eed2c", opacity: 0.15 },

  fondoDecoracion: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    overflow: "hidden",
  },
  circulo1: { position: "absolute", top: -80,      right: -80, width: 280, height: 280, borderRadius: 140, backgroundColor: "rgba(255,255,255,0.05)" },
  circulo2: { position: "absolute", bottom: -60,   left: -60,  width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(255,255,255,0.04)" },
  circulo3: { position: "absolute", top: "30%",    right: -40, width: 140, height: 140, borderRadius: 70,  backgroundColor: "rgba(255,255,255,0.03)" },
  circulo4: { position: "absolute", bottom: "20%", left: -30,  width: 100, height: 100, borderRadius: 50,  backgroundColor: "rgba(0,229,160,0.08)"   },

  flotantesContainer: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 1,
  },
  flotante:  { position: "absolute", fontSize: 40, opacity: 0.75 },
  flotante1: { top: 30,       left: 20   },
  flotante2: { top: 80,       right: 20  },
  flotante3: { top: 150,      left: -10  },
  flotante4: { top: 200,      right: -10 },
  flotante5: { bottom: 130,   left: 10   },
  flotante6: { bottom: 80,    right: 10  },

  centro: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    zIndex: 10,
  },
  mascotaContenedor: {
    width: 320,
    height: 360,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  mascotaImagen: {
    width: 320,
    height: 360,
  },

  cajaTitle: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 30,
    paddingHorizontal: 30,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 30,
    borderWidth: 1.5,
    borderColor: "rgba(0,229,160,0.35)",
  },
  titulo: {
    fontSize: 44,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 2,
  },
  tituloDestacado: {
    fontSize: 44,
    fontWeight: "900",
    color: "#bbe500",
    letterSpacing: 1,
  },

  boton: {
    borderRadius: 70,
    overflow: "hidden",
    elevation: 12,
    shadowColor: "#00a706",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  botonGradiente: {
    paddingVertical: 25,
    paddingHorizontal: 60,
  },
  textoBoton: {
    fontSize: 32,
    fontWeight: "900",
    color: "#1B5E20",
  },

  estrellitas: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  estrella: {
    fontSize: 24,
    opacity: 0.8,
  },
});