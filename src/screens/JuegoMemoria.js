// src/screens/JuegoMemoria.js
// Juego de memoria: encontrar las parejas de emojis iguales.
import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { NIVELES, mezclar } from "../data/niveles";
import { sumarEstrellas, guardarProgresoNivel, registrarPartidaJugada } from "../utils/almacenamiento";

export default function JuegoMemoria({ route, navigation }) {
  const { nivelId } = route.params;
  const nivel = NIVELES.find((n) => n.id === nivelId);

  // Tomamos 6 alimentos y creamos pares (12 cartas).
  const cartas = useMemo(() => {
    const seleccion = mezclar(nivel.alimentos).slice(0, 6);
    const pares = seleccion.flatMap((item, i) => [
      { id: `${i}-a`, parId: i, emoji: item.emoji, volteada: false, encontrada: false },
      { id: `${i}-b`, parId: i, emoji: item.emoji, volteada: false, encontrada: false },
    ]);
    return mezclar(pares);
  }, [nivelId]);

  const [estado, setEstado] = useState(cartas);
  const [seleccionadas, setSeleccionadas] = useState([]);
  const [aciertos, setAciertos] = useState(0);
  const [estrellas, setEstrellas] = useState(0);
  const [bloqueado, setBloqueado] = useState(false);

  async function tocarCarta(carta) {
    if (bloqueado || carta.volteada || carta.encontrada) return;

    const nuevoEstado = estado.map((c) => (c.id === carta.id ? { ...c, volteada: true } : c));
    setEstado(nuevoEstado);
    const nuevaSeleccion = [...seleccionadas, carta];
    setSeleccionadas(nuevaSeleccion);

    if (nuevaSeleccion.length === 2) {
      setBloqueado(true);
      const [a, b] = nuevaSeleccion;
      const esPar = a.parId === b.parId;

      setTimeout(async () => {
        if (esPar) {
          const nuevosAciertos = aciertos + 1;
          setAciertos(nuevosAciertos);
          await sumarEstrellas(1);
          setEstrellas((e) => e + 1);
          setEstado((prev) =>
            prev.map((c) => (c.parId === a.parId ? { ...c, encontrada: true, volteada: true } : c))
          );

          if (nuevosAciertos === 6) {
            await guardarProgresoNivel(nivelId, 6, 6);
            await registrarPartidaJugada();
            navigation.replace("Resultados", { nivelId, aciertos: 6, total: 6 });
            return;
          }
        } else {
          setEstado((prev) =>
            prev.map((c) => (c.id === a.id || c.id === b.id ? { ...c, volteada: false } : c))
          );
        }
        setSeleccionadas([]);
        setBloqueado(false);
      }, 800);
    }
  }

  return (
    <View style={styles.contenedor}>
      <View style={styles.barraSuperior}>
        <Text style={styles.titulo}>{nivel.titulo}</Text>
        <Text style={styles.estrellas}>⭐ {estrellas}</Text>
      </View>
      <Text style={styles.instruccion}>¡Encuentra las parejas!</Text>

      <View style={styles.tablero}>
        {estado.map((carta) => (
          <TouchableOpacity
            key={carta.id}
            style={[styles.carta, carta.encontrada && styles.cartaEncontrada]}
            onPress={() => tocarCarta(carta)}
            activeOpacity={0.8}
          >
            <Text style={styles.emojiCarta}>{carta.volteada || carta.encontrada ? carta.emoji : "❓"}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#FFF3E0", padding: 16, paddingTop: 40 },
  barraSuperior: { flexDirection: "row", justifyContent: "space-between" },
  titulo: { fontSize: 16, fontWeight: "bold", color: "#333" },
  estrellas: { fontSize: 16, fontWeight: "bold", color: "#FBC02D" },
  instruccion: { textAlign: "center", fontSize: 14, color: "#555", marginVertical: 12 },
  tablero: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  carta: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "#FF7043",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cartaEncontrada: { backgroundColor: "#A5D6A7" },
  emojiCarta: { fontSize: 34 },
});