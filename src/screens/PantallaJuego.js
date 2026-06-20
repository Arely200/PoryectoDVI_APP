// src/screens/PantallaJuego.js
// Juego de preguntas con dos botones: Saludable o Chatarra.
import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import BotonRespuesta from "../components/BotonRespuesta";
import { NIVELES, mezclar } from "../data/niveles";
import { sumarEstrellas, guardarProgresoNivel, registrarPartidaJugada } from "../utils/almacenamiento";
import { reproducirAcierto, reproducirFallo, reproducirVictoria } from "../utils/sonidos";

export default function PantallaJuego({ route, navigation }) {
  const { nivelId } = route.params;
  const nivel = NIVELES.find((n) => n.id === nivelId);

  const preguntas = useMemo(() => mezclar(nivel.alimentos), [nivelId]);

  const [indice, setIndice] = useState(0);
  const [estrellas, setEstrellas] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [bloqueado, setBloqueado] = useState(false);

  const preguntaActual = preguntas[indice];

  async function responder(eligioSaludable) {
    if (bloqueado) return;
    setBloqueado(true);

    const esCorrecto = eligioSaludable === preguntaActual.saludable;

    if (esCorrecto) {
      setFeedback("acierto");
      reproducirAcierto();
      setAciertos((a) => a + 1);
      const nuevasEstrellas = await sumarEstrellas(1);
      setEstrellas((e) => e + 1);
    } else {
      setFeedback("fallo");
      reproducirFallo();
    }

    setTimeout(async () => {
      setFeedback(null);
      setBloqueado(false);

      if (indice + 1 < preguntas.length) {
        setIndice((i) => i + 1);
      } else {
        reproducirVictoria();
        await guardarProgresoNivel(nivelId, aciertos + (esCorrecto ? 1 : 0), preguntas.length);
        await registrarPartidaJugada();
        navigation.replace("Resultados", {
          nivelId,
          aciertos: aciertos + (esCorrecto ? 1 : 0),
          total: preguntas.length,
        });
      }
    }, 1200);
  }

  return (
    <View style={styles.contenedor}>
      <View style={styles.barraSuperior}>
        <TouchableOpacity onPress={() => navigation.navigate("Secciones")}>
          <Text style={styles.flecha}>←</Text>
        </TouchableOpacity>
        <Text style={styles.tituloNivel}>NIVEL {nivelId}: {nivel.titulo}</Text>
        <Text style={styles.contadorEstrellas}>⭐ {estrellas}</Text>
      </View>

      <View style={styles.tarjeta}>
        <Text style={styles.emojiComida}>{preguntaActual.emoji}</Text>
        <Text style={styles.nombreComida}>{preguntaActual.nombre}</Text>
      </View>

      <View style={styles.cajaPregunta}>
        <Text style={styles.textoPregunta}>¿Es SALUDABLE o CHATARRA?</Text>
      </View>

      <View style={styles.filaBotones}>
        <BotonRespuesta
          emoji="😊"
          texto="SALUDABLE"
          color="#4CAF50"
          onPress={() => responder(true)}
          deshabilitado={bloqueado}
        />
        <BotonRespuesta
          emoji="😞"
          texto="CHATARRA"
          color="#FF9800"
          onPress={() => responder(false)}
          deshabilitado={bloqueado}
        />
      </View>

      {feedback === "acierto" && (
        <Text style={styles.feedbackAcierto}>🧒 ¡BIENNN! +1 ⭐</Text>
      )}
      {feedback === "fallo" && (
        <Text style={styles.feedbackFallo}>🤷 ¡UPS! La próxima será</Text>
      )}

      <View style={styles.burbuja}>
        <Text style={styles.mono}>🐒</Text>
        <Text style={styles.textoBurbuja}>
          {feedback === "acierto" ? "¡Muy bien hecho!" : feedback === "fallo" ? "¡Tú puedes!" : "¡Piénsalo bien!"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, backgroundColor: "#F1F8E9", padding: 16 },
  barraSuperior: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  flecha: { fontSize: 26, color: "#4CAF50" },
  tituloNivel: { fontSize: 16, fontWeight: "bold", color: "#333" },
  contadorEstrellas: { fontSize: 16, fontWeight: "bold", color: "#FBC02D" },
  tarjeta: {
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "#4CAF50",
    borderRadius: 32,
    alignItems: "center",
    paddingVertical: 32,
    marginTop: 24,
  },
  emojiComida: { fontSize: 90 },
  nombreComida: { fontSize: 26, fontWeight: "bold", color: "#2E7D32", marginTop: 8 },
  cajaPregunta: {
    backgroundColor: "#FFF9C4",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  textoPregunta: { fontSize: 18, fontWeight: "bold", color: "#5D4037" },
  filaBotones: { flexDirection: "row", marginTop: 20 },
  feedbackAcierto: { textAlign: "center", fontSize: 18, color: "#4CAF50", fontWeight: "bold", marginTop: 16 },
  feedbackFallo: { textAlign: "center", fontSize: 18, color: "#FF9800", fontWeight: "bold", marginTop: 16 },
  burbuja: { alignItems: "center", marginTop: 16 },
  mono: { fontSize: 36 },
  textoBurbuja: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 4,
    fontSize: 13,
  },
});