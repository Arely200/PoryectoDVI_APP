// src/data/imagenes.js
// Mapa central de todas las imágenes de alimentos. Centralizar los
// require() aquí evita errores de rutas repetidas en cada pantalla.
// IMPORTANTE: los nombres deben coincidir EXACTO (mayúsculas, espacios)
// con los archivos reales en src/assets/imagenes/, porque Android
// distingue mayúsculas de minúsculas.

// src/data/imagenes.js
// src/data/imagenes.js
// src/data/imagenes.js
// src/data/imagenes.js
export const IMAGENES = {
  aguaDeCoco: require("../assets/imagenes/agua de coco.jpg"), // ← CORREGIDO
  agua: require("../assets/imagenes/agua.jpg"),
  aguacate: require("../assets/imagenes/aguacate.png"),
  banana: require("../assets/imagenes/banana.png"),
  brocoli: require("../assets/imagenes/brocoli.png"),
  cafe: require("../assets/imagenes/cafe.jpg"),
  carne: require("../assets/imagenes/carne.png"),
  chocolate: require("../assets/imagenes/chocolate.png"),
  dona: require("../assets/imagenes/Dona.png"),
  fresa: require("../assets/imagenes/Fresa.png"),
  galleta: require("../assets/imagenes/galleta.jpg"),
  hamburguesa: require("../assets/imagenes/Hamburguesa.png"),
  helado: require("../assets/imagenes/helado.jpg"),
  jugoNaranja: require("../assets/imagenes/jugo de naranja.jpg"),
  leche: require("../assets/imagenes/leche.jpg"),
  limon: require("../assets/imagenes/limon.png"),
  manzana: require("../assets/imagenes/Manzna.png"), // ← También está mal escrito "Manzana"
  mono: require("../assets/imagenes/Mono.png"),
  palomitas: require("../assets/imagenes/palomitas.jpg"),
  papasFritas: require("../assets/imagenes/papas fritas.jpg"),
  pizza: require("../assets/imagenes/Pizza.png"),
  pollo: require("../assets/imagenes/pollo.png"),
  refresco: require("../assets/imagenes/refresco.jpg"),
  soda: require("../assets/imagenes/Soda.jpg"),
  tomate: require("../assets/imagenes/Tomate.png"),
  uva: require("../assets/imagenes/uva.jpg"),
  zanahoria: require("../assets/imagenes/zanahoria.jpg"),
  piña: require("../assets/imagenes/piña.jpg")
};