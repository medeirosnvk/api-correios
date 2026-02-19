import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { HomeScreen } from '../screens/HomeScreen';
import { TrackingScreen } from '../screens/TrackingScreen';
import { HistoricoScreen } from '../screens/HistoricoScreen';
import { RootStackParamList } from '../types';
import { colors } from '../theme/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.azulCorreios,
        tabBarInactiveTintColor: colors.cinzaClaro,
        tabBarStyle: {
          borderTopColor: colors.bordaLinha,
          backgroundColor: colors.fundoCard,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icones: Record<string, { ativo: string; inativo: string }> = {
            Home: { ativo: 'cube', inativo: 'cube-outline' },
            Historico: { ativo: 'time', inativo: 'time-outline' },
          };
          const icone = icones[route.name];
          return (
            <Ionicons
              name={(focused ? icone?.ativo : icone?.inativo) as any}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Rastrear' }} />
      <Tab.Screen name="Historico" component={HistoricoScreen} options={{ title: 'Histórico' }} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Rastreamento"
          component={TrackingScreen}
          options={({ route }) => ({
            title: route.params.codigo,
            headerBackTitle: 'Voltar',
            headerStyle: { backgroundColor: colors.fundoCard },
            headerTintColor: colors.azulCorreios,
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 15,
              letterSpacing: 1,
            },
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
