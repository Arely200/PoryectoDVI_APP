// src/screens/JuegoArmarPlato.js
// El niño arrastra los alimentos de abajo hacia el plato grande
// para armar su platillo saludable. Al confirmar, se revisa
// qué tan saludable quedó el plato.
import React, { useState, useRef, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, PanResponder, Dimensions } from "react-native";
import { NIVELES, mezclar } from "../data/niveles";
import { sumarEstrellas, guardarProgresoNivel, registrarPartidaJugada } from "../utils/almacenamiento";

const { width, height } = Dimensions.get("window");
const ALTURA_ZONA_PLATO = height * 0.42; // si sueltas arriba de esta línea, cae en el plato

export default function JuegoArmarPlato({ route, navigation }) {
  const { nivelId } = route.params;
  const nivel = NIVELES.find((n) => n.id === nivelId);
  const items = useMemo(() => mezclar(nivel.alimentos).slice(0, 6), [nivelId]);

  // Una posición animada (pan) por cada alimento.
  const posiciones = useRef(items.map(() => new Animated.ValueXY())).current;
  const [colocados, setColocados] = useState(() => items.map(() => false));
  const [revisado, setRevisado] = useState(false);

  function crearPanResponder(indice) {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => !colocados[indice] && !revisado,
      onPanResponderMove: Animated.event(
        [null, { dx: posiciones[indice].x, dy: posiciones[indice].y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (evento, gesto) => {
        const seSolto = gesto.moveY < ALTURA_ZONA_PLATO;
        if (seSolto) {
          setColocados((prev) => prev.map((v, i) => (i === indice ? true : v)));
          Animated.spring(posiciones[indice], {
            toValue: { x: gesto.dx, y: gesto.dy },
            useNativeDriver: false,
          }).start();
        } else {
          Animated.spring(posiciones[indice], {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    });
  }

  const panResponders = useRef(items.map((_, i) => crearPanResponder(i))).current;

  async function confirmarPlato() {
    setRevisado(true);
    const totalSaludables = items.filter((i) => i.saludable).length;
    const colocadosSaludables = items.filter((item, i) => colocados[i] && item.saludable).length;
    const puntaje = colocadosSaludables;

    await sumarEstrellas(puntaje);
    await guardarProgresoNivel(nivelId, puntaje, totalSaludables);
    await registrarPartidaJugada();

    setTimeout(() => {
      navigation.replace("Resultados", { nivelId, aciertos: puntaje, total: totalSaludables });
    }, 1600);
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>{nivel.titulo}</Text>
      <Text style={styles.instruccion}>¡Arrastra la comida sana hasta el plato!</Text>

      <View style={styles.zonaPlato}>
        <View style={styles.plato}>
          <Text style={styles.emojiPlato}>🍽️</Text>
        </View>
      </View>

      <View style={styles.bandejaAlimentos}>
        {items.map((item, i) => (
          <Animated.View
            key={item.nombre}
            {...panResponders[i].panHandlers}
            style={[
              styles.itemArrastrable,
              colocados[i] && revisado
                ? item.saludable
                  ? styles.itemCorrecto
                  : styles.itemIncorrecto
                : null,
              { transform: posiciones[i].getTranslateTransform() },
            ]}
          >
            <Text style={styles.emojiItem}>{item.emoji}</Text>
          </Animated.View>
        ))}
      </View>

      {!revisado && (
        <TouchableOpacity style={styles.boton} onPress={confirmarPlato}>
          <Text style={styles.textoBoton}>✅ ¡LISTO!</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#FFF8E1", paddingTop: 40, paddingHorizontal: 16 },
  titulo: { fontSize: 18, fontWeight: "bold", color: "#5D4037", textAlign: "center" },
  instruccion: { textAlign: "center", fontSize: 13, color: "#777", marginVertical: 8 },
  zonaPlato: { height: height * 0.32, alignItems: "center", justifyContent: "center" },
  plato: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#fff",
    borderWidth: 6,
    borderColor: "#FFD54F",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  emojiPlato: { fontSize: 50, opacity: 0.3 },
  bandejaAlimentos: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 10,
  },
  itemArrastrable: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    margin: 8,
    elevation: 3,
  },
  itemCorrecto: { backgroundColor: "#C8E6C9", borderWidth: 3, borderColor: "#4CAF50" },
  itemIncorrecto: { backgroundColor: "#FFCCBC", borderWidth: 3, borderColor: "#FF7043" },
  emojiItem: { fontSize: 34 },
  boton: {
    backgroundColor: "#FFB300",
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: "center",
    marginTop: 14,
    marginBottom: 20,
  },
  textoBoton: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});