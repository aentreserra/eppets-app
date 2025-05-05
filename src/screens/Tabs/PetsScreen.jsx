import { View, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import LatoText from '../../components/Fonts/LatoText';
import { getItem, storeItem } from '../../utils/storage';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { tokenRefreshWrapper } from '../../services/tokenRefreshWrapper';
import { useUser } from '../../context/UserContext';
import { useToast } from 'react-native-toast-notifications';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { speciesOptions } from '../../constants/globals';
import { RefreshControl } from 'react-native-gesture-handler';
import {calculateAge, getBreedName} from '../../utils/shared';
import BreedData from '../../lib/breedsData.json';
import Modal from 'react-native-modal';

const PetsScreen = ({navigation}) => {

  const {user, refreshUser} = useUser();
  const toast = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [firstFetch, setFirstFetch] = useState(true);

  const [pets, setPets] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchLocalPets();
    });

    return unsubscribe;
  }, []);

  const fetchLocalPets = async () => {
    setIsLoading(true);
    try {
      const data = await getItem(STORAGE_KEYS.PETS_PROFILE);
      if (data) {
        const parsedData = JSON.parse(data);
        setPets(parsedData);
      } else {
        setPets([]);
        if (firstFetch) {
          setFirstFetch(false);
          fetchPets();
        }
      }
    } catch (error) {
      console.error("Error fetching pets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPets = async () => {
    setIsRefreshing(true);
    try {
      const response = await tokenRefreshWrapper('getPetsFromUser', {}, toast, user, refreshUser);
      if (response.success) {
        const petsData = response.pets;
        setPets(petsData);
        await storeItem(STORAGE_KEYS.PETS_PROFILE, JSON.stringify(petsData));
      } else {
        console.log("Error fetching pets:", response.message);
        toast.show('Error al obtener mascotas', {type: 'danger'});
        setPets([]);
      }
    } catch (error) {
      toast.show('Error inesperado', {type: 'danger'});
      console.error("Error fetching pets try:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLongPress = (id) => {
    setIsModalVisible(true);
  }

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.scrollView} 
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={fetchPets} 
            colors={['#EF9B93']} 
            progressBackgroundColor="#FFF" 
            tintColor="#FFF"
          />
        }
      >
        <View style={styles.headerContainer}>
          <LatoText style={styles.title}>Mascotas</LatoText>
        </View>
        {(!isLoading && pets.length === 0) ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <LatoText style={{ fontSize: 18, color: '#191717' }}>No tienes mascotas registradas</LatoText>
            </View>
          ) : (
            <>
            {pets.map((pet) => (
              <PetItem 
                key={pet.id}
                id={pet.id}
                name={pet.name}
                type={pet.species}
                breed={pet.breed}
                age={calculateAge(pet.born_date)}
                image={pet.image_url}
                navigation={navigation}
                handleLongPress={handleLongPress}
              />
            ))}
            </>
          )
        }
        <TouchableOpacity activeOpacity={0.8} style={styles.addPetContainer} onPress={() => navigation.navigate('AddPet', {pet: null})}>
          <LatoText style={styles.addPetPlus}>+</LatoText>
        </TouchableOpacity>
      </ScrollView>
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setIsModalVisible(false)}
        onBackButtonPress={() => setIsModalVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={styles.modalContainerBox}>
          <LatoText style={styles.modalTitle}>¿Quieres eliminar esta mascota?</LatoText>
          <LatoText style={styles.modalDesc}>Esta acción no se puede deshacer</LatoText>
          <View style={styles.modalButtonsContainer}>
            <TouchableOpacity style={styles.modalButton} onPress={() => {}}>
              <LatoText style={styles.modalButtonText}>Eliminar</LatoText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <LatoText style={styles.modalCloseText}>Cancelar</LatoText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
};

const PetItem = ({ name, type, breed, age, image, id, navigation, handleLongPress }) => {
  return (
    <TouchableOpacity activeOpacity={0.8} style={styles.petContainer} onLongPress={() => handleLongPress(id)} onPress={() => navigation.navigate('ManagePet', { petId: id })}>
      <View style={styles.imageContainer}>
        {image !== null && <Image source={{uri: image}} style={styles.image} />}
        {image === null && (
          <View style={styles.imagePlaceholder}>
            <MaterialCommunityIcons name={speciesOptions.filter((item) => item.value === type)[0].icon} size={40} color="#FFF" />
          </View>
        )}
      </View>
      <View>
        <LatoText style={styles.itemName}>{name}</LatoText>
        <LatoText style={styles.itemDesc}>{speciesOptions.filter(item => item.value === type)[0].label} - {getBreedName(type, breed)}</LatoText>
        <LatoText style={styles.itemDesc}>Edad: {age} años</LatoText>
      </View>
    </TouchableOpacity>
  )
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#EEEAE8',
    padding: 13,
  },
  scrollView: {
    width: '100%',
    paddingBottom: 50,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#191717',
  },
  petContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#00000050',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 15,
    overflow: 'hidden',
    marginRight: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#EF9B93',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPetContainer: {
    backgroundColor: '#EF9B9350',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPetTitle: {
    fontSize: 15,
    color: '#191717',
  },
  addPetPlus: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFF',
  },
  itemName: {
    fontSize: 18,
    color: '#191717',
    fontWeight: 'bold',
  },
  itemDesc: {
    fontSize: 16,
    color: '#555151',
  },
  modalContainerBox: {
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#191717',
    marginBottom: 10,
  },
  modalDesc: {
    fontSize: 16,
    color: '#555151',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtonsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  modalButton: {
    backgroundColor: '#EF9B93',
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    color: '#FFF',
  },
  modalCloseText: {
    fontSize: 15,
    color: '#555151',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default PetsScreen;