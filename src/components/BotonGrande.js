import React, { useRef } from "react";
import { TouchableOpacity, Text, Animated, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function BotonGrande({ 
  onPress, 
  texto, 
  emoji, 
  colors = ["#4CAF50", "#2E7D32"],
  disabled = false,
  style = {}
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={1}
      style={[styles.wrapper, style]}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <LinearGradient
          colors={disabled ? ["#BDBDBD", "#9E9E9E"] : colors}
          style={styles.boton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {emoji && <Text style={styles.emoji}>{emoji}</Text>}
          <Text style={[styles.texto, disabled && styles.textoDisabled]}>{texto}</Text>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    minWidth: 120,
    minHeight: 65,
  },
  boton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    gap: 12,
  },
  emoji: {
    fontSize: 28,
  },
  texto: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  textoDisabled: {
    opacity: 0.6,
  },
});