// src/screens/JuegoCanastas.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image,
  Animated, Dimensions, Vibration, PanResponder, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Confeti from '../components/Confeti';
import {
  reproducirAcierto, reproducirFallo, reproducirVictoria,
  vozAcierto, vozFallo, vozEscapo,
  vozInicioCanastas, vozDerrota, sonidoFondo,
  detenerSonidosActuales,
} from '../utils/sonidos';
import { guardarProgresoNivel, sumarEstrellas, registrarPartidaJugada } from '../utils/almacenamiento';
import { guardarNivelCompletado } from '../utils/premios';

const { width, height } = Dimensions.get('window');
const TOTAL_ALIMENTOS    = 15;
const PUNTOS_POR_ACIERTO = 10;
const NUM_COLUMNAS       = 2;
const ITEM_W             = 124;
const MARGEN_LATERAL     = 20;

const COLUMNAS_X = [
  MARGEN_LATERAL,
  width - ITEM_W - MARGEN_LATERAL,
];

const POOL_COMPLETO = [
  { nombre: 'Manzana',      tipo: 'saludable', imagen: require('../assets/imagenes/normalized/Manzna_std.png') },
  { nombre: 'Plátano',      tipo: 'saludable', imagen: require('../assets/imagenes/normalized/banana_std.png') },
  { nombre: 'Brócoli',      tipo: 'saludable', imagen: require('../assets/imagenes/normalized/brocoli_std.png') },
  { nombre: 'Aguacate',     tipo: 'saludable', imagen: require('../assets/imagenes/normalized/aguacate_std.png') },
  { nombre: 'Fresa',        tipo: 'saludable', imagen: require('../assets/imagenes/normalized/Fresa_std.png') },
  { nombre: 'Limón',        tipo: 'saludable', imagen: require('../assets/imagenes/normalized/limon_std.png') },
  { nombre: 'Agua',         tipo: 'saludable', imagen: require('../assets/imagenes/normalized/agua_std.png') },
  { nombre: 'Leche',        tipo: 'saludable', imagen: require('../assets/imagenes/normalized/leche_std.png') },
  { nombre: 'Hamburguesa',  tipo: 'chatarra',  imagen: require('../assets/imagenes/normalized/Hamburguesa_std.png') },
  { nombre: 'Pizza',        tipo: 'chatarra',  imagen: require('../assets/imagenes/normalized/Pizza_std.png') },
  { nombre: 'Papas Fritas', tipo: 'chatarra',  imagen: require('../assets/imagenes/normalized/papas fritas_std.png') },
  { nombre: 'Helado',       tipo: 'chatarra',  imagen: require('../assets/imagenes/normalized/helado_std.png') },
  { nombre: 'Chocolate',    tipo: 'chatarra',  imagen: require('../assets/imagenes/normalized/chocolate_std.png') },
  { nombre: 'Dona',         tipo: 'chatarra',  imagen: require('../assets/imagenes/normalized/Dona_std.png') },
  { nombre: 'Galleta',      tipo: 'chatarra',  imagen: require('../assets/imagenes/normalized/galleta_std.png') },
];

function mezclar(arr) {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

// ─── Alimento arrastrable ───
function AlimentoItem({ alimento, onSoltar, juegoTerminado, onDragChange }) {
  const pan    = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const escala = useRef(new Animated.Value(1)).current;

  const alimentosGrandes = ['Plátano', 'Fresa', 'Aguacate', 'Dona', 'Hamburguesa', 'Pizza', 'Brócoli'];
  const itemSize = alimentosGrandes.includes(alimento.nombre) ? 118 : 108;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder:        () => !juegoTerminado,
      onStartShouldSetPanResponderCapture: () => !juegoTerminado,
      onMoveShouldSetPanResponder:         () => !juegoTerminado,
      onMoveShouldSetPanResponderCapture:  () => !juegoTerminado,

      onPanResponderGrant: () => {
        onDragChange(alimento.id, true);
        pan.setOffset({ x: pan.x._value, y: pan.y._value });
        pan.setValue({ x: 0, y: 0 });
        Animated.spring(escala, {
          toValue: 1.35,
          friction: 4,
          useNativeDriver: false,
        }).start();
      },

      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false },
      ),

      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();
        onDragChange(alimento.id, false);
        Animated.spring(escala, {
          toValue: 1,
          friction: 4,
          useNativeDriver: false,
        }).start();

        const dropAbsY = gestureState.moveY;
        const dropAbsX = gestureState.moveX;
        const ZONA_CANASTA = height - 175;

        if (dropAbsY >= ZONA_CANASTA) {
          const tipo = dropAbsX < width / 2 ? 'saludable' : 'chatarra';
          onSoltar(alimento.id, tipo);
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: false,
          }).start();
        }
      },

      onPanResponderTerminate: () => {
        pan.flattenOffset();
        onDragChange(alimento.id, false);
        Animated.spring(escala, { toValue: 1, friction: 4, useNativeDriver: false }).start();
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, friction: 5, useNativeDriver: false }).start();
      },
    }),
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        s.item,
        {
          left: alimento.posX,
          top: 0,
          transform: [
            { translateY: Animated.add(alimento.posYAnim, pan.y) },
            { translateX: pan.x },
            { scale: escala },
          ],
        },
      ]}
    >
      <View style={s.itemWrapper}>
        <Image
          source={alimento.imagen}
          style={[s.imgItem, { width: itemSize, height: itemSize }]}
          resizeMode="contain"
        />
        <Text style={s.nombreItem}>{alimento.nombre}</Text>
      </View>
    </Animated.View>
  );
}

