import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import Modal from 'react-native-modal';
import * as ImagePicker from 'expo-image-picker';
import { useToast } from 'react-native-toast-notifications';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import * as FileSystem from 'expo-file-system';
import { PHOTOS_DIR } from '../../constants/globals';
import { getItem, storeItem } from '../../utils/storage';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import LatoText from '../Fonts/LatoText';

const PictureModal = ({isVisible, setIsVisible, dailyPhotoDone, onPhotoDone}) => {

  const [isLoading, setIsLoading] = useState(false);

  const toast = useToast();

  const getImageFromGallery = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (!cameraPermission.granted) {
      toast.show('Necesitas otorgar permisos de galeria', {type: 'danger'});
      return null;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
      mediaTypes: ['images'],
    });

    if (result.canceled) {
      return null;
    }

    if (result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    } else {
      return null;
    }
  };

  const takePhoto = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (!cameraPermission.granted) {
      toast.show('Necesitas otorgar permisos de camara', {type: 'danger'});
      return null;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
      mediaTypes: ['images'],
    });

    if (result.canceled) {
      return null;
    }

    if (result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    } else {
      return null;
    }
  };

  const savePhoto = async (tempPhotoUri) => {
    const fileExists = await FileSystem.getInfoAsync(PHOTOS_DIR);
    if (!fileExists.exists) {
      await FileSystem.makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
    }

    const fileName = `${uuidv4()}.jpg`;
    const destUri = `${PHOTOS_DIR}/${fileName}`;

    try {
      await FileSystem.moveAsync({
        from: tempPhotoUri,
        to: destUri,
      });

      return destUri;
    } catch (error) {
      console.error('Error saving photo:', error);
      toast.show('Error al guardar la foto', {type: 'danger'});
      return null;
    }
  };

  const savePhotoMetadata = async (photoUri) => {
    try {
      const savedData = await getItem(STORAGE_KEYS.DAILY_PHOTOS);
      const parsedData = savedData ? JSON.parse(savedData) : [];

      const newPhotoMetadata = {
        id: photoUri,
        uri: photoUri,
        date: new Date().toISOString(),
      };

      const updatedPhotos = [...parsedData, newPhotoMetadata];

      await storeItem(STORAGE_KEYS.DAILY_PHOTOS, JSON.stringify(updatedPhotos));

      return newPhotoMetadata;
    } catch (error) {
      console.error('Error fetching daily photos:', error);
      return null;
    }
  };

  const handleStartProcess = async (selection) => {
    if (dailyPhotoDone) {
      toast.show('Ya has tomado la foto de hoy', {type: 'danger'});
      setIsVisible(false);
      return;
    }
    const tempUri = selection === "camera" ? await takePhoto() : await getImageFromGallery();
    if (!tempUri) return;

    
    try {
      setIsLoading(true);
      
      const photoUri = await savePhoto(tempUri);
      if (photoUri) {
        await savePhotoMetadata(photoUri);
        toast.show('Foto guardada correctamente', {type: 'success'});
        
        if (onPhotoDone) onPhotoDone();
        
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      toast.show('Error al tomar la foto', {type: 'danger'});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal 
      isVisible={isVisible}
      onBackdropPress={() => setIsVisible(false)}
      onBackButtonPress={() => setIsVisible(false)}
      animationIn='fadeInUp'
      animationOut='fadeOutDown'
      style={styles.modal}
      backdropTransitionOutTiming={0}
      useNativeDriverForBackdrop
    >
      <View style={styles.modalContent}>
        {isLoading && (<LatoText style={styles.loadingText}>Guardando foto...</LatoText>)}
        {!isLoading && (
          <>
            <LatoText style={styles.title}>Foto Diaria</LatoText>
            <LatoText style={styles.subtitle}>Añade la foto de hoy</LatoText>

            <TouchableOpacity activeOpacity={0.8} style={styles.btn} onPress={() => handleStartProcess("camera")}>
              <LatoText style={styles.btnText}>Tomar Foto Ahora</LatoText>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} style={styles.btn} onPress={() => handleStartProcess("gallery")}>
              <LatoText style={styles.btnText}>Elegir de la Galería</LatoText>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} onPress={() => setIsVisible(false)}>
              <LatoText style={styles.cancelText}>Cancelar</LatoText>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: '#EEEAE8',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center',
    height: '40%'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#191717',
  },
  subtitle: {
    fontSize: 16,
    color: '#242222',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#242222',
    marginBottom: 20,
  },
  btn: {
    width: '90%',
    alignItems: 'center',
    padding: 10,
    paddingVertical: 15,
    borderRadius: 99,
    marginTop: 10,
    backgroundColor: '#EF9B93',
  },
  btnText: {
    fontSize: 16,
    color: '#FFF',
  },
  cancelText: {
    fontSize: 16,
    color: '#458AC3',
    marginTop: 20,
  },
});

export default PictureModal;