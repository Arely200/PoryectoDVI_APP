// App.js
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { Text } from "react-native";

import { cargarSonidos, iniciarMusicaFondo } from "./src/utils/sonidos";

import StackJugar from "./src/navigation/StackJugar";
import PantallaLogros from "./src/screens/PantallaLogros";
import PantallaComoJugar from "./src/screens/PantallaComoJugar";

const Tab = createBottomTabNavigator();

function iconoTab(emoji) {
  return () => <Text style={{ fontSize: 20 }}>{emoji}</Text>;
}

export default function App() {
  useEffect(() => {
    cargarSonidos();
    iniciarMusicaFondo();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#4CAF50",
        }}
      >
        <Tab.Screen
          name="inicio"
          component={StackJugar}
          options={{ tabBarIcon: iconoTab("🏠") }}
        />
        <Tab.Screen
          name="Logros"
          component={PantallaLogros}
          options={{ tabBarIcon: iconoTab("🏆") }}
        />
        <Tab.Screen
          name="ComoJugar"
          component={PantallaComoJugar}
          options={{ tabBarIcon: iconoTab("📖"), title: "Cómo Jugar" }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}