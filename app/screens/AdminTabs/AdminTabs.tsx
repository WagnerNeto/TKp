import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';

import AdminHome from './AdminHome';
import ProfileScreen from './ProfileScreen';
import  TabBar  from '../../components/TabBar'; // Caminho do componente personalizado

const Tab = createBottomTabNavigator();

export default function AdminTabs() {
  return (
    <NavigationIndependentTree>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <TabBar {...props} />} // Usar barra personalizada
      >
        <Tab.Screen name="Início" component={AdminHome} />
        <Tab.Screen name="Perfil" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationIndependentTree>
  );
}
