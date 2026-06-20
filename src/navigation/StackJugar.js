// src/navigation/StackJugar.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PantallaBienvenida from "../screens/PantallaBienvenida";
import PantallaInicio from "../screens/PantallaInicio";
import PantallaJuego from "../screens/PantallaJuego";
import JuegoArrastrar from "../screens/JuegoArrastrar";
import JuegoMemoria from "../screens/JuegoMemoria";

import JuegoArmarPlato from "../screens/JuegoArmarPlato";
import JuegoPlato from "../screens/JuegoPlato";
import PantallaResultados from "../screens/PantallaResultados";


const Stack = createNativeStackNavigator();

export default function StackJugar() {
  return (
    <Stack.Navigator initialRouteName="Bienvenida" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Bienvenida" component={PantallaBienvenida} />
      <Stack.Screen name="Secciones" component={PantallaInicio} />
      <Stack.Screen name="Juego" component={PantallaJuego} />
      <Stack.Screen name="JuegoArrastrar" component={JuegoArrastrar} />
      <Stack.Screen name="JuegoMemoria" component={JuegoMemoria} />
      <Stack.Screen name="JuegoArmarPlato" component={JuegoArmarPlato} />
      <Stack.Screen name="JuegoPlato" component={JuegoPlato} />
      <Stack.Screen name="Resultados" component={PantallaResultados} />
    </Stack.Navigator>
  );
}