// src/utils/sonidos.js
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

let sonidoAcierto  = null;
let sonidoFallo    = null;
let sonidoVictoria = null;
let sonidoFondo    = null;
let sonidosCargados = false;
let sonidoActual = null;

// ── Función para detener cualquier sonido en reproducción ──
export async function detenerSonidosActuales() {
  try {
    if (sonidoActual) {
      await sonidoActual.stopAsync();
      await sonidoActual.unloadAsync();
      sonidoActual = null;
      console.log('🔇 Sonidos detenidos');
    }
  } catch (error) {
    console.log('Error deteniendo sonido:', error.message);
  }
}

// ── Función base para voces ──
async function reproducirVoz(archivo) {
  try {
    await detenerSonidosActuales();
    const { sound } = await Audio.Sound.createAsync(archivo);
    sonidoActual = sound;
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate(status => {
      if (status.didJustFinish) {
        sound.unloadAsync();
        sonidoActual = null;
      }
    });
  } catch (e) {
    console.log('Error voz:', e.message);
  }
}

function alAzar(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ══════════════════════════════════════
// MÚSICA DE FONDO
// ══════════════════════════════════════
export async function iniciarMusicaFondo() {
  try {
    if (sonidoFondo) return;
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sonidos/fondo.mp3')
    );
    sonidoFondo = sound;
    await sonidoFondo.setIsLoopingAsync(true);
    await sonidoFondo.setVolumeAsync(0.3); // ← BAJADO DE 0.5 A 0.3
    await sonidoFondo.playAsync();
    console.log('🎵 Música de fondo iniciada');
  } catch (error) {
    console.log('❌ Error música fondo:', error.message);
  }
}

export async function pausarMusicaFondo() {
  try { if (sonidoFondo) await sonidoFondo.pauseAsync(); } catch (e) {}
}

export async function reanudarMusicaFondo() {
  try { if (sonidoFondo) await sonidoFondo.playAsync(); } catch (e) {}
}

export async function detenerMusicaFondo() {
  try {
    if (sonidoFondo) {
      await sonidoFondo.stopAsync();
      await sonidoFondo.unloadAsync();
      sonidoFondo = null;
    }
  } catch (e) {}
}

// ══════════════════════════════════════
// SONIDOS DEL JUEGO (se precargan)
// ══════════════════════════════════════
export async function cargarSonidos() {
  try {
    const [a, f, v] = await Promise.all([
      Audio.Sound.createAsync(require('../assets/sonidos/acierto.mp3')),
      Audio.Sound.createAsync(require('../assets/sonidos/fallo.mp3')),
      Audio.Sound.createAsync(require('../assets/sonidos/victoria.mp3')),
    ]);
    sonidoAcierto  = a.sound;
    sonidoFallo    = f.sound;
    sonidoVictoria = v.sound;
    sonidosCargados = true;
    console.log('✅ Sonidos del juego cargados');
  } catch (error) {
    console.log('❌ Error cargando sonidos:', error.message);
    sonidosCargados = false;
  }
}

export async function reproducirAcierto() {
  try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (e) {}
  try {
    if (sonidosCargados && sonidoAcierto) {
      await sonidoAcierto.setPositionAsync(0);
      await sonidoAcierto.playAsync();
    }
  } catch (e) { console.log('❌ Error acierto:', e.message); }
}

export async function reproducirFallo() {
  try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch (e) {}
  try {
    if (sonidosCargados && sonidoFallo) {
      await sonidoFallo.setPositionAsync(0);
      await sonidoFallo.playAsync();
    }
  } catch (e) { console.log('❌ Error fallo:', e.message); }
}

export async function reproducirVictoria() {
  try {
    if (sonidosCargados && sonidoVictoria) {
      await sonidoVictoria.setPositionAsync(0);
      await sonidoVictoria.playAsync();
    }
  } catch (e) { console.log('❌ Error victoria:', e.message); }
}

// ══════════════════════════════════════
// VOCES — bienvenida y navegación
// ══════════════════════════════════════
export const vozBienvenida  = () => reproducirVoz(require('../assets/sonidos/voz_bienvenida.mp3'));
export const vozNiveles     = () => reproducirVoz(require('../assets/sonidos/voz_niveles.mp3'));
export const vozBuenIntento = () => reproducirVoz(require('../assets/sonidos/voz_buen_intento.mp3'));
export const vozDerrota     = () => reproducirVoz(require('../assets/sonidos/voz_derrota.mp3'));
export const vozVictoria    = () => reproducirVoz(require('../assets/sonidos/victoria.mp3'));

