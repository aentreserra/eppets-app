import { View, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import LatoText from '../../components/Fonts/LatoText';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import BoxItem from '../../components/UI/BoxItem';
import { getItem, storeItem } from '../../utils/storage';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { speciesOptions } from '../../constants/globals';
import { calculateAge, formattedDateDayMonthYear, getBreedName, getWeightUnit, getWeigthScore } from '../../utils/shared';
import BreedData from '../../lib/breedsData.json';
import { useToast } from 'react-native-toast-notifications';
import Modal from 'react-native-modal';
import DateTimePicker, {useDefaultStyles} from 'react-native-ui-datepicker';
import { tokenRefreshWrapper } from '../../services/tokenRefreshWrapper';
import { useUser } from '../../context/UserContext';
import AddReminder from '../../components/Modals/AddReminder';

const ManagePetScreen = ({route, navigation}) => {

  const { petId } = route.params || {};

  const [petTab, setPetTab] = useState(0);
  const [petData, setPetData] = useState(null);

  const [newWeight, setNewWeight] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [isLoading, setIsLoading] = useState(false);

  const [isShowAddReminder, setIsShowAddReminder] = useState(false);
  const [isWeightModalVisible, setIsWeightModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const {user, refreshUser} = useUser();
  const defaultDatePickerStyles = useDefaultStyles('light');
  const toast = useToast(); 

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getStoredPetData();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    console.log('Pet Tab: ', petTab);
  }, [petTab]);

  const getStoredPetData = async () => {
    setIsLoading(true);
    try {
      const data = await getItem(STORAGE_KEYS.PETS_PROFILE);
      if (data) {
        const parsedData = JSON.parse(data);
        const pet = parsedData.find(p => parseInt(p.id) === parseInt(petId));
        console.log("Pet data:", pet);
        if (pet) {
          setPetData(pet);
        } else {
          console.log("Pet not found");
        }
      }
    } catch (error) {
      console.error("Error fetching pet data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeWeight = async () => {
    if (newWeight === null || newWeight === "") {
      toast.show('Por favor, introduce un peso válido', { type: 'danger' });
      return;
    }
  
    const response = await tokenRefreshWrapper('updatePetWeight', {petId: petData.id, newWeight}, toast, user, refreshUser);

    if (response.success) {
      setIsWeightModalVisible(false);
      setNewWeight(null);
      setSelectedDate(new Date());

      setPetData(prevState => ({
        ...prevState,
        weight: newWeight,
      }));

      const storedPets = await getItem(STORAGE_KEYS.PETS_PROFILE);

      if (storedPets) {
        const parsedPets = JSON.parse(storedPets);
        const updatedPetIndex = parsedPets.findIndex(p => p.id === petData.id);
        if (updatedPetIndex !== -1) {
          parsedPets[updatedPetIndex].weight = newWeight;
          await storeItem(STORAGE_KEYS.PETS_PROFILE, JSON.stringify(parsedPets));
        }
      } else {
        console.log("No pets found in storage");
      }

      toast.show('Peso actualizado correctamente', { type: 'success' });
    }
  };

  return (
    <SafeAreaView style={styles.page}>
      <AddReminder isVisible={isShowAddReminder} setIsVisible={setIsShowAddReminder} defaultPet={petData} />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#191717" onPress={() => navigation.goBack()} />
            <View style={styles.headerRow}>
              <TouchableOpacity activeOpacity={0.8} style={styles.roundedItem} onPress={() => setIsWeightModalVisible(true)}>
                <MaterialCommunityIcons name="weight" size={24} color="#EF9B93" />
                <MaterialCommunityIcons name="plus" size={20} color="#EF9B93" style={styles.absolutPlus} />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.8} style={styles.roundedItem} onPress={() => setIsShowAddReminder(true)}>
                <MaterialIcons name="add" size={24} color="#EF9B93" />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.8} style={styles.roundedItem} onPress={() => navigation.navigate("AddPet", {pet: petData})}>
                <MaterialIcons name="edit" size={24} color="#EF9B93" />
              </TouchableOpacity>
            </View>
        </View>
        {!isLoading && petData !== null &&
        <>
          <View style={styles.petData}>
              <View style={styles.petDataImageContainer}>
                <View style={styles.petDataWeigthBarMask}>
                  <View style={[styles.petDataWeigthBar, {height: 
                    `${getWeigthScore(petData.species, petData.breed, petData.weight).score}%`,
                    backgroundColor: getWeigthScore(petData.species, petData.breed, petData.weight).color}]} />
                </View>
                <View style={styles.petDataImage}>
                  {petData.image_url && <Image source={{uri: petData.image_url}} style={styles.petImage} />}
                  {petData.image_url === null && 
                  <View style={styles.noPetImage}>
                    <MaterialCommunityIcons name={speciesOptions.filter((item) => item.value === petData.species)[0].icon} size={70} color="#FFF" />
                  </View>
                  }
                </View>
                <View style={styles.petDataWeigthContainer}>
                  <View style={styles.petDataWeigthBox}>
                    <LatoText style={styles.petDataWeigthTitle}>{petData.weight || "-"} {getWeightUnit(petData.species, petData.breed)}</LatoText>
                  </View>
                </View>
              </View>
              <LatoText style={styles.title}>{petData.name}</LatoText>
              <View style={styles.petDataDescContainer}>
                <LatoText style={styles.petDataDescMain}>{speciesOptions.filter(item => item.value === petData.species)[0].label || "-"}</LatoText>
                <LatoText style={styles.petDataDesc}>· {getBreedName(petData.species, petData.breed) || "-"}</LatoText>
              </View>
              <LatoText style={styles.petDataAge}>{calculateAge(petData.born_date) || "-"} {calculateAge(petData.born_date) === 1 ? "año" : "años"}</LatoText>
            </View>
            <View style={styles.petMenu}>
              <TouchableOpacity activeOpacity={0.8} style={styles.petMenuItem} onPress={() => setPetTab(0)}>
                <LatoText style={[styles.petMenuItemText, {color: petTab === 0 ? "#458AC3" : "#242222"}]}>Historial</LatoText>
                {petTab === 0 && <View style={styles.petMenuItemSelected} />}
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.8} style={styles.petMenuItem} onPress={() => setPetTab(1)}>
                <LatoText style={[styles.petMenuItemText, {color: petTab === 1 ? "#458AC3" : "#242222"}]}>Recordatorios</LatoText>
                {petTab === 1 && <View style={styles.petMenuItemSelected} />}
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.8} style={styles.petMenuItem} onPress={() => setPetTab(2)}>
                <LatoText style={[styles.petMenuItemText, {color: petTab === 2 ? "#458AC3" : "#242222"}]}>Parámetros</LatoText>
                {petTab === 2 && <View style={styles.petMenuItemSelected} />}
              </TouchableOpacity>
            </View>
            <View style={styles.petDataItemsContainer}>
              {
                petTab === 0 ? (
                  <>
                    <BoxItem 
                      
                    />
                    <BoxItem />
                    <BoxItem />
                    <BoxItem />
                    <BoxItem />
                  </>
                ) : petTab === 1 ? (
                  <LatoText style={{fontSize: 16, color: '#242222'}}>Recordatorios</LatoText>
                ) : (
                  <LatoText style={{fontSize: 16, color: '#242222'}}>Parámetros</LatoText>
                )
              }
            </View>
          </>
        }
      </ScrollView>
      {!isLoading && petData !== null && 
        <Modal
          isVisible={isWeightModalVisible}
          onBackdropPress={() => setIsWeightModalVisible(false)}
          animationIn="slideInUp"
          animationOut="slideOutDown"
        >
          <View style={styles.modalContainer}>
            <LatoText style={styles.modalTitle}>Actualiza el peso</LatoText>
            <LatoText style={styles.modalSubtitle}>Actualiza el peso de tu mascota para mantener un registro constante y actualizaciones de estado</LatoText>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons name="weight" size={24} color="#242222" />
              <TextInput
                value={newWeight}
                onChangeText={text => setNewWeight(text)}
                placeholder='Peso...'
                keyboardType='numeric'
                autoCapitalize='none'
                style={styles.input}
              />
              <LatoText style={styles.absoluteWeight}>{getWeightUnit(petData.species, petData.breed)}</LatoText>
            </View>
            <TouchableOpacity activeOpacity={0.8} style={styles.inputContainer} onPress={() => setShowDatePicker(true)}>
              <MaterialCommunityIcons name="calendar" size={24} color="#242222" />
              <LatoText numberOfLines={1} style={styles.input}>Día: {formattedDateDayMonthYear(new Date(selectedDate))}</LatoText>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} style={styles.submitButton} onPress={() => handleChangeWeight()}>
              <LatoText style={styles.submitButtonText}>Actualizar</LatoText>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} onPress={() => setIsWeightModalVisible(false)}>
              <LatoText style={styles.closeText}>Cerrar</LatoText>
            </TouchableOpacity>
          </View>
        </Modal>
      }
      <Modal
        isVisible={showDatePicker}
        onBackdropPress={() => setShowDatePicker(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={styles.modalContainer}>
          <DateTimePicker
            mode={'single'}
            locale='es-ES'
            date={new Date(selectedDate)}
            startDate={new Date()}
            onChange={({date}) => [setSelectedDate(date), setShowDatePicker(false)]}
            firstDayOfWeek={1}
            styles={{
              ...defaultDatePickerStyles,
              day_label: {color: '#191717', fontFamily: 'Lato-Regular'},
              today: {borderColor: '#458AC3', borderWidth: 1, borderRadius: 15, aspectRatio: 1},
              selected: {backgroundColor: '#458AC3', borderRadius: 15, aspectRatio: 1},
              selected_label: {color: '#FFF', fontFamily: 'Lato-Regular'},
              outside_label: {color: '#55515150', fontFamily: 'Lato-Regular'},
            }}
          />
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#EEEAE8',
    padding: 13,
  },
  scrollView: {
    width: '100%',
  },
  modalContainer: {
    backgroundColor: '#EEEAE8',
    borderRadius: 10,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roundedItem: {
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
  },
  absolutPlus: {
    position: 'absolute',
    top: -2,
    right: -2,
    borderRadius: 20,
    backgroundColor: '#F6F6F6',
  },
  petData: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  petDataImageContainer: {
    width: 152,
    height: 152,
    borderRadius: 99,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
  },
  petDataWeigthBarMask: {
    width: '100%',
    height: '100%',
    borderRadius: 99,
    overflow: 'hidden',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petDataWeigthBar: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  petImage: {
    width: 145,
    height: 145,
    borderRadius: 99,
  },
  noPetImage: {
    width: 145,
    height: 145,
    borderRadius: 99,
    backgroundColor: '#EF9B93',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petDataWeigthContainer: {
    position: 'absolute',
    bottom: -5,
    left: 0,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petDataWeigthBox: {
    backgroundColor: '#EF9B93',
    borderRadius: 5,
    padding: 5,
    paddingHorizontal: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petDataWeigthTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#F6F6F6',
  },
  title: {
    marginTop: 5,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#191717',
  },
  petDataDescContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  petDataDescMain: {
    fontSize: 14,
    color: '#242222',
  },
  petDataDesc: {
    fontSize: 14,
    color: '#555151',
  },
  petDataAge: {
    fontSize: 24,
    color: '#EF9B93',
    fontWeight: 'bold',
  },
  petMenu: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  petMenuItemText: {
    fontSize: 16,
  },
  petMenuItemSelected: {
    width: '100%',
    height: 3,
    backgroundColor: '#458AC3',
    borderRadius: 99,
    position: 'absolute',
    bottom: -5,
  },
  petDataItemsContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 5,
  },
  inputContainer: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderWidth: 1,
    borderColor: 'transparent',
    padding: 15,
    paddingVertical: 10,
    gap: 10,
    borderRadius: 99,
    elevation: 2,
    shadowColor: '#00000080',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 10,
  },
  input: {
    width: '90%',
    fontFamily: 'Lato-Regular',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#191717',
  },
  modalSubtitle: {
    fontSize: 14,
    marginTop: -5,
    color: '#555050',
    textAlign: 'center',
  },
  submitButton: {
    alignItems: 'center',
    padding: 25,
    paddingVertical: 12,
    borderRadius: 99,
    backgroundColor: '#458AC3',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontFamily: 'Lato-Bold',
  },
  closeText: {
    fontSize: 15,
    color: '#555151',
    marginTop: -5,
  },
  absoluteWeight: {
    position: 'absolute',
    right: 20,
    top: 10,
    fontSize: 14,
    color: '#242222',
  },
});

export default ManagePetScreen;