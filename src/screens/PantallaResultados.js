// src/screens/PantallaResultados.js
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Confeti from '../components/Confeti';

const { width } = Dimensions.get('window');

export default function PantallaResultados({ route, navigation }) {
  const { nivelId, aciertos, total } = route.params || { nivelId: 1, aciertos: 0, total: 15 };

  const gano = aciertos >= Math.ceil(total / 2);
  const animModal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animModal, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  }, []);

  const irSiguienteNivel = () => {
    const siguienteId = nivelId + 1;
    const niveles = {
      1: 'JuegoCanastas',
      2: 'JuegoPlatoSaludable',
      3: 'JuegoSeleccionar',
      4: 'JuegoSnacks',
    };
    const pantalla = niveles[siguienteId] || 'Secciones';
    navigation.replace(pantalla, { nivelId: siguienteId });
  };

  const volverInicio = () => {
    navigation.navigate('Secciones');
  };

  return (
    <View style={styles.container}>
      {/* CONFETI */}
      {gano && <Confeti cantidad={50} duracion={4000} />}

      {/* OVERLAY RESULTADO */}
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.tarjeta,
            {
              transform: [
                {
                  scale: animModal.interpolate({
                    inputRange: [0, 0.6, 1],
                    outputRange: [0.3, 1.08, 1],
                  }),
                },
              ],
              opacity: animModal,
            },
          ]}
        >
          <LinearGradient
            colors={gano ? ['#1B5E20', '#2E7D32', '#43A047'] : ['#B71C1C', '#C62828', '#E53935']}
            style={styles.gradModal}
          >
            <Text style={styles.emojiModal}>{gano ? '🏆' : '💪'}</Text>
            <Text style={styles.tituloModal}>{gano ? '¡FELICIDADES!' : '¡BUEN INTENTO!'}</Text>
            <Text style={styles.subModal}>
              Clasificaste {aciertos} de {total} alimentos correctamente
            </Text>

            {/* Fila de estrellas ganadas */}
            <View style={styles.filaEstrellas}>
              {Array.from({ length: total }).map((_, i) => (
                <Text key={i} style={styles.estrella}>
                  {i < aciertos ? '⭐' : '☆'}
                </Text>
              ))}
            </View>

            <View style={styles.estadisticas}>
              <View style={styles.stat}>
                <Text style={styles.statNum}>{aciertos}</Text>
                <Text style={styles.statLbl}>✅ Aciertos</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.stat}>
                <Text style={styles.statNum}>{total - aciertos}</Text>
                <Text style={styles.statLbl}>❌ Fallados</Text>
              </View>
            </View>

            {/* Botón Siguiente Nivel */}
            <TouchableOpacity style={styles.btnPrincipal} onPress={irSiguienteNivel} activeOpacity={0.85}>
              <LinearGradient colors={['#FFD93D', '#F57C00']} style={styles.gradBtn}>
                <Text style={styles.txtBtnPrincipal}>
                  {gano ? '🚀 Siguiente Nivel' : '🔄 Intentar de nuevo'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Botón Volver al Inicio */}
            <TouchableOpacity style={styles.btnSecundario} onPress={volverInicio} activeOpacity={0.85}>
              <Text style={styles.txtBtnSecundario}>🏠 Volver al Inicio</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    gap: 12,
  },
  emojiModal: {
    fontSize: 68,
  },
  tituloModal: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subModal: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.88)',
    textAlign: 'center',
  },
  filaEstrellas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 2,
  },
  estrella: {
    fontSize: 14,
  },
  estadisticas: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingVertical: 14,
    width: '100%',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statNum: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
  },
  statLbl: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  btnPrincipal: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradBtn: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  txtBtnPrincipal: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1B5E20',
  },
  btnSecundario: {
    paddingVertical: 12,
    alignItems: 'center',
    width: '100%',
  },
  txtBtnSecundario: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.85)',
  },
});