// src/screens/JuegoPlatoSaludable.js
import React, { useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NIVELES, mezclar } from "../data/niveles";
import { sumarEstrellas, guardarProgresoNivel, registrarPartidaJugada } from "../utils/almacenamiento";
import { reproducirAcierto, reproducirFallo, reproducirVictoria } from "../utils/sonidos";
import ImagenAlimento from "../components/ImagenAlimento";
import Confeti from "../components/Confeti";

const { height, width } = Dimensions.get("window");
const ALTURA_ZONA_PLATO = height * 0.38;

export default function JuegoPlatoSaludable({ route, navigation }) {
  const { nivelId } = route.params;
  const nivel = NIVELES.find((n) => n.id === nivelId);
  const items = useMemo(() => mezclar(nivel.alimentos).slice(0, 6), [nivelId]);

  const posiciones = useRef(items.map(() => new Animated.ValueXY())).current;
  const [colocados, setColocados] = useState(() => items.map(() => false));
  const [revisado, setRevisado] = useState(false);
  const [estrellas, setEstrellas] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [platoEmoji, setPlatoEmoji] = useState("🍽️");
  const [gano, setGano] = useState(false);
  const [confeti, setConfeti] = useState(false);
  const [puntajeFinal, setPuntajeFinal] = useState(0);
  const [totalSaludablesFinal, setTotalSaludablesFinal] = useState(0);
  const [juegoTerminado, setJuegoTerminado] = useState(false);

  const platoPulse = useRef(new Animated.Value(1)).current;
  const shakePlato = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const yaNavego = useRef(false);

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(platoPulse, { toValue: 1.06, duration: 900, useNativeDriver: true }),
        Animated.timing(platoPulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -6, duration: 1200, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // ✅ Animación de rechazo
  const animarRechazo = () => {
    setPlatoEmoji("😢");
    reproducirFallo();

    Animated.sequence([
      Animated.timing(shakePlato, { toValue: 15, duration: 60, useNativeDriver: true }),
      Animated.timing(shakePlato, { toValue: -15, duration: 60, useNativeDriver: true }),
      Animated.timing(shakePlato, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakePlato, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakePlato, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      setPlatoEmoji("🍽️");
    }, 1500);
  };

  // ✅ Animación de aceptación
  const animarAceptacion = () => {
    setPlatoEmoji("😊");
    reproducirAcierto();
    setTimeout(() => {
      setPlatoEmoji("🍽️");
    }, 1000);
  };

  function crearPanResponder(indice) {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => !colocados[indice] && !revisado && !juegoTerminado,
      onPanResponderMove: Animated.event(
        [null, { dx: posiciones[indice].x, dy: posiciones[indice].y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (evento, gesto) => {
        const seSolto = gesto.moveY < ALTURA_ZONA_PLATO;
        if (seSolto) {
          const item = items[indice];

          if (!item.saludable) {
            animarRechazo();
            setMensaje("😅 ¡Ups! Esa no es saludable");
            Animated.spring(posiciones[indice], {
              toValue: { x: 0, y: 0 },
              useNativeDriver: false,
            }).start();
            return;
          }

          setColocados((prev) => prev.map((v, i) => (i === indice ? true : v)));
          animarAceptacion();
          setMensaje("✅ ¡Bien hecho! Es saludable");

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
    if (revisado || juegoTerminado) return;

    const totalColocados = colocados.filter(Boolean).length;

    if (totalColocados === 0) {
      setMensaje("🍽️ ¡Arrastra al menos un alimento saludable!");
      return;
    }

    setRevisado(true);
    const totalSaludables = items.filter((i) => i.saludable).length;
    const colocadosSaludables = items.filter((item, i) => colocados[i] && item.saludable).length;
    const puntaje = colocadosSaludables;

    setPuntajeFinal(puntaje);
    setTotalSaludablesFinal(totalSaludables);

    if (puntaje > 0) {
      reproducirAcierto();
      setMensaje("🎉 ¡Excelente plato saludable!");
      setGano(true);
      setConfeti(true);
    } else {
      reproducirFallo();
      setMensaje("💪 ¡Casi! Pon solo los saludables");
      setGano(false);
    }

    await sumarEstrellas(puntaje);
    setEstrellas(puntaje);
    await guardarProgresoNivel(nivelId, puntaje, totalSaludables);
    await registrarPartidaJugada();

    // Navegar a PantallaResultados después de 1.8 segundos
    setTimeout(() => {
      if (!yaNavego.current) {
        yaNavego.current = true;
        setJuegoTerminado(true);
        navigation.replace('PantallaResultados', {
          nivelId,
          aciertos: puntaje,
          total: totalSaludables,
        });
      }
    }, 1800);
  }

  const totalColocados = colocados.filter(Boolean).length;

  return (
    <LinearGradient
      colors={["#14c8bf", "#107b7d", "#0d142b"]}
      style={styles.contenedor}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {confeti && <Confeti cantidad={50} duracion={3500} />}

      <View style={styles.fondoDecoracion}>
        <View style={styles.circulo1} />
        <View style={styles.circulo2} />
        <View style={styles.circulo3} />
        <View style={styles.circulo4} />
      </View>

      {/* HEADER */}
      <View style={styles.barraSuperior}>
        <TouchableOpacity onPress={() => navigation.navigate("Secciones")} style={styles.botonVolver}>
          <Text style={styles.textoVolver}>←</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>{nivel.titulo}</Text>
        <View style={styles.estrellasBadge}>
          <Text style={styles.estrellas}>⭐ {estrellas}</Text>
        </View>
      </View>

      {/* INSTRUCCIÓN */}
      <View style={styles.cajaInstruccion}>
        <LinearGradient colors={["rgba(255,255,255,0.3)", "rgba(255,255,255,0.1)"]} style={styles.instruccionGrad}>
          <Text style={styles.instruccionEmoji}>🥗</Text>
          <Text style={styles.instruccion}>¡Arrastra SOLO lo saludable!</Text>
        </LinearGradient>
      </View>

      {/* CONTADOR */}
      <View style={styles.contadorContainer}>
        <LinearGradient colors={["rgba(255,255,255,0.25)", "rgba(255,255,255,0.1)"]} style={styles.contadorGrad}>
          <Text style={styles.contadorTexto}>🍽️ {totalColocados} en el plato</Text>
        </LinearGradient>
      </View>

      {/* PLATO */}
      <View style={styles.zonaPlato}>
        <Animated.View style={[
          styles.platoWrapper,
          {
            transform: [
              { scale: platoPulse },
              { translateX: shakePlato }
            ]
          }
        ]}>
          <LinearGradient
            colors={["rgba(255,255,255,0.95)", "rgba(138, 255, 159, 0.98)"]}
            style={styles.plato}
          >
            <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
              <Text style={styles.emojiPlato}>{platoEmoji}</Text>
            </Animated.View>
            {totalColocados > 0 && (
              <Text style={styles.textoPlato}>{totalColocados} en el plato</Text>
            )}
          </LinearGradient>
        </Animated.View>
      </View>

      {/* MENSAJE */}
      {mensaje ? (
        <View style={[styles.mensajeBox, mensaje.includes("Excelente") || mensaje.includes("Bien") ? styles.mensajeOk : styles.mensajeFallo]}>
          <Text style={styles.mensajeTexto}>{mensaje}</Text>
        </View>
      ) : null}

      {/* BANDEJA DE ALIMENTOS */}
      <View style={styles.bandejaContainer}>
        <Text style={styles.bandejaLabel}>👇 Toca y arrastra al plato</Text>
        <View style={styles.bandejaAlimentos}>
          {items.map((item, i) => (
            <Animated.View
              key={item.nombre}
              {...panResponders[i].panHandlers}
              style={[
                styles.itemArrastrable,
                colocados[i] && styles.itemColocado,
                colocados[i] && revisado
                  ? item.saludable ? styles.itemCorrecto : styles.itemIncorrecto
                  : null,
                { transform: posiciones[i].getTranslateTransform() },
              ]}
            >
              <ImagenAlimento fuente={item.imagen} tamanio={60} animar={true} />
              <Text style={styles.nombreItem}>{item.nombre}</Text>
              {colocados[i] && !revisado && (
                <View style={styles.colocadoBadge}><Text style={styles.colocadoTexto}>✓</Text></View>
              )}
            </Animated.View>
          ))}
        </View>
      </View>

      {/* BOTÓN CONFIRMAR */}
      {!revisado && !juegoTerminado && (
        <TouchableOpacity
          style={[styles.botonWrapper, { opacity: totalColocados === 0 ? 0.5 : 1 }]}
          onPress={confirmarPlato}
          activeOpacity={0.85}
          disabled={totalColocados === 0}
        >
          <LinearGradient
            colors={["#5ae128dd", "#7ce56ce4"]}
            style={styles.boton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.textoBoton}>✅ ¡LISTO! Revisar plato</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, paddingTop: 44, paddingHorizontal: 16 },

  fondoDecoracion: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden" },
  circulo1: { position: "absolute", top: -80, right: -80, width: 280, height: 280, borderRadius: 140, backgroundColor: "rgba(255,255,255,0.08)" },
  circulo2: { position: "absolute", bottom: -60, left: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(255,255,255,0.06)" },
  circulo3: { position: "absolute", top: "30%", right: -40, width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(255,255,255,0.05)" },
  circulo4: { position: "absolute", bottom: "20%", left: -30, width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(255,215,0,0.08)" },

  barraSuperior: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  botonVolver: { backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 20, padding: 10, paddingHorizontal: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  textoVolver: { fontSize: 24, color: "#fff", fontWeight: "900" },
  titulo: { fontSize: 17, fontWeight: "900", color: "#fff", flex: 1, textAlign: "center", textShadowColor: "rgba(0,0,0,0.2)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  estrellasBadge: { backgroundColor: "rgba(224, 224, 223, 0.59)", borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14, borderWidth: 1, borderColor: "rgba(255,215,0,0.15)" },
  estrellas: { fontSize: 16, fontWeight: "900", color: "#FFD700" },

  cajaInstruccion: { borderRadius: 24, marginBottom: 6, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  instruccionGrad: { paddingVertical: 12, paddingHorizontal: 20, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 10 },
  instruccionEmoji: { fontSize: 26 },
  instruccion: { fontSize: 17, fontWeight: "800", color: "#fff", textAlign: "center" },

  contadorContainer: { alignItems: "center", marginVertical: 3 },
  contadorGrad: { paddingHorizontal: 20, paddingVertical: 5, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  contadorTexto: { fontSize: 15, fontWeight: "700", color: "#fff" },

  zonaPlato: { height: height * 0.24, alignItems: "center", justifyContent: "center" },
  platoWrapper: { elevation: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 12 },
  plato: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 6,
    borderColor: "#0a4f4d",
    alignItems: "center",
    justifyContent: "center"
  },
  emojiPlato: { fontSize: 55 },
  textoPlato: { fontSize: 15, fontWeight: "900", color: "#2E7D32", marginTop: 3 },

  mensajeBox: { borderRadius: 24, paddingVertical: 8, paddingHorizontal: 16, alignItems: "center", marginBottom: 4, elevation: 6, borderWidth: 3, borderColor: "#fff" },
  mensajeOk: { backgroundColor: "#4CAF50" },
  mensajeFallo: { backgroundColor: "#FF8A65" },
  mensajeTexto: { fontSize: 15, fontWeight: "900", color: "#fff" },

  bandejaContainer: { flex: 1 },
  bandejaLabel: { textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: "700", marginBottom: 3 },
  bandejaAlimentos: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },

  itemArrastrable: {
    width: 75,
    height: 95,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    margin: 6,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    position: "relative",
    paddingVertical: 6,
  },
  itemColocado: { borderColor: "#FFD93D", backgroundColor: "rgba(255,255,255,0.9)" },
  itemCorrecto: { backgroundColor: "#C8E6C9", borderColor: "#4CAF50", borderWidth: 4 },
  itemIncorrecto: { backgroundColor: "#FFCCBC", borderColor: "#FF8A65", borderWidth: 4 },

  nombreItem: {
    fontSize: 10,
    fontWeight: "700",
    color: "#2E7D32",
    textAlign: "center",
    marginTop: 3,
    backgroundColor: "rgba(255,255,255,0.6)",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },

  colocadoBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  colocadoTexto: { color: "#fff", fontWeight: "900", fontSize: 11 },

  botonWrapper: {
    borderRadius: 36,
    overflow: "hidden",
    marginBottom: 8,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    marginTop: 2,
  },
  boton: { paddingVertical: 14, alignItems: "center", borderWidth: 3, borderColor: "rgba(255,255,255,0.4)", borderRadius: 36 },
  textoBoton: { color: "#fff", fontWeight: "900", fontSize: 16 },
});