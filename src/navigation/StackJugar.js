// src/navigation/StackJugar.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PantallaBienvenida from "../screens/PantallaBienvenida";
import PantallaInicio from "../screens/PantallaInicio";
import JuegoSnacks from "../screens/JuegoSnacks";
import JuegoCanastas from "../screens/JuegoCanastas";
import JuegoPlatoSaludable from "../screens/JuegoPlatoSaludable";
import JuegoSeleccionar from "../screens/JuegoSeleccionar";
import PantallaResultados from "../screens/PantallaResultados";

const Stack = createNativeStackNavigator();

export default function StackJugar() {
  return (
    <Stack.Navigator
      initialRouteName="Bienvenida"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Bienvenida" component={PantallaBienvenida} />
      <Stack.Screen name="Secciones" component={PantallaInicio} />
      <Stack.Screen name="JuegoSnacks" component={JuegoSnacks} />
      <Stack.Screen name="JuegoCanastas" component={JuegoCanastas} />
      <Stack.Screen name="JuegoPlatoSaludable" component={JuegoPlatoSaludable} />
      <Stack.Screen name="JuegoSeleccionar" component={JuegoSeleccionar} />
      <Stack.Screen name="PantallaResultados" component={PantallaResultados} />
    </Stack.Navigator>
  );
}