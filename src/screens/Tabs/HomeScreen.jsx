import React, { useEffect, useState } from 'react'
import { Image, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import LatoText from '../../components/Fonts/LatoText'
import ModularCard from '../../components/UI/ModularCard'
import { MaterialIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { firebase } from '@react-native-firebase/messaging'
import { useUser } from '../../context/UserContext'

const HomeScreen = () => {

  const {user} = useUser();
  const [greeting, setGreeting] = useState('Buenos días');

  useEffect(() => {
    const date = new Date();
    const hours = date.getHours();

    if (hours < 13) {
      setGreeting('Buenos días');
    } else if (hours < 20) {
      setGreeting('Buenas tardes');
    } else {
      setGreeting('Buenas noches');
    }
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

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView showsVerticalScrollIndicator={false} style={{marginBottom: 50}}>
        <View style={styles.headerContainer}>
          <LatoText style={styles.greeting}>{greeting}, <LatoText style={styles.name}>{user?.name}</LatoText></LatoText>
          <View style={styles.profileSettingsContainer}>
            <Image source={{uri: 'https://dynamoprojects.com/wp-content/uploads/2022/12/no-image.jpg'}} style={styles.profileImage} />
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
          data={false}
          type="picture"
        />
        <ModularCard 
          title="Novedades"
          icon={<MaterialIcons name="inbox" size={25} color="#191717" />}
          data={[{title: 'Se han añadido nuevas razas de mascotas para seleccionar.', iconName: "email-newsletter", userViewed: false}, {title: 'Evento de adopción este fin de semana', iconName: "calendar-clock", userViewed: true}]}
          type="news"
        />
      </ScrollView>
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
  profileSettingsContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 25,
  },
});

export default HomeScreen;