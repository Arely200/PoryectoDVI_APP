// src/data/niveles.js
export const NIVELES = [
  {
    id: 1,
    titulo: "Verduras vs Chatarra",
    juego: "arrastrar",
    alimentos: [
      { emoji: "🥕", nombre: "ZANAHORIA", saludable: true },
      { emoji: "🥦", nombre: "BRÓCOLI", saludable: true },
      { emoji: "🥗", nombre: "LECHUGA", saludable: true },
      { emoji: "🍅", nombre: "TOMATE", saludable: true },
      { emoji: "🍔", nombre: "HAMBURGUESA", saludable: false },
      { emoji: "🍕", nombre: "PIZZA", saludable: false },
      { emoji: "🍟", nombre: "PAPAS FRITAS", saludable: false },
      { emoji: "🌭", nombre: "SALCHICHA", saludable: false },
    ],
  },
  {
    
    id: 2,
    titulo: "Frutas vs Dulces",
    juego: "armarPlato",
    alimentos: [
      { emoji: "🍎", nombre: "MANZANA", saludable: true },
      { emoji: "🍌", nombre: "PLÁTANO", saludable: true },
      { emoji: "🍓", nombre: "FRESA", saludable: true },
      { emoji: "🍇", nombre: "UVA", saludable: true },
      { emoji: "🍩", nombre: "DONA", saludable: false },
      { emoji: "🍫", nombre: "CHOCOLATE", saludable: false },
      { emoji: "🍬", nombre: "CARAMELO", saludable: false },
      { emoji: "🍦", nombre: "HELADO", saludable: false },
    ],
  },
  {
    id: 3,
    titulo: "Bebidas: Saludables vs Chatarra",
    juego: "plato",
    alimentos: [
      { emoji: "💧", nombre: "AGUA", saludable: true },
      { emoji: "🥛", nombre: "LECHE", saludable: true },
      { emoji: "🧃", nombre: "JUGO NATURAL", saludable: true },
      { emoji: "🥥", nombre: "AGUA DE COCO", saludable: true },
      { emoji: "🥤", nombre: "REFRESCO", saludable: false },
      { emoji: "🧋", nombre: "BEBIDA AZUCARADA", saludable: false },
      { emoji: "🍾", nombre: "SODA", saludable: false },
      { emoji: "⚡", nombre: "ENERGIZANTE", saludable: false },
    ],
  },
  {
    id: 4,
    titulo: "Snacks: Sanos vs Chatarra",
    juego: "botones",
    alimentos: [
      { emoji: "🥜", nombre: "NUECES", saludable: true },
      { emoji: "🍎", nombre: "MANZANA EN TROZOS", saludable: true },
      { emoji: "🥕", nombre: "ZANAHORIAS BABY", saludable: true },
      { emoji: "🍇", nombre: "UVAS", saludable: true },
      { emoji: "🍟", nombre: "PAPAS EN BOLSA", saludable: false },
      { emoji: "🍪", nombre: "GALLETAS", saludable: false },
      { emoji: "🍬", nombre: "DULCES GOMOSOS", saludable: false },
      { emoji: "🍫", nombre: "CHOCOLATINA", saludable: false },
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