import { NavigationContainer } from '@react-navigation/native';
import StackNavigation from './src/navigation/StackNavigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { UserProvider } from './src/context/UserContext';
import { ToastProvider } from 'react-native-toast-notifications';
import { navigationRef } from './src/utils/RootNavigation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    'Lato-Light': require('./assets/fonts/Lato-Light.ttf'),
    'Lato-Regular': require('./assets/fonts/Lato-Regular.ttf'),
    'Lato-Bold': require('./assets/fonts/Lato-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ToastProvider
          placement='top'
          duration={3000}
          animationType='slide-in'
          offset={50}
          successColor='#32a852'
          dangerColor='#cc695e'
          warningColor='#e0914c'
          normalColor='#4c96e0'
        >
          <UserProvider>
            <NavigationContainer ref={navigationRef}>
              <StackNavigation />
            </NavigationContainer>
          </UserProvider>
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}