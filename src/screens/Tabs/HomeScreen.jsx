import React, { use, useEffect, useState } from 'react'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import LatoText from '../../components/Fonts/LatoText'
import ModularCard from '../../components/UI/ModularCard'
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import messaging from '@react-native-firebase/messaging'
import { useUser } from '../../context/UserContext'
import PictureModal from '../../components/Modals/PictureModal'
import { STORAGE_KEYS } from '../../constants/storageKeys'
import { getItem, removeItem, storeItem } from '../../utils/storage'
import { tokenRefreshWrapper } from '../../services/tokenRefreshWrapper'
import { useToast } from 'react-native-toast-notifications'
import NotificationsModal from '../../components/Modals/NotificationsModal'
import { useQuickActionCallback } from "expo-quick-actions/hooks";
import { isToday } from '../../utils/shared'
import { useLevelUpModal } from '../../context/LevelUpModalContext'

const HomeScreen = ({navigation}) => {

  const [greeting, setGreeting] = useState('Buenos días');
  
  const [isTakingDailyPicture, setIsTakingDailyPicture] = useState(false);
  const [todayPhoto, setTodayPhoto] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [notificationData, setNotificationData] = useState(null);
  const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);
  const [notificationsShown, setNotificationsShown] = useState(false);

  const [todayReminders, setTodayReminders] = useState([]);

  const [newsData, setNewsData] = useState([]);
  
  const toast = useToast();
  const {user, refreshUser, updateUser} = useUser();
  const {showLevelUpModal} = useLevelUpModal();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      getGreeting();
      await getDailyPhoto();
      reloadLocalReminders();
    });
    
    getAbleNotifications();
    fetchEntryData();
    requestNotificationPermission();

    return unsubscribe;
  }, []);

  useEffect(() => {
    const requestLocationPermission = async () => {
      // Esperar 200ms antes de solicitar permisos de ubicación
      await new Promise(resolve => setTimeout(resolve, 200));
      // Solicitar permisos de ubicación
      await Location.requestForegroundPermissionsAsync();
    };
    requestLocationPermission();
  }, []);

  /**
   * Hook para manejar la acción rápida de la cámara
   * y la gestión de mascotas
   */
  useQuickActionCallback(async (action) => {
    if (action?.params.action === 'daily-photo') {
      setIsTakingDailyPicture(true);
    } else if (action?.params.action === 'manage-pets') {
      navigation.navigate('MainTabs', {screen: 'Pets'});
    }
  });

  /**
   * Función para obtener el saludo del día
   */
  const getGreeting = () => {
    const date = new Date();
    const hours = date.getHours();

    if (hours < 12) {
      setGreeting('Buenos días');
    } else if (hours < 19) {
      setGreeting('Buenas tardes');
    } else {
      setGreeting('Buenas noches');
    }
  };

  /**
   * Función para obtener la foto del día
   */
  const getDailyPhoto = async () => {
    const storedPhotos = await getItem(STORAGE_KEYS.DAILY_PHOTOS);

    const parsedPhotos = storedPhotos ? JSON.parse(storedPhotos) : [];

    if (parsedPhotos.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const todayPhoto = parsedPhotos?.find(photo => photo.date.split('T')[0] === today)?.uri || false;

      setTodayPhoto(todayPhoto);
    } else {
      setTodayPhoto(false);
    }
  };

  /**
   * Función para obtener los datos a refrescar 
   */
  const fetchEntryData = async () => {
    const response = await tokenRefreshWrapper('getData', {}, toast, user, refreshUser, updateUser, showLevelUpModal);

    if (response.success) {
      setNewsData(response.news);

      const reminders = response.reminders || [];

      const todayReminders = reminders.filter(reminder => {
        const _isToday = isToday(reminder.next_trigger_datetime_utc);
        return _isToday;
      });

      setTodayReminders(todayReminders);

      updateUser({
        ...user,
        reminders: reminders,
      });
      console.log('Recordatorios del día: ', reminders);
    } else {
      toast.show('Error en obtener datos', {type: 'danger'});
    }
  };

  /**
   * Función para recargar los recordatorios locales
   */
  const reloadLocalReminders = async () => {
    const reminders = user.reminders || [];
    const todayReminders = reminders.filter(reminder => {
      const _isToday = isToday(reminder.next_trigger_datetime_utc);
      return _isToday;
    });
    setTodayReminders(todayReminders);
  };

  /**
   * Función para obtener las notificaciones guardadas
   * y mostrarlas si existen
   */
  const getAbleNotifications = async () => {
    // Si ya hemos mostrado las notificaciones, no hacemos nada
    if (notificationsShown) return;

    // Obtenemos las notificaciones guardadas
    const savedNotifications = await getItem(STORAGE_KEYS.NOTIFICATIONS);

    // Cargamos las notificaciones guardadas si existen
    try {
      const parsedNotifications = savedNotifications ? JSON.parse(savedNotifications) : [];

      if (parsedNotifications.length > 0) {
        console.log('Notificaciones guardadas:', parsedNotifications);
        setIsNotificationModalVisible(true);
        setNotificationData({title: parsedNotifications[0].title, body: parsedNotifications[0].body, data: parsedNotifications[0].data});
        setNotifications(parsedNotifications.slice(1));
      } else {
        console.log('No hay notificaciones guardadas');
      }
    } catch (error) {
      console.error('Error parsing notifications:', error);
    }
  };

  /**
   * Función para solicitar permisos de notificaciones
   */
  const requestNotificationPermission = async () => {
    // Verificamos si ya tenemos permisos de notificaciones
    const currentStatus = await messaging().hasPermission();

    // Si ya tenemos permisos, no hacemos nada
    if (currentStatus === messaging.AuthorizationStatus.AUTHORIZED) {
      return;
    }

    const authStatus = await messaging().requestPermission(); // Solicitamos permisos de notificaciones

    // Verificamos si el usuario ha autorizado las notificaciones
    const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    // Si el usuario no ha autorizado las notificaciones, mostramos un mensaje
    if (!enabled) {
      toast.show('Debes habilitar las notificaciones en la configuración de la app', {type: 'warning'});
    }
  };

  /**
   * Función para manejar el cierre o la siguiente notificación
   * @param {boolean} showLater - Si queremos mostrar la notificación más tarde 
   */
  const handleCloseOrNextNotification = async (showLater) => {
    // Si no queremos mostrar la notificación más tarde, la eliminamos de las guardadas
    if (!showLater) {
      const savedNotifications = await getItem(STORAGE_KEYS.NOTIFICATIONS);
      try {
        const parsedNotifications = savedNotifications ? JSON.parse(savedNotifications) : [];
        if (parsedNotifications.length > 0) {
          const filteredNotifications = parsedNotifications.filter(notification => notification.title !== notificationData.title);
          
          await storeItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(filteredNotifications));
        }
      } catch (error) {
        console.error('Error parsing notifications:', error);
      }
    }

    // Mostramos la siguiente notificación o cerramos el modal si no hay más notificaciones
    if (notifications.length > 0) {
      const nextNotification = [notifications[0].title, notifications[0].body, notifications[0].data];
      setNotifications(notifications.slice(1));
      setNotificationData(nextNotification);
    } else {
      setIsNotificationModalVisible(false);
      setNotificationData(null);
      setNotificationsShown(true);
    }
  };

  /**
   * Función para manejar el cierre del modal de la foto del día
   */
  const onPhotoDone = async () => {
    await getDailyPhoto();
  };

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView showsVerticalScrollIndicator={false} style={{marginBottom: 50}}>
        <View style={styles.headerContainer}>
          <LatoText style={styles.greeting}>{greeting}, <LatoText style={styles.name}>{user?.name}</LatoText></LatoText>
          <View style={styles.rightHeaderContainer}>
            <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Archivements')}>
              <MaterialCommunityIcons name="trophy" size={25} color="#242222" onPress={() => navigation.navigate('Archivements')}/>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('Settings')}>
              <MaterialIcons name="settings" size={25} color="#242222" onPress={() => navigation.navigate('Settings')}/>
            </TouchableOpacity>
          </View>
        </View>
        <ModularCard 
          title="Recordatorios del día"
          icon={<MaterialIcons name="notifications-none" size={25} color="#191717" />}
          data={todayReminders}
          type="reminders"
          viewMoreClick={() => navigation.navigate('MainTabs', {screen: 'Calendar', params: {defaultDay: true}})}
        />
        <ModularCard 
          title="Foto del día"
          icon={<MaterialIcons name="camera" size={25} color="#191717" />}
          data={todayPhoto}
          type="picture"
          onClick={() => setIsTakingDailyPicture(true)}
          viewMoreClick={() => navigation.navigate('DailyPhotos')}
        />
        <ModularCard 
          title="Novedades"
          icon={<MaterialIcons name="inbox" size={25} color="#191717" />}
          data={newsData}
          type="news"
          viewMoreClick={() => toast.show('No hay más novedades por ahora', {type: 'info'})}
        />
      </ScrollView>
      <NotificationsModal 
        data={notificationData}
        isVisible={isNotificationModalVisible}
        onClose={handleCloseOrNextNotification}
      />
      <PictureModal
        isVisible={isTakingDailyPicture}
        setIsVisible={setIsTakingDailyPicture}
        dailyPhotoDone={false}
        onPhotoDone={onPhotoDone}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#EEEAE8',
    padding: 13,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    color: '#191717',
  },
  name: {
    color: '#458AC3',
    fontWeight: 'bold',
  },
  rightHeaderContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 25,
  },
});

export default HomeScreen;