// ══════════════════════════════════════
// VOCES — inicio de cada juego
// ══════════════════════════════════════
export const vozInicioCanastas    = () => reproducirVoz(require('../assets/sonidos/voz_inicio_canastas.mp3'));
export const vozInicioPlato       = () => reproducirVoz(require('../assets/sonidos/voz_inicio_plato.mp3'));
export const vozInicioSeleccionar = () => reproducirVoz(require('../assets/sonidos/voz_inicio_seleccionar.mp3'));
export const vozInicioSnacks      = () => reproducirVoz(require('../assets/sonidos/oz_inicio_snacks.mp3'));
export const vozInicioBebidas     = () => reproducirVoz(require('../assets/sonidos/oz_inicio_bebidas.mp3'));

// ══════════════════════════════════════
// VOCES — aciertos al azar (CANASTAS)
// ══════════════════════════════════════
export const vozAcierto = () => reproducirVoz(alAzar([
  require('../assets/sonidos/voz_acierto_1.mp3'),
  require('../assets/sonidos/voz_acierto_2.mp3'),
  require('../assets/sonidos/voz_acierto_3.mp3'),
  require('../assets/sonidos/voz_acierto_4.mp3'),
  require('../assets/sonidos/voz_acierto_5.mp3'),
]));

// ══════════════════════════════════════
// VOCES — fallos al azar (CANASTAS)
// ══════════════════════════════════════
export const vozFallo = () => reproducirVoz(alAzar([
  require('../assets/sonidos/voz_fallo_1.mp3'),
  require('../assets/sonidos/voz_fallo_2.mp3'),
  require('../assets/sonidos/voz_fallo_3.mp3'),
  require('../assets/sonidos/voz_fallo_4.mp3'),
]));

// ══════════════════════════════════════
// VOCES — fallos para SNACKS (excluye fallo_2)
// ══════════════════════════════════════
export const vozFalloSnacks = () => reproducirVoz(alAzar([
  require('../assets/sonidos/voz_fallo_1.mp3'),
  require('../assets/sonidos/voz_fallo_3.mp3'),
  require('../assets/sonidos/voz_fallo_4.mp3'),
]));

// ══════════════════════════════════════
// VOCES — se escapó al azar
// ══════════════════════════════════════
export const vozEscapo = () => reproducirVoz(alAzar([
  require('../assets/sonidos/voz_escapo_1.mp3'),
  require('../assets/sonidos/voz_escapo_2.mp3'),
  require('../assets/sonidos/voz_escapo_3.mp3'),
]));

// ══════════════════════════════════════
// VOCES — plato saludable
// ══════════════════════════════════════
export const vozPlatoBien = () => reproducirVoz(alAzar([
  require('../assets/sonidos/voz_plato_bien_1.mp3'),
  require('../assets/sonidos/voz_plato_bien_2.mp3'),
  require('../assets/sonidos/voz_plato_bien_3.mp3'),
]));

export const vozPlatoMal = () => reproducirVoz(alAzar([
  require('../assets/sonidos/voz_plato_mal_1.mp3'),
  require('../assets/sonidos/voz_plato_mal_2.mp3'),
  require('../assets/sonidos/voz_plato_mal_3.mp3'),
]));

// ══════════════════════════════════════
// VOCES — seleccionar / BEBIDAS
// ══════════════════════════════════════
export const vozSelBien = () => reproducirVoz(alAzar([
  require('../assets/sonidos/voz_sel_bien_1.mp3'),
  require('../assets/sonidos/voz_sel_bien_2.mp3'),
  require('../assets/sonidos/voz_sel_bien_3.mp3'),
]));

export const vozSelMal = () => reproducirVoz(alAzar([
  require('../assets/sonidos/voz_sel_mal_1.mp3'),
  require('../assets/sonidos/voz_sel_mal_2.mp3'),
]));

// ══════════════════════════════════════
// VOCES — snacks
// ══════════════════════════════════════
export const vozSnackBien = () => reproducirVoz(alAzar([
  require('../assets/sonidos/voz_snack_bien_1.mp3'),
  require('../assets/sonidos/voz_snack_bien_2.mp3'),
  require('../assets/sonidos/voz_snack_bien_3.mp3'),
]));

export const vozSnackMal = () => reproducirVoz(alAzar([
  require('../assets/sonidos/voz_snack_mal_1.mp3'),
  require('../assets/sonidos/voz_snack_mal_2.mp3'),
  require('../assets/sonidos/voz_snack_mal_3.mp3'),
]));

// ══════════════════════════════════════
// EXPORTAR sonidoFondo para controlar volumen
// ══════════════════════════════════════
export { sonidoFondo };