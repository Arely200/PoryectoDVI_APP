import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export default function Confeti({ duracion = 3000, cantidad = 30 }) {
  const confetis = useRef(
    Array.from({ length: cantidad }, () => ({
      left: Math.random() * width,
      delay: Math.random() * 1000,
      size: Math.random() * 20 + 10,
      color: ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#FF6BD6"][Math.floor(Math.random() * 5)],
      anim: new Animated.Value(0),
      rotate: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    confetis.forEach((confeti, i) => {
      Animated.parallel([
        Animated.timing(confeti.anim, {
          toValue: 1,
          duration: duracion + confeti.delay,
          useNativeDriver: true,
        }),
        Animated.timing(confeti.rotate, {
          toValue: 1,
          duration: duracion + confeti.delay,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  return (
    <View style={styles.contenedor} pointerEvents="none">
      {confetis.map((confeti, i) => {
        const translateY = confeti.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -height * 0.6],
        });
        const translateX = confeti.anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, (Math.random() - 0.5) * 200, (Math.random() - 0.5) * 300],
        });
        const rotate = confeti.rotate.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", `${Math.random() * 720}deg`],
        });
        const opacity = confeti.anim.interpolate({
          inputRange: [0, 0.8, 1],
          outputRange: [1, 1, 0],
        });

        return (
          <Animated.View
            key={i}
            style={[
              styles.confeti,
              {
                left: confeti.left,
                width: confeti.size,
                height: confeti.size * 0.5,
                backgroundColor: confeti.color,
                transform: [{ translateY }, { translateX }, { rotate }],
                opacity,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  confeti: {
    position: "absolute",
    top: height * 0.6,
    borderRadius: 2,
  },
});