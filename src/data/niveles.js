// src/data/niveles.js
import { IMAGENES } from "./imagenes";

export const NIVELES = [
  {
    id: 1,
    titulo: "🥦 Verduras",
    juego: "JuegoCanastas",
    alimentos: [
      { imagen: IMAGENES.zanahoria, nombre: "ZANAHORIA", saludable: true },
      { imagen: IMAGENES.brocoli, nombre: "BRÓCOLI", saludable: true },
      { imagen: IMAGENES.tomate, nombre: "TOMATE", saludable: true },
      { imagen: IMAGENES.aguacate, nombre: "AGUACATE", saludable: true },
      { imagen: IMAGENES.hamburguesa, nombre: "HAMBURGUESA", saludable: false },
      { imagen: IMAGENES.pizza, nombre: "PIZZA", saludable: false },
      { imagen: IMAGENES.papasFritas, nombre: "PAPAS FRITAS", saludable: false },
      { imagen: IMAGENES.carne, nombre: "CARNE", saludable: true },
    ],
  },
  {
    id: 2,
    titulo: "🍎 Frutas",
    juego: "JuegoPlatoSaludable",
    alimentos: [
      { imagen: IMAGENES.manzana, nombre: "MANZANA", saludable: true },
      { imagen: IMAGENES.banana, nombre: "PLÁTANO", saludable: true },
      { imagen: IMAGENES.fresa, nombre: "FRESA", saludable: true },
      { imagen: IMAGENES.uva, nombre: "UVA", saludable: true },
      { imagen: IMAGENES.dona, nombre: "DONA", saludable: false },
      { imagen: IMAGENES.chocolate, nombre: "CHOCOLATE", saludable: false },
      { imagen: IMAGENES.helado, nombre: "HELADO", saludable: false },
      { imagen: IMAGENES.galleta, nombre: "GALLETA", saludable: false },
    ],
  },
  {
    id: 3,
    titulo: "💧 Bebidas",
    juego: "JuegoSeleccionar",
    alimentos: [
      { imagen: IMAGENES.agua, nombre: "AGUA", saludable: true },
      { imagen: IMAGENES.leche, nombre: "LECHE", saludable: true },
      { imagen: IMAGENES.jugoNaranja, nombre: "JUGO DE NARANJA", saludable: true },
      { imagen: IMAGENES.aguaDeCoco, nombre: "AGUA DE COCO", saludable: true },
      { imagen: IMAGENES.refresco, nombre: "REFRESCO", saludable: false },
      { imagen: IMAGENES.soda, nombre: "SODA", saludable: false },
      { imagen: IMAGENES.cafe, nombre: "CAFÉ", saludable: false },
      { imagen: IMAGENES.helado, nombre: "BATIDO AZUCARADO", saludable: false },
      { imagen: IMAGENES.piña, nombre: "JUGO DE LIMON", saludable: true },
    ],
  },
  {
    id: 4,
    titulo: "🍇 Snacks",
    juego: "JuegoSnacks",
    alimentos: [
      { imagen: IMAGENES.zanahoria, nombre: "ZANAHORIA", saludable: true },
      { imagen: IMAGENES.manzana, nombre: "MANZANA", saludable: true },
      { imagen: IMAGENES.uva, nombre: "UVAS", saludable: true },
      { imagen: IMAGENES.limon, nombre: "LIMÓN", saludable: true },
      { imagen: IMAGENES.papasFritas, nombre: "PAPAS Fritas", saludable: false },
      { imagen: IMAGENES.galleta, nombre: "GALLETAS", saludable: false },
      { imagen: IMAGENES.palomitas, nombre: "PALOMITAS DULCES", saludable: false },
      { imagen: IMAGENES.chocolate, nombre: "CHOCOLATE", saludable: false },
    ],
  },
];

export function mezclar(arreglo) {
  const copia = [...arreglo];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}