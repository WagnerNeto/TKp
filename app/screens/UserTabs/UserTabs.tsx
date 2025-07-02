import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';

import HomeScreen from './HomeScreen';
import HistoryScreen from './HistoryScreen';
import ProfileScreen from './ProfileScreen';
import  TabBar  from '../../components/TabBar'; // Caminho do componente personalizado

const Tab = createBottomTabNavigator();

export default function UserTabs() {
  return (
    <NavigationIndependentTree>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <TabBar {...props} />} // Usar barra personalizada
      >
        <Tab.Screen name="Início" component={HomeScreen} />
        <Tab.Screen name="Histórico" component={HistoryScreen} />
        <Tab.Screen name="Perfil" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationIndependentTree>
  );
}
