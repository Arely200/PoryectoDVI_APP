// src/utils/sonidos.js
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

let sonidoAcierto = null;
let sonidoFallo = null;
let sonidoVictoria = null;
let sonidoFondo = null;

// ========== MÚSICA DE FONDO ==========
export async function iniciarMusicaFondo() {
  try {
    if (sonidoFondo) return;
    
    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/sonidos/fondo.mp3')
    );
    sonidoFondo = sound;
    await sonidoFondo.setIsLoopingAsync(true);
    await sonidoFondo.setVolumeAsync(0.4);
    await sonidoFondo.playAsync();
    console.log('🎵 Música de fondo iniciada');
  } catch (error) {
    console.log('Error en música fondo:', error);
  }
}

export async function pausarMusicaFondo() {
  if (sonidoFondo) {
    try { await sonidoFondo.pauseAsync(); } catch (error) {}
  }
}

export async function reanudarMusicaFondo() {
  if (sonidoFondo) {
    try { await sonidoFondo.playAsync(); } catch (error) {}
  }
}

export async function detenerMusicaFondo() {
  if (sonidoFondo) {
    try {
      await sonidoFondo.stopAsync();
      await sonidoFondo.unloadAsync();
      sonidoFondo = null;
    } catch (error) {}
  }
}

// ========== SONIDOS DEL JUEGO ==========
export async function cargarSonidos() {
  try {
    const acierto = await Audio.Sound.createAsync(
      require('../../assets/sonidos/acierto.mp3')
    );
    const fallo = await Audio.Sound.createAsync(
      require('../../assets/sonidos/fallo.mp3')
    );
    const victoria = await Audio.Sound.createAsync(
      require('../../assets/sonidos/victoria.mp3')
    );
    sonidoAcierto = acierto.sound;
    sonidoFallo = fallo.sound;
    sonidoVictoria = victoria.sound;
    console.log('✅ Sonidos cargados correctamente');
  } catch (error) {
    console.log('Error cargando sonidos:', error);
  }
}

export async function reproducirAcierto() {
  // VIBRACIÓN (siempre funciona)
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {}
  
  // SONIDO
  if (sonidoAcierto) {
    try {
      await sonidoAcierto.setPositionAsync(0);
      await sonidoAcierto.playAsync();
    } catch (error) {}
  }
}

export async function reproducirFallo() {
  // VIBRACIÓN
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (error) {}
  
  // SONIDO
  if (sonidoFallo) {
    try {
      await sonidoFallo.setPositionAsync(0);
      await sonidoFallo.playAsync();
    } catch (error) {}
  }
}

export async function reproducirVictoria() {
  if (sonidoVictoria) {
    try {
      await sonidoVictoria.setPositionAsync(0);
      await sonidoVictoria.playAsync();
    } catch (error) {}
  }
}