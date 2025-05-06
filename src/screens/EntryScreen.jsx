import { View, StyleSheet, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SECURE_STORAGE_KEYS, STORAGE_KEYS } from '../constants/storageKeys';
import { getItem, getSecureItem, storeItem } from '../utils/storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../context/UserContext';
import { useToast } from 'react-native-toast-notifications';
import { isTokenExpired } from '../utils/shared';
import LatoText from '../components/Fonts/LatoText';
import * as FileSystem from 'expo-file-system';
import { PHOTOS_DIR } from '../constants/globals';

const EntryScreen = ({navigation}) => {

  const { loading, user } = useUser();
  const [progress, setProgress] = useState(0);
  const toast = useToast();

  /**
   * Función para simular el efecto de carga de la pantalla de entrada
   */
  useEffect(() => {
    let interval;
    
    if (loading) {
      interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 1, 90));
      }, 50);
    } else {
      setProgress(100);
    }

    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    let isMounted = true;
    let timeoutId;

    const checkAuth = async () => {
      try {
        if (loading) return;

        await new Promise(resolve => timeoutId = setTimeout(resolve, 500));

        const JWT = await getSecureItem(SECURE_STORAGE_KEYS.REFRESH_TOKEN);

        if (!isMounted) return;

        const isFirstLaunch = await getItem(STORAGE_KEYS.FIRST_TIME_WELCOME);
  
        if (isFirstLaunch === null) {
          // Crear el directorio para las imagenes diarias
          const dirInfo = await FileSystem.getInfoAsync(PHOTOS_DIR);
          if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
          }

          // Guardar los datos de configucaión inicial
          const defaultSettings = {

          };

          await storeItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(defaultSettings));

          // Navegar a la pantalla de bienvenida
          navigation.replace('Welcome');
        } else if (!JWT || user == null || !user?.accessToken || isTokenExpired(user?.accessToken)) {
          navigation.replace('Login', {});
        } else {
          navigation.replace('MainTabs');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        toast.show('Error checking auth', { type: 'danger' });
        navigation.replace('Login', {});
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    }
  }, [loading, user?.accessToken]);

  return (
    <SafeAreaView style={styles.page}>
      <LatoText style={styles.title}>EPPETS</LatoText>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
      <LatoText style={styles.text}>Cargando {progress}%</LatoText>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#458AC3',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
  },
  progressBarContainer: {
    height: 10,
    width: '80%',
    backgroundColor: '#F6F6F6',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 15
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#EFD7BF',
    borderRadius: 5,
  },
  text: {
    fontSize: 16,
    color: '#FFF'
  }
});

export default EntryScreen;