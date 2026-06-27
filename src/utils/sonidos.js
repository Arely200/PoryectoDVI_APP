// src/utils/sonidos.js
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

let sonidoAcierto = null;
let sonidoFallo = null;
let sonidoVictoria = null;
let sonidoFondo = null;
let sonidosCargados = false;

// ========== MÚSICA DE FONDO ==========
export async function iniciarMusicaFondo() {
  try {
    if (sonidoFondo) return;
    
    console.log('🎵 Intentando cargar música de fondo...');
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/sonidos/fondo.mp3')
    );
    sonidoFondo = sound;
    await sonidoFondo.setIsLoopingAsync(true);
    await sonidoFondo.setVolumeAsync(0.5);
    await sonidoFondo.playAsync();
    console.log('🎵 Música de fondo iniciada OK');
  } catch (error) {
    console.log('❌ Error en música fondo:', error.message);
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
    console.log('🔊 Cargando sonidos...');
    
    const acierto = await Audio.Sound.createAsync(
      require('../assets/sonidos/acierto.mp3')
    );
    console.log('✅ Acierto cargado');
    
    const fallo = await Audio.Sound.createAsync(
      require('../assets/sonidos/fallo.mp3')
    );
    console.log('✅ Fallo cargado');
    
    const victoria = await Audio.Sound.createAsync(
      require('../assets/sonidos/victoria.mp3')
    );
    console.log('✅ Victoria cargada');
    
    sonidoAcierto = acierto.sound;
    sonidoFallo = fallo.sound;
    sonidoVictoria = victoria.sound;
    sonidosCargados = true;
    console.log('✅ Todos los sonidos cargados correctamente');
  } catch (error) {
    console.log('❌ Error cargando sonidos:', error.message);
    sonidosCargados = false;
  }
}

export async function reproducirAcierto() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {}
  
  if (sonidosCargados && sonidoAcierto) {
    try {
      await sonidoAcierto.setPositionAsync(0);
      await sonidoAcierto.playAsync();
      console.log('🔊 Acierto reproducido');
    } catch (error) {
      console.log('❌ Error reproduciendo acierto:', error.message);
    }
  }
}

export async function reproducirFallo() {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (error) {}
  
  if (sonidosCargados && sonidoFallo) {
    try {
      await sonidoFallo.setPositionAsync(0);
      await sonidoFallo.playAsync();
      console.log('🔊 Fallo reproducido');
    } catch (error) {
      console.log('❌ Error reproduciendo fallo:', error.message);
    }
  }
}

export async function reproducirVictoria() {
  if (sonidosCargados && sonidoVictoria) {
    try {
      await sonidoVictoria.setPositionAsync(0);
      await sonidoVictoria.playAsync();
      console.log('🔊 Victoria reproducida');
    } catch (error) {
      console.log('❌ Error reproduciendo victoria:', error.message);
    }
  }
}