import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";

export default function PersonajeSaludable({ size = 180, animar = true, mensaje = "", style = {} }) {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animar) return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -12, duration: 900, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    ).start();
  }, [animar, floatAnim]);

  const faceSize = size * 0.45;
  const bodyHeight = size * 0.35;

  return (
    <Animated.View
      style={[
        styles.container,
        { width: size, height: size + 20, transform: [{ translateY: floatAnim }] },
        style,
      ]}
    >
      <View style={styles.foodCluster}>
        {['🥑', '🍎', '🥕', '🍓', '🥦'].map((emoji, index) => (
          <View key={index} style={[styles.foodBubble, styles[`food${index + 1}`]]}>
            <Text style={styles.foodEmoji}>{emoji}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.character, { paddingTop: faceSize * 0.1 }]}> 
        <View style={[styles.hair, { width: faceSize * 1.05, height: faceSize * 0.4, borderRadius: faceSize * 0.25 }]} />
        <View style={[styles.face, { width: faceSize, height: faceSize, borderRadius: faceSize / 2 }]}> 
          <View style={styles.eyesRow}>
            <View style={styles.eye} />
            <View style={styles.eye} />
          </View>
          <View style={styles.mouth} />
        </View>
        <View style={[styles.body, { width: faceSize * 1.1, height: bodyHeight, borderRadius: faceSize * 0.25 }]}>
          <View style={styles.shirt} />
          <View style={styles.armsRow}>
            <View style={styles.arm} />
            <View style={styles.arm} />
          </View>
        </View>
      </View>

      {mensaje ? (
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{mensaje}</Text>
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: "transparent",
  },
  foodCluster: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  foodBubble: {
    position: "absolute",
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
  },
  food1: { top: 12, left: 10 },
  food2: { top: 16, right: 14 },
  food3: { top: 76, left: 2 },
  food4: { top: 68, right: 4 },
  food5: { bottom: 22, left: 20 },
  foodEmoji: {
    fontSize: 20,
  },
  character: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  hair: {
    backgroundColor: "#8d5524",
    marginBottom: -12,
  },
  face: {
    backgroundColor: "#f2c7a0",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  eyesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "50%",
    marginBottom: 8,
  },
  eye: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2d1f12",
  },
  mouth: {
    width: 24,
    height: 10,
    borderBottomWidth: 3,
    borderColor: "#853e04",
    borderRadius: 12,
  },
  body: {
    backgroundColor: "#6fbf73",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 18,
    paddingBottom: 10,
    marginTop: -14,
  },
  shirt: {
    width: "100%",
    height: 16,
    backgroundColor: "#56a05d",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  armsRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginTop: 8,
  },
  arm: {
    width: 18,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#f2c7a0",
  },
  bubble: {
    position: "absolute",
    bottom: -24,
    left: "8%",
    right: "8%",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
  },
  bubbleText: {
    color: "#1b5e20",
    fontWeight: "800",
    fontSize: 14,
    textAlign: "center",
  },
});
