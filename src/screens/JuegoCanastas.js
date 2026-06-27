// src/screens/JuegoCanastas.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image,
  Animated, Dimensions, Vibration, PanResponder,
  Modal, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Confeti from '../components/Confeti';
import {
  reproducirAcierto, reproducirFallo, reproducirVictoria,
} from '../utils/sonidos';
import { guardarProgresoNivel, sumarEstrellas, registrarPartidaJugada } from '../utils/almacenamiento';
import { guardarNivelCompletado } from '../utils/premios';

const { width, height } = Dimensions.get('window');
const TOTAL_ALIMENTOS    = 15;
const PUNTOS_POR_ACIERTO = 10;
const NUM_COLUMNAS       = 3;
const ITEM_W             = 88;

const COLUMNAS_X = Array.from({ length: NUM_COLUMNAS }, (_, i) => {
  const espacio = width / NUM_COLUMNAS;
  return espacio * i + (espacio - ITEM_W) / 2;
});

const POOL_COMPLETO = [
  { nombre: 'Manzana',      tipo: 'saludable', imagen: require('../assets/imagenes/Manzna.png') },
  { nombre: 'Plátano',      tipo: 'saludable', imagen: require('../assets/imagenes/banana.png') },
  { nombre: 'Brócoli',      tipo: 'saludable', imagen: require('../assets/imagenes/brocoli.png') },
  { nombre: 'Aguacate',     tipo: 'saludable', imagen: require('../assets/imagenes/aguacate.png') },
  { nombre: 'Fresa',        tipo: 'saludable', imagen: require('../assets/imagenes/Fresa.png') },
  { nombre: 'Limón',        tipo: 'saludable', imagen: require('../assets/imagenes/limon.png') },
  { nombre: 'Agua',         tipo: 'saludable', imagen: require('../assets/imagenes/agua.jpg') },
  { nombre: 'Leche',        tipo: 'saludable', imagen: require('../assets/imagenes/leche.jpg') },
  { nombre: 'Hamburguesa',  tipo: 'chatarra',  imagen: require('../assets/imagenes/Hamburguesa.png') },
  { nombre: 'Pizza',        tipo: 'chatarra',  imagen: require('../assets/imagenes/Pizza.png') },
  { nombre: 'Papas Fritas', tipo: 'chatarra',  imagen: require('../assets/imagenes/papas fritas.jpg') },
  { nombre: 'Helado',       tipo: 'chatarra',  imagen: require('../assets/imagenes/helado.jpg') },
  { nombre: 'Chocolate',    tipo: 'chatarra',  imagen: require('../assets/imagenes/chocolate.png') },
  { nombre: 'Dona',         tipo: 'chatarra',  imagen: require('../assets/imagenes/Dona.png') },
  { nombre: 'Galleta',      tipo: 'chatarra',  imagen: require('../assets/imagenes/galleta.jpg') },
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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder:             () => !juegoTerminado,
      onStartShouldSetPanResponderCapture:      () => !juegoTerminado,
      onMoveShouldSetPanResponder:              () => !juegoTerminado,
      onMoveShouldSetPanResponderCapture:       () => !juegoTerminado,

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

      onPanResponderTerminate: (_, gestureState) => {
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
        <Image source={alimento.imagen} style={s.imgItem} resizeMode="contain" />
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
  const [juegoActivo,    setJuegoActivo]    = useState(true);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [totalGenerados, setTotalGenerados] = useState(0);
  const [aciertos,       setAciertos]       = useState(0);
  const [fallos,         setFallos]         = useState(0);
  const [confeti,        setConfeti]        = useState(false);
  
  // ========== NUEVO: Estado para mostrar resumen interno ==========
  const [mostrarResumen, setMostrarResumen] = useState(false);
  const [resumenData, setResumenData] = useState({
    aciertos: 0,
    fallos: 0,
    total: TOTAL_ALIMENTOS,
    gano: false,
    perdido: false,
  });

  const columnaRef   = useRef(0);
  const colaRef      = useRef(mezclar(POOL_COMPLETO));
  const indiceRef    = useRef(0);
  const aciertosRef  = useRef(0);
  const fallosRef    = useRef(0);
  const terminadoRef = useRef(false);
  const vidasRef     = useRef(3);

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
      posYAnim:   new Animated.Value(-100),
      velocidad:  0.5 + Math.random() * 0.2,
      isDragging: false,
    };
  };

  // ── Agregar hasta 3 alimentos ──
  useEffect(() => {
    if (!juegoActivo || juegoTerminado) return;
    if (alimentos.length < 3 && totalGenerados < TOTAL_ALIMENTOS) {
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
    const intervalo = setInterval(() => {
      if (!juegoActivo || juegoTerminado) return;
      setAlimentos(prev => {
        const siguientes = prev.map(a => {
          if (a.isDragging) return a;
          const newY = a.posYAnim._value + a.velocidad;
          if (newY > height - 185) {
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
    }, 35);
    return () => clearInterval(intervalo);
  }, [juegoActivo, juegoTerminado]);

  // ── Terminar juego ──
  async function terminarJuego() {
    if (terminadoRef.current) return;
    terminadoRef.current = true;
    setJuegoActivo(false);
    setJuegoTerminado(true);

    const ganoPartida = aciertosRef.current >= Math.ceil(TOTAL_ALIMENTOS / 2);
    const perdioPartida = vidasRef.current <= 0;
    
    if (ganoPartida) {
      setConfeti(true);
      reproducirVictoria();
      Vibration.vibrate([400, 100, 400]);
    } else {
      reproducirFallo();
    }

    await sumarEstrellas(aciertosRef.current);
    await guardarProgresoNivel(nivelId, aciertosRef.current, TOTAL_ALIMENTOS);
    await registrarPartidaJugada();
    await guardarNivelCompletado(nivelId);

    // ========== GUARDAR DATOS PARA EL RESUMEN ==========
    setResumenData({
      aciertos: aciertosRef.current,
      fallos: fallosRef.current,
      total: TOTAL_ALIMENTOS,
      gano: ganoPartida,
      perdido: perdioPartida,
    });

    // ========== MOSTRAR RESUMEN INTERNO ==========
    setTimeout(() => {
      setMostrarResumen(true);
    }, 1500);
  }

  const onDragChange = (id, dragging) => {
    setAlimentos(prev =>
      prev.map(a => a.id === id ? { ...a, isDragging: dragging } : a)
    );
  };

  const manejarDrop = (id, tipoCanasta) => {
    setAlimentos(prev => {
      const alimento = prev.find(a => a.id === id);
      if (!alimento) return prev;
      if (alimento.tipo === tipoCanasta) {
        aciertosRef.current += 1;
        setAciertos(aciertosRef.current);
        setPuntuacion(p => p + PUNTOS_POR_ACIERTO);
        reproducirAcierto();
        Vibration.vibrate(50);
      } else {
        fallosRef.current += 1;
        setFallos(fallosRef.current);
        vidasRef.current -= 1;
        setVidas(vidasRef.current);
        reproducirFallo();
        Vibration.vibrate(200);
        if (vidasRef.current <= 0 && !terminadoRef.current) terminarJuego();
      }
      return prev.filter(a => a.id !== id);
    });
  };

  // ========== FUNCIONES PARA EL RESUMEN ==========
  const irSiguienteNivel = () => {
    const sig = nivelId + 1;
    const niveles = {
      1: 'JuegoCanastas',
      2: 'JuegoPlatoSaludable',
      3: 'JuegoSeleccionar',
      4: 'JuegoSnacks',
    };
    navigation.replace(niveles[sig] || 'Secciones', { nivelId: sig });
  };

  const volverInicio = () => {
    navigation.navigate('Secciones');
  };

  const reintentar = () => {
    setMostrarResumen(false);
    setConfeti(false);
    setJuegoTerminado(false);
    setJuegoActivo(true);
    setAlimentos([]);
    setTotalGenerados(0);
    setAciertos(0);
    setFallos(0);
    setPuntuacion(0);
    setVidas(3);
    aciertosRef.current = 0;
    fallosRef.current = 0;
    vidasRef.current = 3;
    terminadoRef.current = false;
    indiceRef.current = 0;
    columnaRef.current = 0;
    colaRef.current = mezclar(POOL_COMPLETO);
  };

  const vidasArr = [0, 1, 2].map(i => i < vidas);

  // ========== ESTRELLAS DEL RESUMEN ==========
  const estrellasLlenas = Math.round((resumenData.aciertos / resumenData.total) * 5);

  return (
    <LinearGradient
      colors={['#E8F5E9', '#C8E6C9', '#A5D6A7']}
      style={s.contenedor}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {confeti && <Confeti cantidad={50} duracion={3500} />}

      {/* HEADER */}
      <View style={s.header}>
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
        <Text style={s.instruccionTxt}>👆 ¡Arrastra el alimento a la canasta correcta!</Text>
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
            colors={['#43A047', '#2E7D32', '#1B5E20']}
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
            colors={['#E53935', '#ff5100', '#f14d01']}
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

      {/* ========== MODAL DE RESUMEN INTERNO ========== */}
      <Modal
        visible={mostrarResumen}
        transparent={true}
        animationType="fade"
      >
        <View style={s.modalOverlay}>
          <Animated.View style={s.modalTarjeta}>
            <LinearGradient
              colors={
                resumenData.gano
                  ? ['#1B5E20', '#2E7D32', '#43A047']
                  : resumenData.perdido
                  ? ['#B71C1C', '#C62828', '#E53935']
                  : ['#F57C00', '#E65100', '#FF8F00']
              }
              style={s.modalGrad}
            >
              <Text style={s.modalEmoji}>
                {resumenData.gano ? '🏆' : resumenData.perdido ? '😢' : '💪'}
              </Text>

              <Text style={s.modalTitulo}>
                {resumenData.gano 
                  ? '¡FELICIDADES!' 
                  : resumenData.perdido 
                  ? '¡PERDISTE!' 
                  : '¡BUEN INTENTO!'
                }
              </Text>

              <Text style={s.modalSub}>
                Clasificaste {resumenData.aciertos} de {resumenData.total} alimentos correctamente
              </Text>

              {/* ESTRELLAS */}
              <View style={s.modalEstrellas}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Text key={i} style={s.modalEstrella}>
                    {i < estrellasLlenas ? '⭐' : '☆'}
                  </Text>
                ))}
              </View>

              {/* ESTADÍSTICAS */}
              <View style={s.modalStats}>
                <View style={s.modalStat}>
                  <Text style={[s.modalStatNum, { color: '#A5D6A7' }]}>
                    {resumenData.aciertos}
                  </Text>
                  <Text style={s.modalStatLbl}>✅ Aciertos</Text>
                </View>
                <View style={s.modalDivider} />
                <View style={s.modalStat}>
                  <Text style={[s.modalStatNum, { color: '#FFCDD2' }]}>
                    {resumenData.fallos}
                  </Text>
                  <Text style={s.modalStatLbl}>❌ Fallados</Text>
                </View>
              </View>

              {/* MENSAJE EXTRA */}
              <View style={s.modalMensajeBox}>
                <Text style={s.modalMensajeTxt}>
                  {resumenData.gano
                    ? '¡Muy bien! Sabes distinguir los alimentos saludables 🥦🍎'
                    : resumenData.perdido
                    ? 'No te rindas, ¡inténtalo de nuevo! 💪'
                    : '¡Casi lo logras! Practica un poco más 🌟'}
                </Text>
              </View>

              {/* BOTONES */}
              <TouchableOpacity
                style={s.modalBtnPrincipal}
                onPress={resumenData.perdido ? reintentar : resumenData.gano ? irSiguienteNivel : reintentar}
                activeOpacity={0.85}
              >
                <LinearGradient colors={['#FFD93D', '#F57C00']} style={s.modalGradBtn}>
                  <Text style={s.modalTxtBtn}>
                    {resumenData.perdido
                      ? '🔄 Intentar de nuevo'
                      : resumenData.gano
                      ? '🚀 Siguiente Nivel'
                      : '🔄 Intentar de nuevo'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={s.modalBtnSec} onPress={volverInicio} activeOpacity={0.85}>
                <Text style={s.modalTxtBtnSec}>🏠 Volver al Inicio</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
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
    paddingTop: 44,
    paddingBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: '#E0F2E9',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  chip: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.2)',
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
    borderColor: 'rgba(76,175,80,0.15)',
  },
  barraFill: { height: 8, borderRadius: 6 },

  instruccion: {
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: 'rgba(255,247,205,0.85)',
    marginHorizontal: 14,
    marginTop: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,193,7,0.3)',
  },
  instruccionTxt: { fontSize: 14, fontWeight: '600', color: '#4E342E' },

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
  },
  itemWrapper: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 22,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    width: ITEM_W,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  imgItem: {
    width: 70,
    height: 70,
    borderRadius: 14,
  },
  nombreItem: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2E7D32',
    textAlign: 'center',
    marginTop: 4,
  },

  canastas: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 10,
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
    flex: 1,
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

  // ===== MODAL DE RESUMEN =====
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalTarjeta: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  modalGrad: {
    padding: 28,
    alignItems: 'center',
    gap: 12,
  },
  modalEmoji: { fontSize: 68 },
  modalTitulo: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  modalSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  modalEstrellas: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  modalEstrella: { fontSize: 28 },
  modalStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 14,
    width: '100%',
    justifyContent: 'space-around',
  },
  modalStat: {
    alignItems: 'center',
    flex: 1,
  },
  modalStatNum: {
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 40,
  },
  modalStatLbl: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  modalDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  modalMensajeBox: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    width: '100%',
  },
  modalMensajeTxt: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  modalBtnPrincipal: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalGradBtn: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalTxtBtn: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1B5E20',
  },
  modalBtnSec: {
    paddingVertical: 10,
    alignItems: 'center',
    width: '100%',
  },
  modalTxtBtnSec: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
  },
});