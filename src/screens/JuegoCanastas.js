// src/screens/JuegoCanastas.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  Animated, Dimensions, Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Confeti from '../components/Confeti';
import Personaje from '../components/Personaje';
import {
  reproducirAcierto, reproducirFallo, reproducirVictoria,
} from '../utils/sonidos';
import { guardarProgresoNivel, sumarEstrellas, registrarPartidaJugada } from '../utils/almacenamiento';
import { guardarNivelCompletado } from '../utils/premios';

const { width, height } = Dimensions.get('window');
const TOTAL_ALIMENTOS = 15;
const PUNTOS_POR_ACIERTO = 10;

// Pool completo — se mezcla y se toman los primeros 15 para que NO se repitan
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

// Mezcla Fisher-Yates — garantiza que los 15 sean únicos
function mezclar(arr) {
  const c = [...arr];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

export default function JuegoCanastas({ route, navigation }) {
  const nivelId = route?.params?.nivelId ?? 1;

  const [puntuacion, setPuntuacion]         = useState(0);
  const [vidas, setVidas]                   = useState(3);
  const [alimentos, setAlimentos]           = useState([]);
  const [juegoActivo, setJuegoActivo]       = useState(true);
  const [alimentoSel, setAlimentoSel]       = useState(null);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [totalGenerados, setTotalGenerados] = useState(0);
  const [aciertos, setAciertos]             = useState(0);
  const [gano, setGano]                     = useState(false);
  const [confeti, setConfeti]               = useState(false);

  const colaRef   = useRef(mezclar(POOL_COMPLETO));
  const indiceRef = useRef(0);
  const aciertosRef = useRef(0);
  const terminadoRef = useRef(false);
  const yaNavego = useRef(false);

  // ── Generar siguiente alimento de la cola ──
  const siguienteAlimento = () => {
    if (indiceRef.current >= TOTAL_ALIMENTOS) return null;
    const base = colaRef.current[indiceRef.current];
    indiceRef.current += 1;

    const margen = 40;
    const posX = margen + Math.random() * (width - 80 - margen * 2);
    return {
      ...base,
      id: `${indiceRef.current}-${Date.now()}`,
      posX,
      posY: -70,
      velocidad: 0.55 + Math.random() * 0.25,
      escala: new Animated.Value(1),
    };
  };

  // ── Agregar alimentos de 1 en 1 ──
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
        const nuevos = prev.map(a => {
          const newY = a.posY + a.velocidad;
          if (newY > height - 190) {
            setVidas(v => {
              const n = v - 1;
              if (n <= 0 && !terminadoRef.current) terminarJuego();
              return Math.max(0, n);
            });
            return null;
          }
          return { ...a, posY: newY };
        });
        return nuevos.filter(Boolean);
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
    setGano(ganoPartida);

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

    setTimeout(() => {
      if (!yaNavego.current) {
        yaNavego.current = true;
        navigation.replace('PantallaResultados', {
          nivelId,
          aciertos: aciertosRef.current,
          total: TOTAL_ALIMENTOS,
        });
      }
    }, 1500);
  }

  // ── ✅ SELECCIONAR ALIMENTO (TOCAR) ──
  const seleccionar = (a) => {
    if (!juegoActivo || juegoTerminado) return;
    
    // Si ya está seleccionado, lo deseleccionamos
    if (alimentoSel?.id === a.id) {
      setAlimentoSel(null);
      Animated.spring(a.escala, { toValue: 1, friction: 3, useNativeDriver: true }).start();
      return;
    }
    
    // Seleccionar nuevo alimento
    setAlimentoSel(a);
    Animated.spring(a.escala, { toValue: 1.4, friction: 3, useNativeDriver: true }).start();
  };

  // ── ✅ SOLTAR EN CANASTA (TOCAR CANASTA) ──
  const soltarEnCanasta = (tipo) => {
    if (!alimentoSel || !juegoActivo || juegoTerminado) return;
    const a = alimentoSel;
    setAlimentoSel(null);

    if (a.tipo === tipo) {
      aciertosRef.current += 1;
      setAciertos(aciertosRef.current);
      setPuntuacion(p => p + PUNTOS_POR_ACIERTO);
      reproducirAcierto();
      Vibration.vibrate(50);
      Animated.sequence([
        Animated.timing(a.escala, { toValue: 2, duration: 180, useNativeDriver: true }),
        Animated.timing(a.escala, { toValue: 0, duration: 160, useNativeDriver: true }),
      ]).start(() => setAlimentos(prev => prev.filter(x => x.id !== a.id)));
    } else {
      setVidas(v => Math.max(0, v - 1));
      reproducirFallo();
      Vibration.vibrate(200);
      Animated.timing(a.escala, { toValue: 0, duration: 250, useNativeDriver: true })
        .start(() => setAlimentos(prev => prev.filter(x => x.id !== a.id)));
    }
  };

  const vidasArr = [0, 1, 2].map(i => i < vidas);

  return (
    <LinearGradient 
      colors={["#E8F5E9", "#C8E6C9", "#A5D6A7"]} 
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
          colors={["#66BB6A", "#43A047"]}
          style={[s.barraFill, { width: `${Math.min((totalGenerados / TOTAL_ALIMENTOS) * 100, 100)}%` }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </View>

      {/* INSTRUCCIÓN */}
      <View style={s.instruccion}>
        <Text style={s.instruccionTxt}>
          {alimentoSel 
            ? `👉 ¡Toca la canasta correcta para ${alimentoSel.nombre}!` 
            : '👆 Toca un alimento para seleccionarlo'}
        </Text>
      </View>

      {/* MONITO GUÍA */}
      <View style={s.monito}>
        <Personaje tipo="mono" tamanio={28}
          mensaje={alimentoSel ? `${alimentoSel.nombre}` : ''}
          estilo={{ transform: [{ scale: 0.7 }] }}
        />
      </View>

      {/* ÁREA DE CAÍDA */}
      <View style={s.area}>
        {alimentos.map(a => (
          <TouchableOpacity
            key={a.id}
            style={[
              s.item,
              {
                left: a.posX,
                top: a.posY,
                transform: [{ scale: a.escala }],
                borderColor: alimentoSel?.id === a.id ? '#FFC93C' : 'transparent',
                borderWidth: alimentoSel?.id === a.id ? 3 : 0,
              },
            ]}
            onPress={() => seleccionar(a)}
            activeOpacity={0.85}
            disabled={juegoTerminado}
          >
            <View style={s.itemWrapper}>
              <Image source={a.imagen} style={s.imgItem} resizeMode="contain" />
              <Text style={s.nombreItem}>{a.nombre}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* CANASTAS - MÁS GRANDES */}
      <View style={s.canastas}>
        <TouchableOpacity
          style={[s.canasta, alimentoSel && s.canastaActiva]}
          onPress={() => soltarEnCanasta('saludable')}
          disabled={!alimentoSel || juegoTerminado}
          activeOpacity={0.8}
        >
          <LinearGradient 
            colors={['#43A047', '#2E7D32', '#1B5E20']} 
            style={s.gradCanasta}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={s.canastaIconContainer}>
              <Text style={s.canastaEmoji}>🥗</Text>
              <Text style={s.canastaEmojiFruta}>🍎🥑🥦</Text>
            </View>
            <Text style={s.txtCanasta}>SALUDABLE</Text>
            <Text style={s.subCanasta}>😊 Frutas y verduras</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.canasta, alimentoSel && s.canastaActiva]}
          onPress={() => soltarEnCanasta('chatarra')}
          disabled={!alimentoSel || juegoTerminado}
          activeOpacity={0.8}
        >
          <LinearGradient 
            colors={['#E53935', '#ff5100', '#f14d01']} 
            style={s.gradCanasta}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={s.canastaIconContainer}>
              <Text style={s.canastaEmoji}>🗑️</Text>
              <Text style={s.canastaEmojiChatarra}>🍔🍕🍟</Text>
            </View>
            <Text style={s.txtCanasta}>CHATARRA</Text>
            <Text style={s.subCanasta}>😞 Comida dañina</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* INDICADOR DE ALIMENTO SELECCIONADO */}
      {alimentoSel && (
        <View style={s.indicadorSeleccion}>
          <Text style={s.indicadorTexto}>
            📦 {alimentoSel.nombre} seleccionado
          </Text>
        </View>
      )}
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
    borderColor: 'rgba(76, 175, 80, 0.2)',
  },
  chipTxt: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#1B5E20' 
  },
  filaVidas: { 
    flexDirection: 'row', 
    gap: 2 
  },

  barraFondo: { 
    height: 8, 
    backgroundColor: '#E8F5E9', 
    marginHorizontal: 14, 
    marginTop: 8, 
    borderRadius: 6, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.15)',
  },
  barraFill: { 
    height: 8, 
    borderRadius: 6,
  },

  instruccion: { 
    alignItems: 'center', 
    paddingVertical: 8, 
    backgroundColor: 'rgba(255, 247, 205, 0.85)', 
    marginHorizontal: 14, 
    marginTop: 8, 
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  instruccionTxt: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#4E342E' 
  },

  monito: { 
    alignItems: 'center', 
    height: 40, 
    justifyContent: 'center',
    marginTop: 2,
  },

  area: { 
    flex: 1, 
    position: 'relative' 
  },

  item: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  itemWrapper: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  imgItem: { 
    width: 54, 
    height: 54, 
    borderRadius: 12 
  },
  nombreItem: { 
    fontSize: 9, 
    fontWeight: '700', 
    color: '#2E7D32', 
    textAlign: 'center', 
    marginTop: 2 
  },

  canastas: { 
    flexDirection: 'row', 
    gap: 12, 
    paddingHorizontal: 12, 
    paddingVertical: 12, 
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
  canastaActiva: {
    transform: [{ scale: 1.02 }],
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
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
  canastaEmoji: { 
    fontSize: 32,
  },
  canastaEmojiFruta: { 
    fontSize: 18,
  },
  canastaEmojiChatarra: { 
    fontSize: 18,
  },
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

  // INDICADOR DE SELECCIÓN
  indicadorSeleccion: {
    position: 'absolute',
    bottom: 170,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 193, 7, 0.92)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    zIndex: 50,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 193, 7, 0.5)',
  },
  indicadorTexto: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4E342E',
  },
});