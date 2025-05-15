import React from 'react'

// React Navigation
import { createStackNavigator } from '@react-navigation/stack'

// Screens
import EntryScreen from '../screens/EntryScreen';
import Tabs from './TabsNavigation';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import WelcomeAppScreen from '../screens/Welcome/WelcomeAppScreen';
import ManagePetScreen from '../screens/Stack/ManagePetScreen';
import AddPetScreen from '../screens/Stack/AddPetScreen';
import DailyPhotosScreen from '../screens/Stack/DailyPhotosScreen';
import AchievementsScreen from '../screens/Stack/AchievementsScreen';
import SettingsScreen from '../screens/Stack/SettingsScreen';
import EventInfoScreen from '../screens/Stack/EventInfoScreen';
import WikiInfoScreen from '../screens/Stack/WikiInfoScreen';

const Stack = createStackNavigator();

const StackNavigation = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Entry">
      <Stack.Screen name="Entry" component={EntryScreen} />
      {/* Auth */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      {/* Welcome */}
      <Stack.Screen name="Welcome" component={WelcomeAppScreen} />
      {/* Tabs */}
      <Stack.Screen name="MainTabs" component={Tabs} />
      {/* Stack */}
      <Stack.Screen name="ManagePet" component={ManagePetScreen} />
      <Stack.Screen name="AddPet" component={AddPetScreen} />
      <Stack.Screen name="DailyPhotos" component={DailyPhotosScreen} />
      <Stack.Screen name="Archivements" component={AchievementsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="EventInfo" component={EventInfoScreen} />
      <Stack.Screen name="WikiInfo" component={WikiInfoScreen} />
    </Stack.Navigator>
  )
}

export default StackNavigation;