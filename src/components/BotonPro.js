// src/components/BotonPro.js
import React, { useRef } from "react";
import { TouchableOpacity, Text, StyleSheet, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function BotonPro({ 
  onPress, 
  texto, 
  emoji = "",
  colors = ["#FF6B6B", "#FF8E53"],
  tamanio = "grande",
  estilo = {},
  disabled = false,
  brillo = true
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (brillo) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.04,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getSize = () => {
    switch(tamanio) {
      case "pequeño": return { padding: 10, fontSize: 14 };
      case "medio": return { padding: 14, fontSize: 18 };
      case "grande": return { padding: 20, fontSize: 24 };
      default: return { padding: 20, fontSize: 24 };
    }
  };

  const size = getSize();

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.9}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <LinearGradient
            colors={disabled ? ["#BDBDBD", "#9E9E9E"] : colors}
            style={[styles.boton, { paddingVertical: size.padding, paddingHorizontal: size.padding * 2 }, estilo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {emoji && <Text style={[styles.emoji, { fontSize: size.fontSize + 8 }]}>{emoji}</Text>}
            <Text style={[styles.texto, { fontSize: size.fontSize }]}>{texto}</Text>
            <View style={styles.brilloEfecto} />
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  boton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    position: "relative",
    overflow: "hidden",
  },
  emoji: {
    marginRight: 10,
  },
  texto: {
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 1,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  brilloEfecto: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
});