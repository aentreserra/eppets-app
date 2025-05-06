import React, { useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import LatoText from '../../components/Fonts/LatoText'
import ModularCard from '../../components/UI/ModularCard'
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { firebase } from '@react-native-firebase/messaging'
import { useUser } from '../../context/UserContext'
import PictureModal from '../../components/Modals/PictureModal'
import { STORAGE_KEYS } from '../../constants/storageKeys'
import { getItem, removeItem } from '../../utils/storage'
import { tokenRefreshWrapper } from '../../services/tokenRefreshWrapper'
import { useToast } from 'react-native-toast-notifications'

const HomeScreen = ({navigation}) => {

  const [greeting, setGreeting] = useState('Buenos días');
  
  const [isTakingDailyPicture, setIsTakingDailyPicture] = useState(false);
  const [todayPhoto, setTodayPhoto] = useState(false);

  const [notisData, setNotisData] = useState([]);
  
  const toast = useToast();
  const {user, refreshUser, updateUser} = useUser();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      getGreeting();
      await getDailyPhoto();
    });

    fetchEntryData();

    return unsubscribe;
  }, []);

  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      console.log(location);
    };
    requestLocationPermission();
  }, []);

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

  const getDailyPhoto = async () => {
    const storedPhotos = await getItem(STORAGE_KEYS.DAILY_PHOTOS);

    const parsedPhotos = storedPhotos ? JSON.parse(storedPhotos) : [];

    if (parsedPhotos.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const todayPhoto = parsedPhotos?.find(photo => photo.date === today)?.uri || false;

      setTodayPhoto(todayPhoto);
    }
  };

  const fetchEntryData = async () => {
    const response = await tokenRefreshWrapper('getData', {}, toast, user, refreshUser);

    if (response.success) {

      console.log("Response:", response.news);
      console.log("Response:", response.reminders);

      setNotisData(response.news);

      updateUser({
        ...user,
        reminders: response.reminders,
      });
    } else {
      toast.show('Error en obtener datos', {type: 'danger'});
    }
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
          data={[{title: 'Recordatorio 1', date: '2023-10-01', name: "Luna", notiType: "pill"}, {title: 'Recordatorio 2', date: '2023-10-02', name: "Luna", notiType: "date"}, {title: 'Recordatorio 1', date: '2023-10-01', name: "Luna", notiType: "vaccine"}]}
          type="reminders"
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
          data={notisData}
          type="news"
        />
      </ScrollView>
      <PictureModal isVisible={isTakingDailyPicture} setIsVisible={setIsTakingDailyPicture}/>
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