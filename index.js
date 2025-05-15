import { registerRootComponent } from 'expo';

import App from './App';

// Notificaciones en segundo plano
import messaging from '@react-native-firebase/messaging';
import { getItem, storeItem } from './src/utils/storage';
import { STORAGE_KEYS } from './src/constants/storageKeys';

// Quick Actions
import * as QuickActions from 'expo-quick-actions';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);

  if (!remoteMessage && (remoteMessage.data || remoteMessage.notification)) return;

  const savedNotifications = await getItem(STORAGE_KEYS.NOTIFICATIONS);

  try {
    let notifications = savedNotifications ? JSON.parse(savedNotifications) : [];

    const notificationToStore = {
      title: remoteMessage.notification.title,
      body: remoteMessage.notification.body,
      data: remoteMessage.data ? { ...remoteMessage.data } : {},
      timestamp: new Date().getTime(),
    }

    notifications.push(notificationToStore);
  
    await storeItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  } catch (error) {
    console.error('Error parsing notifications:', error);
  }
});

// Quick Actions
QuickActions.setItems([
  {
    id: 'daily-photo',
    title: 'Foto diaria',
    icon: 'camera-icon',
    params: {action: "daily-photo"},
  },
  {
    id: 'manage-pets',
    title: 'Gestionar mascotas',
    icon: 'paw-icon',
    params: {action: "manage-pets"},
  }
]);

registerRootComponent(App);
