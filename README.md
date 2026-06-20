# 🍎 Comida Divertida

App educativa para niños de 4 a 7 años que enseña a diferenciar alimentos
saludables de chatarra. Proyecto Semestral — Desarrollo de Aplicaciones Móviles.

## 1. Instalación

```bash
npm install -g expo-cli   # si no lo tienes
cd ComidaDivertida
npm install
npx expo start
```

Escanea el QR con la app **Expo Go** (Android) para probar la app en tu teléfono.

## 2. Estructura del proyecto

```
ComidaDivertida/
├── App.js                     # Navegación raíz (Tabs)
├── src/
│   ├── screens/                # Las 5 pantallas
│   │   ├── PantallaInicio.js
│   │   ├── PantallaJuego.js
│   │   ├── PantallaResultados.js
│   │   ├── PantallaLogros.js
│   │   └── PantallaComoJugar.js
│   ├── components/              # Componentes reutilizables
│   │   ├── BotonRespuesta.js
│   │   └── TarjetaMedalla.js
│   ├── navigation/
│   │   └── StackJugar.js        # Stack: Inicio -> Juego -> Resultados
│   ├── data/
│   │   └── niveles.js           # Banco de preguntas (3 niveles)
│   └── utils/
│       └── almacenamiento.js    # Toda la lógica de AsyncStorage
```

## 3. Cómo funciona cada pantalla

- **Inicio**: pide el nombre del niño (solo la primera vez), lo guarda en
  AsyncStorage y lleva al Nivel 1.
- **Juego**: muestra una comida por vez, el niño elige Saludable/Chatarra,
  recibe feedback positivo y suma estrellas. Al terminar las 8 preguntas
  del nivel, guarda el progreso y navega a Resultados.
- **Resultados**: muestra el puntaje del nivel y permite avanzar al
  siguiente o volver al inicio.
- **Logros**: lee todo de AsyncStorage (nombre, estrellas, progreso por
  nivel, estadísticas) y muestra medallas según el total de estrellas.
  Incluye botón de reinicio de progreso (con confirmación).
- **Cómo Jugar**: pantalla estática con instrucciones para el niño.

## 4. Generar APK/AAB firmado con EAS Build

```bash
npm install -g eas-cli
eas login
eas build:configure

# Generar keystore y APK de prueba
eas build --platform android --profile preview

# Generar AAB de producción (para Play Store)
eas build --platform android --profile production
```

El comando descarga/crea el `.keystore` automáticamente la primera vez
(EAS lo gestiona en la nube, pero puedes descargarlo con
`eas credentials`). Guarda ese archivo: es uno de los entregables.

## 5. Publicar en Google Play Store

1. Crear/activar cuenta de Google Play Console ($25 USD, pago único).
2. Crear la ficha de la app: nombre, descripción, ícono, capturas,
   clasificación de contenido (apta para niños).
3. Subir el archivo `.aab` generado en el paso anterior.
4. Publicar en **Prueba Interna** (suficiente para la entrega del curso)
   o en Producción si el equipo lo decide.
5. Tomar capturas de cada paso del Play Console como evidencia.

## 6. Notas técnicas

- Persistencia: `AsyncStorage`, capa centralizada en `src/utils/almacenamiento.js`.
- Navegación: Bottom Tabs (Jugar / Logros / Cómo Jugar) + Stack anidado
  dentro de "Jugar" (Inicio → Juego → Resultados).
- Código comentado en español en todos los archivos.