// ─── Pantalla principal ───
export default function JuegoCanastas({ route, navigation }) {
  const nivelId = route?.params?.nivelId ?? 1;

  const [puntuacion,     setPuntuacion]     = useState(0);
  const [vidas,          setVidas]          = useState(3);
  const [alimentos,      setAlimentos]      = useState([]);
  const [juegoActivo,    setJuegoActivo]    = useState(false);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [totalGenerados, setTotalGenerados] = useState(0);
  const [aciertos,       setAciertos]       = useState(0);
  const [fallos,         setFallos]         = useState(0);
  const [confeti,        setConfeti]        = useState(false);

  const columnaRef   = useRef(0);
  const colaRef      = useRef(mezclar(POOL_COMPLETO));
  const indiceRef    = useRef(0);
  const aciertosRef  = useRef(0);
  const fallosRef    = useRef(0);
  const terminadoRef = useRef(false);
  const vidasRef     = useRef(3);
  const yaNavego     = useRef(false);
  const manoAnim     = useRef(new Animated.Value(0)).current;
  const timerRef     = useRef(null);
  const timeoutRef   = useRef(null);
  const intervaloRef = useRef(null);

  // ── Animación mano instructiva ──
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(manoAnim, { toValue: -6, duration: 500, useNativeDriver: true }),
        Animated.timing(manoAnim, { toValue: 0,  duration: 500, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  // ── Voz de inicio y activación del juego ──
  useEffect(() => {
    timerRef.current = setTimeout(async () => {
      try {
        if (sonidoFondo) {
          await sonidoFondo.setVolumeAsync(0.08);
        }
        await vozInicioCanastas();
        timeoutRef.current = setTimeout(() => {
          if (sonidoFondo) {
            sonidoFondo.setVolumeAsync(0.5);
          }
        }, 4000);
        setJuegoActivo(true);
      } catch (error) {
        console.log('Error en voz de inicio:', error);
        setJuegoActivo(true);
      }
    }, 500);

    return () => {
      detenerSonidosActuales();
      if (timerRef.current) clearTimeout(timerRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervaloRef.current) clearInterval(intervaloRef.current);
      if (sonidoFondo) {
        sonidoFondo.setVolumeAsync(0.5);
      }
    };
  }, []);

  // ── Limpiar al salir de la pantalla ──
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      detenerSonidosActuales();
      if (intervaloRef.current) clearInterval(intervaloRef.current);
      if (sonidoFondo) {
        sonidoFondo.setVolumeAsync(0.5);
      }
    });
    return unsubscribe;
  }, [navigation]);

  const siguienteAlimento = () => {
    if (indiceRef.current >= TOTAL_ALIMENTOS) return null;
    const base = colaRef.current[indiceRef.current];
    indiceRef.current += 1;
    const col = columnaRef.current % NUM_COLUMNAS;
    columnaRef.current += 1;
    return {
      ...base,
      id:         `${indiceRef.current}-${Date.now()}`,
      posX:       COLUMNAS_X[col],
      posYAnim:   new Animated.Value(0),
      velocidad:  0.12 + Math.random() * 0.06,
      isDragging: false,
    };
  };

  // ── Agregar hasta 2 alimentos ──
  useEffect(() => {
    if (!juegoActivo || juegoTerminado) return;
    if (alimentos.length < NUM_COLUMNAS && totalGenerados < TOTAL_ALIMENTOS) {
      const nuevo = siguienteAlimento();
      if (nuevo) {
        setAlimentos(prev => [...prev, nuevo]);
        setTotalGenerados(prev => prev + 1);
      }
    }
  }, [alimentos.length, juegoActivo, juegoTerminado, totalGenerados]);

  // ── Verificar fin ──
  useEffect(() => {
    if (totalGenerados >= TOTAL_ALIMENTOS && alimentos.length === 0 && juegoActivo) {
      terminarJuego();
    }
  }, [totalGenerados, alimentos.length, juegoActivo]);

  // ── Loop de caída ──
  useEffect(() => {
    if (intervaloRef.current) clearInterval(intervaloRef.current);
    
    intervaloRef.current = setInterval(() => {
      if (!juegoActivo || juegoTerminado) return;
      setAlimentos(prev => {
        const siguientes = prev.map(a => {
          if (a.isDragging) return a;
          const newY = a.posYAnim._value + a.velocidad;
          if (newY > height - 185) {
            try { vozEscapo(); } catch (e) {}
            fallosRef.current += 1;
            setFallos(fallosRef.current);
            vidasRef.current -= 1;
            setVidas(vidasRef.current);
            if (vidasRef.current <= 0 && !terminadoRef.current) terminarJuego();
            return null;
          }
          a.posYAnim.setValue(newY);
          return a;
        });
        return siguientes.filter(Boolean);
      });
    }, 50);
    
    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
    };
  }, [juegoActivo, juegoTerminado]);

  // ── Terminar juego ──
  async function terminarJuego() {
    if (terminadoRef.current) return;
    terminadoRef.current = true;
    setJuegoActivo(false);
    setJuegoTerminado(true);

    const ganoPartida   = aciertosRef.current >= Math.ceil(TOTAL_ALIMENTOS / 2);
    const perdioPartida = vidasRef.current <= 0;

    if (ganoPartida) {
      setConfeti(true);
      try { reproducirVictoria(); } catch (e) {}
      Vibration.vibrate([400, 100, 400]);
    } else {
      try { reproducirFallo(); } catch (e) {}
      try { vozDerrota(); } catch (e) {}
    }

    await sumarEstrellas(aciertosRef.current);
    await guardarProgresoNivel(nivelId, aciertosRef.current, TOTAL_ALIMENTOS);
    await registrarPartidaJugada();
    await guardarNivelCompletado(nivelId);

    setTimeout(() => {
      if (!yaNavego.current) {
        yaNavego.current = true;
        detenerSonidosActuales();
        navigation.replace('PantallaResultados', {
          nivelId,
          aciertos: aciertosRef.current,
          total:    TOTAL_ALIMENTOS,
          fallidos: fallosRef.current,
          perdido:  perdioPartida,
        });
      }
    }, 1500);
  }

  // ── Drag ──
  const onDragChange = (id, dragging) => {
    setAlimentos(prev =>
      prev.map(a => a.id === id ? { ...a, isDragging: dragging } : a)
    );
  };

  // ── Drop ──
  const manejarDrop = (id, tipoCanasta) => {
    setAlimentos(prev => {
      const alimento = prev.find(a => a.id === id);
      if (!alimento) return prev;

      if (alimento.tipo === tipoCanasta) {
        aciertosRef.current += 1;
        setAciertos(aciertosRef.current);
        setPuntuacion(p => p + PUNTOS_POR_ACIERTO);
        try { reproducirAcierto(); } catch (e) {}
        try { vozAcierto(); } catch (e) {}
        Vibration.vibrate(50);
      } else {
        fallosRef.current += 1;
        setFallos(fallosRef.current);
        vidasRef.current -= 1;
        setVidas(vidasRef.current);
        try { reproducirFallo(); } catch (e) {}
        try { vozFallo(); } catch (e) {}
        Vibration.vibrate(200);
        if (vidasRef.current <= 0 && !terminadoRef.current) terminarJuego();
      }

      return prev.filter(a => a.id !== id);
    });
  };

  const handleVolver = () => {
    detenerSonidosActuales();
    if (intervaloRef.current) clearInterval(intervaloRef.current);
    if (sonidoFondo) {
      sonidoFondo.setVolumeAsync(0.5);
    }
    navigation.navigate("Secciones");
  };

  const vidasArr = [0, 1, 2].map(i => i < vidas);

  return (
    <LinearGradient
      colors={['#14c8bf', '#107b7d', '#0d142b']}
      style={s.contenedor}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {confeti && <Confeti cantidad={50} duracion={3500} />}

      {/* HEADER */}
      <View style={s.header}>
        <TouchableOpacity onPress={handleVolver} style={s.botonVolverHeader}>
          <Text style={s.flechaVolver}>←</Text>
        </TouchableOpacity>
        <View style={s.chip}>
          <Text style={s.chipTxt}>⭐ {puntuacion}/{TOTAL_ALIMENTOS * PUNTOS_POR_ACIERTO}</Text>
        </View>
        <View style={s.chip}>
          <Text style={s.chipTxt}>📦 {totalGenerados}/{TOTAL_ALIMENTOS}</Text>
        </View>
        <View style={s.filaVidas}>
          {vidasArr.map((v, i) => (
            <Text key={i} style={{ fontSize: 20, opacity: v ? 1 : 0.2 }}>❤️</Text>
          ))}
        </View>
      </View>

      {/* BARRA PROGRESO */}
      <View style={s.barraFondo}>
        <LinearGradient
          colors={['#66BB6A', '#43A047']}
          style={[s.barraFill, { width: `${Math.min((totalGenerados / TOTAL_ALIMENTOS) * 100, 100)}%` }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </View>

      {/* INSTRUCCIÓN */}
      <View style={s.instruccion}>
        <Animated.View style={[s.instruccionIconBox, { transform: [{ translateY: manoAnim }] }]}>
          <Text style={s.instruccionIcon}>👇</Text>
        </Animated.View>
        <View style={s.instruccionTxtBlock}>
          <Text style={s.instruccionTxtBold}>ARRASTRA</Text>
          <Text style={s.instruccionTxtSmall}>Toca la fruta y llévala a la canasta</Text>
        </View>
      </View>

      {/* ÁREA DE CAÍDA */}
      <View style={s.area}>
        {alimentos.map(a => (
          <AlimentoItem
            key={a.id}
            alimento={a}
            onSoltar={manejarDrop}
            juegoTerminado={juegoTerminado}
            onDragChange={onDragChange}
          />
        ))}
      </View>

      {/* CANASTAS */}
      <View style={s.canastas}>
        <View style={s.canasta}>
          <LinearGradient
            colors={['#46b24b', '#25922b', '#076f0e']}
            style={s.gradCanasta}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={s.canastaIconContainer}>
              <Text style={s.canastaEmoji}>🥗</Text>
              <Text style={s.canastaEmojiSub}>🍎🥑🥦</Text>
            </View>
            <Text style={s.txtCanasta}>SALUDABLE</Text>
            <Text style={s.subCanasta}>😊 Frutas y verduras</Text>
          </LinearGradient>
        </View>

        <View style={s.canasta}>
          <LinearGradient
            colors={['#ef5757', '#dd5454', 'rgb(188,11,11)']}
            style={s.gradCanasta}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={s.canastaIconContainer}>
              <Text style={s.canastaEmoji}>🗑️</Text>
              <Text style={s.canastaEmojiSub}>🍔🍕🍟</Text>
            </View>
            <Text style={s.txtCanasta}>CHATARRA</Text>
            <Text style={s.subCanasta}>😞 Comida dañina</Text>
          </LinearGradient>
        </View>
      </View>

    </LinearGradient>
  );
}

const s = StyleSheet.create({
  contenedor: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 45,
    paddingBottom: 10,
    backgroundColor: '#fcfcfceb',
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  botonVolverHeader: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
    padding: 6,
    paddingHorizontal: 10,
    marginRight: 4,
  },
  flechaVolver: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1B5E20',
  },
  chip: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#107b7d',
  },
  chipTxt: { fontSize: 13, fontWeight: '700', color: '#1B5E20' },
  filaVidas: { flexDirection: 'row', gap: 2 },

  barraFondo: {
    height: 8,
    backgroundColor: '#E8F5E9',
    marginHorizontal: 14,
    marginTop: 8,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#4caf5026',
  },
  barraFill: { height: 8, borderRadius: 6 },

  instruccion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,247,205,0.95)',
    marginHorizontal: 14,
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,193,7,0.4)',
  },
  instruccionIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  instruccionIcon:     { fontSize: 28 },
  instruccionTxtBlock: { flex: 1 },
  instruccionTxtBold:  { fontSize: 16, fontWeight: '900', color: '#4E342E' },
  instruccionTxtSmall: { fontSize: 13, color: '#4E342E', marginTop: 2 },

  area: {
    flex: 1,
    position: 'relative',
  },

  item: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: ITEM_W,
    top: 0,
    zIndex: 99,
    elevation: 20,
  },
  itemWrapper: {
    backgroundColor: 'rgba(222,240,243,0.97)',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    width: ITEM_W,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 1.5,
    borderColor: '#31c4d1b6',
  },
  imgItem: {
    width: 108,
    height: 108,
    borderRadius: 20,
  },
  nombreItem: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginTop: 4,
  },

  canastas: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  canasta: {
    flex: 0.48,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  gradCanasta: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 12,
    gap: 4,
    minHeight: 130,
  },
  canastaIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  canastaEmoji:    { fontSize: 32 },
  canastaEmojiSub: { fontSize: 18 },
  txtCanasta: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subCanasta: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
  },
});