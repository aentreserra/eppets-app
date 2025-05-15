import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import Modal from 'react-native-modal';
import LatoText from '../Fonts/LatoText';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { getItem } from '../../utils/storage';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { speciesOptions } from '../../constants/globals';
import { getBreedName } from '../../utils/shared';
import { useNavigation } from '@react-navigation/native';

const NotificationsModal = ({data, isVisible, onClose}) => {

  const [petInfo, setPetInfo] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    getPetData();
  }, [data]);

  const getPetData = async () => {
    const petData = await getItem(STORAGE_KEYS.PETS_PROFILE);

    if (petData && data.data.petId) {
      const parsedPetData = JSON.parse(petData) || [];

      const exactPet = parsedPetData.filter(item => item.id == parseInt(data.data.petId));

      if (exactPet) {
        setPetInfo(exactPet[0]);
      }
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropTransitionOutTiming={0}
      useNativeDriverForBackdrop
    >
      <View style={styles.modalContainer}>
        <MaterialIcons name="notifications-active" size={45} color="#242222" />
        <LatoText style={styles.title}>{data !== null ? data.title : "Notificación"}</LatoText>
        {(data !== null && data.body !== null) && <LatoText style={styles.message}>{ data.body}</LatoText>}
        {petInfo && (
          <TouchableOpacity activeOpacity={0.8} onPress={() => [navigation.navigate("ManagePet", {petId: petInfo.id}), onClose(false)]} style={styles.petItem}>
            <View style={styles.iconBox}>
              {petInfo.image_url ? (
                <Image source={{uri: petInfo.image_url}} style={styles.image} />
              ) : (
                <MaterialCommunityIcons name={speciesOptions.filter((item) => item.value === petInfo.species)[0].icon} size={30} color="white" />
              )}
            </View>
            <View>
              <LatoText style={styles.itemPetName}>{petInfo.name}</LatoText>
              <LatoText style={styles.itemPetDesc}>{speciesOptions.filter(item => item.value === petInfo.species)[0].label} - {getBreedName(petInfo.species, petInfo.breed)}</LatoText>
            </View>
          </TouchableOpacity>
        )}
        <View style={styles.btnsContainer}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => onClose(true)} style={styles.mainBtn}>
            <LatoText style={styles.btnText}>Recordar Después</LatoText>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} onPress={() => onClose(false)} style={styles.closeBtn}>
            <LatoText style={styles.btnText}>Cerrar</LatoText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#EEEAE8',
    borderRadius: 10,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  petItem: {
    width: '100%',
    padding: 10,
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    shadowColor: "#00000070",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 3,
    elevation: 2,
    borderRadius: 10,
  },
  iconBox: {
    width: 40,
    height: 40,
    overflow: 'hidden',
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EF9B93',
  },
  image: {
    width: '100%',
    height: '100%'
  },
  itemPetName: {
    fontSize: 15,
    color: "#191717",
  },
  itemPetDesc: {
    fontSize: 13,
    color: "#555151"
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: "#242222"
  },
  message: {
    fontSize: 16,
    color: '#555151',
  },
  btnsContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
  },
  mainBtn: {
    padding: 15,
    paddingHorizontal: 20,
    backgroundColor: '#458AC3',
    borderRadius: 99
  },
  closeBtn: {
    padding: 15,
    paddingHorizontal: 20,
    backgroundColor: '#EF9B93',
    borderRadius: 99
  },
  btnText: {
    color: '#FFF',
    fontSize: 17
  }
});

export default NotificationsModal;