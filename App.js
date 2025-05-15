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
import { StatusBar } from 'expo-status-bar';
import { firebase } from '@react-native-firebase/messaging';
import { getItem, storeItem } from './src/utils/storage';
import { STORAGE_KEYS } from './src/constants/storageKeys';
import { LevelUpModalProvider } from './src/context/LevelUpModalContext';
import LevelUpModal from './src/components/Modals/LevelUpModal';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    'Lato-Light': require('./assets/fonts/Lato-Light.ttf'),
    'Lato-Regular': require('./assets/fonts/Lato-Regular.ttf'),
    'Lato-Bold': require('./assets/fonts/Lato-Bold.ttf'),
  });

  useEffect(() => {
    const onForegroundNotificationUnsubscribe = firebase.messaging().onMessage(async remoteMessage => {
      console.log('FCM Message data (foreground):', JSON.stringify(remoteMessage));

      if (!remoteMessage && (remoteMessage.data || remoteMessage.notification)) return;

      const savedNotifications = await getItem(STORAGE_KEYS.NOTIFICATIONS);

      try {
        let notifications = savedNotifications ? JSON.parse(savedNotifications) : [];

        const notificationToStore = {
          title: remoteMessage.notification.title,
          body: remoteMessage.notification.body,
          data: remoteMessage.data ? { ...remoteMessage.data } : {},
          timestamp: new Date().getTime(),
        };

        notifications.push(notificationToStore);
        
        await storeItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
      } catch (error) {
        console.error('Error parsing notifications:', error);
      }
    });

    return onForegroundNotificationUnsubscribe();
  }, []);

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
            <LevelUpModalProvider>
              <NavigationContainer ref={navigationRef}>
                <StackNavigation />
                <StatusBar style="light" />
              </NavigationContainer>
              <LevelUpModal />
            </LevelUpModalProvider>
          </UserProvider>
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}