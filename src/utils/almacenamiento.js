// src/utils/almacenamiento.js
// Esta capa centraliza TODO el acceso a AsyncStorage (la base de datos local).
// Así, si en el futuro cambiamos a SQLite, solo modificamos este archivo
// y el resto de la app no se entera del cambio.

import AsyncStorage from "@react-native-async-storage/async-storage";

const CLAVES = {
  NOMBRE: "@comida_divertida:nombre",
  ESTRELLAS: "@comida_divertida:estrellas",
  PROGRESO: "@comida_divertida:progreso",
  PARTIDAS: "@comida_divertida:partidas_jugadas",
  ULTIMA_VEZ: "@comida_divertida:ultima_vez",
  PRIMERA_VEZ: "@comida_divertida:primera_vez", // ✅ NUEVO
};

// --- Nombre del niño/a ---
export async function guardarNombre(nombre) {
  await AsyncStorage.setItem(CLAVES.NOMBRE, nombre);
}

export async function leerNombre() {
  const valor = await AsyncStorage.getItem(CLAVES.NOMBRE);
  return valor || "";
}

// --- Estrellas totales ---
export async function leerEstrellas() {
  const valor = await AsyncStorage.getItem(CLAVES.ESTRELLAS);
  return valor ? parseInt(valor, 10) : 0;
}

export async function sumarEstrellas(cantidad) {
  const actuales = await leerEstrellas();
  const nuevas = actuales + cantidad;
  await AsyncStorage.setItem(CLAVES.ESTRELLAS, String(nuevas));
  return nuevas;
}

// --- Progreso por nivel ---
export async function leerProgreso() {
  const valor = await AsyncStorage.getItem(CLAVES.PROGRESO);
  return valor ? JSON.parse(valor) : {};
}

export async function guardarProgresoNivel(nivelId, aciertos, total) {
  const progreso = await leerProgreso();
  progreso[nivelId] = {
    completado: true,
    aciertos,
    total,
  };
  await AsyncStorage.setItem(CLAVES.PROGRESO, JSON.stringify(progreso));
  return progreso;
}

// --- Estadísticas de juego ---
export async function registrarPartidaJugada() {
  const valor = await AsyncStorage.getItem(CLAVES.PARTIDAS);
  const total = valor ? parseInt(valor, 10) + 1 : 1;
  await AsyncStorage.setItem(CLAVES.PARTIDAS, String(total));
  await AsyncStorage.setItem(CLAVES.ULTIMA_VEZ, new Date().toISOString());
  return total;
}

export async function leerEstadisticas() {
  const partidas = await AsyncStorage.getItem(CLAVES.PARTIDAS);
  const ultimaVez = await AsyncStorage.getItem(CLAVES.ULTIMA_VEZ);
  return {
    partidasJugadas: partidas ? parseInt(partidas, 10) : 0,
    ultimaVez: ultimaVez || null,
  };
}

// --- Reiniciar todo el progreso (botón para maestros) ---
export async function reiniciarProgreso() {
  await AsyncStorage.multiRemove([
    CLAVES.ESTRELLAS,
    CLAVES.PROGRESO,
    CLAVES.PARTIDAS,
    CLAVES.ULTIMA_VEZ,
  ]);
}

// --- ✅ Primera vez que abre la app ---
export async function guardarPrimeraVez() {
  await AsyncStorage.setItem(CLAVES.PRIMERA_VEZ, "true");
}

export async function leerPrimeraVez() {
  const valor = await AsyncStorage.getItem(CLAVES.PRIMERA_VEZ);
  return valor === "true";
}