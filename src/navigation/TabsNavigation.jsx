import React from 'react';

// React Navigation
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens
import HomeScreen from '../screens/Tabs/HomeScreen';
import PetsScreen from '../screens/Tabs/PetsScreen';
import CalendarScreen from '../screens/Tabs/CalendarScreen';
import WikiScreen from '../screens/Tabs/WikiScreen';
import CommunityScreen from '../screens/Tabs/CommunityScreen';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Tabs = createBottomTabNavigator();

const screenOptions = {
  headerShown: false,
  tabBarActiveTintColor: '#EF9B93',
  tabBarInactiveTintColor: '#ADA9A7',
  tabBarLabelStyle: {fontFamily: 'Lato-Regular'},
  tabBarHideOnKeyboard: true,
  tabBarStyle: {
    height: 55,
    position: 'absolute',
    bottom: 7,
    marginLeft: 10,
    marginRight: 10,
    borderTopWidth: 0,
    borderRadius: 10
  },
};

const TabsNavigation = () => {
  return (
    <Tabs.Navigator screenOptions={screenOptions} initialRouteName="Home">
      <Tabs.Screen name="Home" component={HomeScreen} options={
        { tabBarLabel: 'Inicio', tabBarIcon: ({ color }) => (<MaterialCommunityIcons name="home" size={25} color={color} />)  }
      } />
      <Tabs.Screen name="Pets" component={PetsScreen} options={
        { tabBarLabel: 'Mascotas', tabBarIcon: ({ color }) => (<MaterialCommunityIcons name="heart" size={25} color={color} />) }
      }/>
      <Tabs.Screen name="Calendar" component={CalendarScreen} options={
        { tabBarLabel: 'Calendario', tabBarIcon: ({ color }) => (<MaterialCommunityIcons name="calendar" size={25} color={color} />) }
      }/>
      <Tabs.Screen name="Wiki" component={WikiScreen} options={
        { tabBarLabel: 'Wiki', tabBarIcon: ({ color }) => (<MaterialCommunityIcons name="book" size={25} color={color} />) }
      }/>
      <Tabs.Screen name="Community" component={CommunityScreen} options={
        { tabBarLabel: 'Comunidad', tabBarIcon: ({ color }) => (<MaterialCommunityIcons name="account-group" size={25} color={color} />) }
      }/>
    </Tabs.Navigator>
  )
}

export default TabsNavigation;