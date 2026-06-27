// src/utils/premios.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const CLAVES = {
  RACHA: '@comida_divertida:racha',
  NIVELES_SIN_ERROR: '@comida_divertida:niveles_sin_error',
  PREMIOS: '@comida_divertida:premios',
  // Esta clave es DISTINTA del progreso permanente de Logros:
  // solo registra la "ronda actual" para desbloquear el juego
  // sorpresa, y se reinicia cada vez que el niño lo reclama.
  RONDA_PREMIO: '@comida_divertida:ronda_premio',
  PAGINA_COLOREAR: '@comida_divertida:pagina_colorear',
};

export async function guardarRacha(aciertosConsecutivos) {
  await AsyncStorage.setItem(CLAVES.RACHA, String(aciertosConsecutivos));
}

export async function leerRacha() {
  const valor = await AsyncStorage.getItem(CLAVES.RACHA);
  return valor ? parseInt(valor, 10) : 0;
}

export async function guardarNivelSinError() {
  const actual = await AsyncStorage.getItem(CLAVES.NIVELES_SIN_ERROR);
  const nuevo = actual ? parseInt(actual, 10) + 1 : 1;
  await AsyncStorage.setItem(CLAVES.NIVELES_SIN_ERROR, String(nuevo));
  return nuevo;
}

export async function leerNivelesSinError() {
  const valor = await AsyncStorage.getItem(CLAVES.NIVELES_SIN_ERROR);
  return valor ? parseInt(valor, 10) : 0;
}

// --- Ronda del premio sorpresa (separada del progreso de Logros) ---
export async function guardarNivelCompletado(nivelId) {
  const actual = await AsyncStorage.getItem(CLAVES.RONDA_PREMIO);
  const completados = actual ? JSON.parse(actual) : [];
  if (!completados.includes(nivelId)) {
    completados.push(nivelId);
    await AsyncStorage.setItem(CLAVES.RONDA_PREMIO, JSON.stringify(completados));
  }
  return completados;
}

export async function leerNivelesCompletados() {
  const valor = await AsyncStorage.getItem(CLAVES.RONDA_PREMIO);
  return valor ? JSON.parse(valor) : [];
}

// Se llama cuando el niño reclama/usa el premio: bloquea de nuevo
// el juego sorpresa hasta que vuelva a completar los 4 niveles.
export async function reiniciarRondaPremio() {
  await AsyncStorage.removeItem(CLAVES.RONDA_PREMIO);
}

// --- Página de colorear: avanza cada vez que se reclama el premio ---
export async function siguientePaginaColorear(totalPaginas) {
  const actual = await AsyncStorage.getItem(CLAVES.PAGINA_COLOREAR);
  const indiceActual = actual ? parseInt(actual, 10) : 0;
  const siguiente = (indiceActual + 1) % totalPaginas;
  await AsyncStorage.setItem(CLAVES.PAGINA_COLOREAR, String(siguiente));
  return indiceActual; // devuelve la que toca usar AHORA
}

// --- Premios/medallas especiales (sin cambios) ---
export async function guardarPremio(tipo) {
  const actual = await AsyncStorage.getItem(CLAVES.PREMIOS);
  const premios = actual ? JSON.parse(actual) : [];
  if (!premios.includes(tipo)) {
    premios.push(tipo);
    await AsyncStorage.setItem(CLAVES.PREMIOS, JSON.stringify(premios));
  }
  return premios;
}

export async function leerPremios() {
  const valor = await AsyncStorage.getItem(CLAVES.PREMIOS);
  return valor ? JSON.parse(valor) : [];
}

export async function verificarPremios(aciertos, total, nivelId) {
  const premios = await leerPremios();
  const racha = await leerRacha();
  const premiosGanados = [];

  if (racha >= 5 && !premios.includes('racha_5')) {
    await guardarPremio('racha_5');
    premiosGanados.push({ tipo: 'racha_5', emoji: '🔥', nombre: '¡Racha de 5!' });
  }
  if (racha >= 10 && !premios.includes('racha_10')) {
    await guardarPremio('racha_10');
    premiosGanados.push({ tipo: 'racha_10', emoji: '🔥🔥', nombre: '¡Racha de 10!' });
  }
  if (aciertos === total && !premios.includes(`perfecto_${nivelId}`)) {
    await guardarPremio(`perfecto_${nivelId}`);
    premiosGanados.push({ tipo: 'perfecto', emoji: '🏆', nombre: '¡Nivel perfecto!' });
  }
  return premiosGanados;
}