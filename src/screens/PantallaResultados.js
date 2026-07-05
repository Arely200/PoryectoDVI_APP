// src/screens/PantallaResultados.js
import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Confeti from '../components/Confeti';

const { width } = Dimensions.get('window');

export default function PantallaResultados({ route, navigation }) {
  const params        = route.params || {};
  const nivelIdFinal  = params.nivelId  ?? 1;
  const aciertosFinal = params.aciertos ?? 0;
  const totalFinal    = params.total    ?? 15;
  const fallidosFinal = params.fallidos ?? (totalFinal - aciertosFinal);
  const perdido       = params.perdido  ?? false;

  const gano = !perdido && aciertosFinal >= Math.ceil(totalFinal / 2);

  const animModal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animModal, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  }, []);

  const NIVELES = {
    1: 'JuegoCanastas',
    2: 'JuegoPlatoSaludable',
    3: 'JuegoSeleccionar',
    4: 'JuegoSnacks',
  };

  const irSiguienteNivel = () => {
    const sig = nivelIdFinal + 1;
    navigation.replace(NIVELES[sig] || 'Secciones', { nivelId: sig });
  };

  const volverInicio = () => navigation.navigate('Secciones');

  const reintentar = () =>
    navigation.replace(NIVELES[nivelIdFinal] || 'Secciones', { nivelId: nivelIdFinal });

  const colores = gano
    ? ['#1B5E20', '#2E7D32', '#43A047']
    : perdido
    ? ['#B71C1C', '#C62828', '#E53935']
    : ['#F57C00', '#E65100', '#FF8F00'];

  // Estrellas: máximo 5, proporcional a aciertos
  const estrellasLlenas = Math.round((aciertosFinal / totalFinal) * 5);

  return (
    <View style={st.container}>
      {gano && <Confeti cantidad={50} duracion={4000} />}

      <View style={st.overlay}>
        <Animated.View
          style={[
            st.tarjeta,
            {
              opacity: animModal,
              transform: [{
                scale: animModal.interpolate({
                  inputRange: [0, 0.6, 1],
                  outputRange: [0.3, 1.08, 1],
                }),
              }],
            },
          ]}
        >
          <LinearGradient colors={colores} style={st.gradModal}>

            {/* EMOJI GRANDE */}
            <Text style={st.emoji}>
              {gano ? '🏆' : perdido ? '😊' : '💪'}
            </Text>

            {/* TÍTULO */}
            <Text style={st.titulo}>
              {gano ? '¡FELICIDADES!' : perdido ? '¡PERDISTE!' : '¡BUEN INTENTO!'}
            </Text>

            {/* SUBTÍTULO */}
            <Text style={st.sub}>
              Clasificaste {aciertosFinal} de {totalFinal} alimentos correctamente
            </Text>

            {/* ESTRELLAS — fijas en 5 */}
            <View style={st.filaEstrellas}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Text key={i} style={st.estrella}>
                  {i < estrellasLlenas ? '⭐' : '☆'}
                </Text>
              ))}
            </View>

            {/* ESTADÍSTICAS — aciertos y fallos con colores distintos */}
            <View style={st.stats}>
              <View style={st.stat}>
                <Text style={[st.statNum, { color: '#A5D6A7' }]}>
                  {aciertosFinal}
                </Text>
                <Text style={st.statLbl}>✅ Aciertos</Text>
              </View>

              <View style={st.divider} />

              <View style={st.stat}>
                <Text style={[st.statNum, { color: '#FFCDD2' }]}>
                  {fallidosFinal}
                </Text>
                <Text style={st.statLbl}>❌ Fallados</Text>
              </View>
            </View>

            {/* MENSAJE EXTRA */}
            <View style={st.mensajeBox}>
              <Text style={st.mensajeTxt}>
                {gano
                  ? '¡Muy bien! Sabes distinguir los alimentos saludables 🥦🍎'
                  : perdido
                  ? 'No te rindas, ¡inténtalo de nuevo! 💪'
                  : '¡Casi lo logras! Practica un poco más 🌟'}
              </Text>
            </View>

            {/* BOTÓN PRINCIPAL */}
            <TouchableOpacity
              style={st.btnPrincipal}
              onPress={perdido ? reintentar : gano ? irSiguienteNivel : reintentar}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#FFD93D', '#F57C00']} style={st.gradBtn}>
                <Text style={st.txtBtn}>
                  {perdido
                    ? '🔄 Intentar de nuevo'
                    : gano
                    ? '🚀 Siguiente Nivel'
                    : '🔄 Intentar de nuevo'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* BOTÓN SECUNDARIO */}
            <TouchableOpacity style={st.btnSec} onPress={volverInicio} activeOpacity={0.85}>
              <Text style={st.txtBtnSec}>🏠 Volver al Inicio</Text>
            </TouchableOpacity>

          </LinearGradient>
        </Animated.View>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  tarjeta: {
    width: '88%',
    maxWidth: 400,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  gradModal: {
    padding: 28,
    alignItems: 'center',
    gap: 14,
  },

  emoji: {
    fontSize: 72,
  },

  titulo: {
    fontSize: 30,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },

  sub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
    lineHeight: 20,
  },

  filaEstrellas: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  estrella: {
    fontSize: 32,
  },

  stats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingVertical: 18,
    width: '100%',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  statNum: {
    fontSize: 42,        // bien grande para que el niño lo vea
    fontWeight: '900',
    lineHeight: 46,
  },
  statLbl: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginVertical: 4,
  },

  mensajeBox: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  mensajeTxt: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 20,
  },

  btnPrincipal: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradBtn: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  txtBtn: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1B5E20',
    letterSpacing: 0.5,
  },

  btnSec: {
    paddingVertical: 10,
    alignItems: 'center',
    width: '100%',
  },
  txtBtnSec: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
  },
});