// src/screens/JuegoPlato.js
// El niño toca los alimentos saludables para "agregarlos al plato"
// y confirma con un botón. Selección múltiple, no respuesta inmediata.
import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { NIVELES, mezclar } from "../data/niveles";
import { sumarEstrellas, guardarProgresoNivel, registrarPartidaJugada } from "../utils/almacenamiento";

export default function JuegoPlato({ route, navigation }) {
  const { nivelId } = route.params;
  const nivel = NIVELES.find((n) => n.id === nivelId);
  const items = useMemo(() => mezclar(nivel.alimentos), [nivelId]);

  const [seleccionados, setSeleccionados] = useState([]);
  const [revisado, setRevisado] = useState(false);

  function alternarSeleccion(item) {
    if (revisado) return;
    setSeleccionados((prev) =>
      prev.includes(item.nombre) ? prev.filter((n) => n !== item.nombre) : [...prev, item.nombre]
    );
  }

  async function confirmarPlato() {
    setRevisado(true);
    const saludablesTotales = items.filter((i) => i.saludable).map((i) => i.nombre);
    const aciertos = saludablesTotales.filter((n) => seleccionados.includes(n)).length;
    const puntaje = aciertos;
    await sumarEstrellas(puntaje);
    await guardarProgresoNivel(nivelId, puntaje, saludablesTotales.length);
    await registrarPartidaJugada();

    setTimeout(() => {
      navigation.replace("Resultados", { nivelId, aciertos: puntaje, total: saludablesTotales.length });
    }, 1500);
  }

  function estiloItem(item) {
    const elegido = seleccionados.includes(item.nombre);
    if (!revisado) return elegido ? styles.itemElegido : styles.item;
    if (item.saludable && elegido) return styles.itemCorrecto;
    if (!item.saludable && elegido) return styles.itemIncorrecto;
    return styles.item;
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>{nivel.titulo}</Text>
      <Text style={styles.instruccion}>¡Toca todo lo que es saludable y luego confirma!</Text>

      <View style={styles.grid}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.nombre}
            style={estiloItem(item)}
            onPress={() => alternarSeleccion(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.emojiItem}>{item.emoji}</Text>
            <Text style={styles.nombreItem}>{item.nombre}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.bandeja}>
        <Text style={styles.tituloBandeja}>🍽️ Tu plato: {seleccionados.length} alimento(s)</Text>
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
  contenedor: { flex: 1, backgroundColor: "#E1F5FE", padding: 16, paddingTop: 40 },
  titulo: { fontSize: 18, fontWeight: "bold", color: "#01579B", textAlign: "center" },
  instruccion: { textAlign: "center", fontSize: 13, color: "#555", marginVertical: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  item: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 16,
    alignItems: "center",
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#fff",
  },
  itemElegido: {
    width: "47%",
    backgroundColor: "#E3F2FD",
    borderRadius: 16,
    alignItems: "center",
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#29B6F6",
  },
  itemCorrecto: {
    width: "47%",
    backgroundColor: "#C8E6C9",
    borderRadius: 16,
    alignItems: "center",
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#4CAF50",
  },
  itemIncorrecto: {
    width: "47%",
    backgroundColor: "#FFCCBC",
    borderRadius: 16,
    alignItems: "center",
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: "#FF7043",
  },
  emojiItem: { fontSize: 32 },
  nombreItem: { fontSize: 11, fontWeight: "bold", color: "#333", marginTop: 4, textAlign: "center" },
  bandeja: { backgroundColor: "#fff", borderRadius: 14, padding: 12, alignItems: "center", marginTop: 6 },
  tituloBandeja: { fontSize: 14, fontWeight: "bold", color: "#01579B" },
  boton: { backgroundColor: "#29B6F6", paddingVertical: 16, borderRadius: 28, alignItems: "center", marginTop: 14 },
  textoBoton: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});