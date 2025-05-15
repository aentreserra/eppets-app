import { View, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, RefreshControl } from 'react-native'
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
import ReminderItem from '../../components/UI/ReminderItem';
import ReminderModal from '../../components/Modals/ReminderModal';
import loadingGif from '../../gifs/loading.gif';
import { useLevelUpModal } from '../../context/LevelUpModalContext';
import RemoveReminderModal from '../../components/Modals/RemoveReminderModal';
import AddHistoryModal from '../../components/Modals/AddHistoryModal';
import MedicalRecordsInfoModal from '../../components/Modals/MedicalRecordsInfoModal';

const ManagePetScreen = ({route, navigation}) => {

  const { petId } = route.params || {};

  const [petTab, setPetTab] = useState(0);

  const [petData, setPetData] = useState(null);
  const [petHistory, setPetHistory] = useState([]);
  const [petReminders, setPetReminders] = useState([]);
  const [petParameters, setPetParameters] = useState([]);

  const [newWeight, setNewWeight] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const [isShowHistoryModal, setIsShowHistoryModal] = useState(false);
  const [isShowMedicalRecordsInfo, setIsShowMedicalRecordsInfo] = useState(false);
  const [isShowAddReminder, setIsShowAddReminder] = useState(false);
  const [isShowReminderInfo, setIsShowReminderInfo] = useState(false);
  const [isRemoveReminderModalVisible, setIsRemoveReminderModalVisible] = useState(false);
  const [isWeightModalVisible, setIsWeightModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reminderToShow, setReminderToShow] = useState(null);
  const [medicalRecordToShow, setMedicalRecordToShow] = useState(null);

  const {user, refreshUser, updateUser} = useUser();
  const {showLevelUpModal} = useLevelUpModal();
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

  /**
   * Función para obtener los datos de la mascota almacenados
   */
  const getStoredPetData = async () => {
    setIsLoading(true);
    try {
      const data = await getItem(STORAGE_KEYS.PETS_PROFILE);
      const medicalRecords = await getItem(STORAGE_KEYS.MEDICAL_RECORDS);
      if (data) {
        const parsedData = JSON.parse(data) || [];
        const parsedRecords = JSON.parse(medicalRecords) || [];

        const pet = parsedData.find(p => parseInt(p.id) === parseInt(petId));
        const petHistory = parsedRecords.filter(item => parseInt(item.pet_id) === parseInt(petId));
        const reminders = user.reminders.filter(item => parseInt(item.pet_id) === parseInt(petId));

        if (pet) {
          const breedData = BreedData[pet.species].find(item => item.value === pet.breed) || null;
          setPetParameters(breedData?.parameters || null);
          setPetData(pet);
        } else {
          console.log("Pet not found");
        }

        if (reminders) {
          setPetReminders(reminders);
        }

        if (petHistory) {
          setPetHistory(petHistory);
        }
      }
    } catch (error) {
      console.error("Error fetching pet data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Función para manejar el cambio de peso de la mascota
   */
  const handleChangeWeight = async () => {
    if (newWeight === null || newWeight === "") {
      toast.show('Por favor, introduce un peso válido', { type: 'danger' });
      return;
    }

    setIsDataLoading(true);

    const formattedData = {
      petId: petData.id,
      newWeight,
      date: selectedDate.toDateString(),
    };

    console.log("Formatted Data: ", formattedData);

    try {
      const response = await tokenRefreshWrapper('updatePetWeight', formattedData, toast, user, refreshUser, updateUser, showLevelUpModal);

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
    } catch (error) {
      console.error("Error updating pet weight:", error);
    } finally {
      setIsDataLoading(false);
    }
  };

  /**
   * Función para manejar el cierre de los modales
   */
  const handleCloseModal = async () => {
    setIsRemoveReminderModalVisible(false);
    setIsShowHistoryModal(false);
    setIsShowAddReminder(false);
    setIsShowReminderInfo(false);
    setIsWeightModalVisible(false);
    setIsShowMedicalRecordsInfo(false);
    await getStoredPetData();
  };

  /**
   * Función para mostrar el modal de selección de fecha
   */
  const fetchPetData = async () => {
    setIsRefreshing(true);
    try {
      const response = await tokenRefreshWrapper('getPetProfile', { petId }, toast, user, refreshUser, updateUser, showLevelUpModal);

      if (response.success) {
        const petData = response.petProfile;
        const medicalRecords = response.medicalRecords;
        setPetData(petData);
        setPetHistory(medicalRecords);

        try {
          const storedPets = await getItem(STORAGE_KEYS.PETS_PROFILE);
          const parsedPets = JSON.parse(storedPets) || [];
          let tempPets = parsedPets.filter(p => p.id !== petId);
          tempPets.push(petData);
          await storeItem(STORAGE_KEYS.PETS_PROFILE, JSON.stringify(tempPets));

          const storedMedicalRecords = await getItem(STORAGE_KEYS.MEDICAL_RECORDS);
          const parsedRecords = JSON.parse(storedMedicalRecords) || [];
          let tempRecords = parsedRecords.filter(p => p.pet_id !== petId);
          tempRecords.push(...medicalRecords);
          await storeItem(STORAGE_KEYS.MEDICAL_RECORDS, JSON.stringify(tempRecords));
        } catch (error) {
          console.error("Error updating saved data:", error);
        }
      }
    } catch (error) {
      console.error("Error fetching pet data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.page}>
      {petTab === 0 && (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.fab}
          onPress={() => setIsShowHistoryModal(true)}
        >
          <LatoText style={styles.fabText}>Añadir historial</LatoText>
          <MaterialIcons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      )}
      {petTab === 1 && (
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.fab}
          onPress={() => setIsShowAddReminder(true)}
        >
          <LatoText style={styles.fabText}>Añadir recordatorio</LatoText>
          <MaterialIcons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      )}
      <AddHistoryModal isVisible={isShowHistoryModal} onClose={handleCloseModal} defaultPet={petData}/>
      <MedicalRecordsInfoModal isVisible={isShowMedicalRecordsInfo} item={medicalRecordToShow} onClose={handleCloseModal} />
      <AddReminder isVisible={isShowAddReminder} setIsVisible={setIsShowAddReminder} defaultPet={petData} />
      <ReminderModal isVisible={isShowReminderInfo} setIsVisible={setIsShowReminderInfo} data={reminderToShow}/>
      <RemoveReminderModal isVisible={isRemoveReminderModalVisible} data={reminderToShow} onClose={handleCloseModal}/>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={fetchPetData} />
        }
      >
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
                  {
                    petHistory.length > 0 ? petHistory.map((item) => (
                      <BoxItem key={item.id} item={item} onPress={() => [setIsShowMedicalRecordsInfo(true), setMedicalRecordToShow(item)]}/>
                    )) : (
                      <View>
                        <LatoText style={styles.noDataText}>No tienes historial para {petData.name}</LatoText>
                        <TouchableOpacity activeOpacity={0.8} onPress={() => setIsShowHistoryModal(true)}>
                          <LatoText style={styles.clickableText}>Añadir nuevo historial</LatoText>
                        </TouchableOpacity>
                      </View>
                    )
                  }
                  </>
                ) : petTab === 1 ? (
                  <>
                    {
                      petReminders.length > 0 ? petReminders.map((item) => (
                        <ReminderItem key={item.id} item={item} isManagePet={true} onClick={() => [setIsShowReminderInfo(true), setReminderToShow(item)]} onLongPress={() => [setIsRemoveReminderModalVisible(true), setReminderToShow(item)]}/>
                      )) : (
                        <LatoText style={styles.noDataText}>No tienes recordatorios para {petData.name}</LatoText>
                      )
                    }
                  </>
                ) : (
                  <>
                   {petParameters !== null ? (
                       petData.species === 'primate' && petParameters.add_pet_alert ? (
                        <View style={[styles.paramsContainer, styles.primateWarningContainer]}>
                          <View style={styles.primateWarningIconContainer}>
                            <MaterialCommunityIcons name="alert-octagon-outline" size={48} color="#E65100" />
                            <LatoText style={styles.primateWarningTitle}>{petParameters.name || "Advertencia sobre Primates"}</LatoText>
                          </View>
                          {Object.entries(petParameters).map(([key, value]) => {
                            const MAPPED_KEYS = {
                                add_pet_alert: "Alerta Importante",
                                ethical_considerations: "Consideraciones Éticas",
                                legal_status_warning: "Estado Legal",
                                safety_risk: "Riesgos de Seguridad",
                                recommendation: "Recomendación"
                            };
                            if (Array.isArray(value) && MAPPED_KEYS[key]) {
                              return (
                                <View key={key} style={{ marginBottom: 12 }}>
                                  <LatoText style={styles.primateSectionTitle}>{MAPPED_KEYS[key]}</LatoText>
                                  {value.map((item, index) => (
                                    <LatoText key={index} style={styles.primateWarningText}>• {item}</LatoText>
                                  ))}
                                </View>
                              );
                            }
                            return null;
                          })}
                        </View>
                      ) : (
                      <View style={styles.paramsContainer}>
                        {/* Esperanza de Vida */}
                        {petParameters.lifespan && (
                          <View style={styles.paramItemContainer}>
                            <View style={styles.paramIconContainer}>
                              <MaterialCommunityIcons name="heart-pulse" size={20} color="#EF9B93" />
                            </View>
                            <View style={styles.paramTextContainer}>
                              <LatoText style={styles.paramTitle}>Esperanza de vida</LatoText>
                              <LatoText style={styles.paramData}>
                                {petParameters.lifespan.min} - {petParameters.lifespan.max} {petParameters.lifespan.unit || 'años'}
                              </LatoText>
                            </View>
                          </View>
                        )}

                        {/* Peso */}
                        {petParameters.weight && (
                          <View style={styles.paramItemContainer}>
                            <View style={styles.paramIconContainer}>
                              <MaterialCommunityIcons name="scale-bathroom" size={20} color="#EF9B93" />
                            </View>
                            <View style={styles.paramTextContainer}>
                              <LatoText style={styles.paramTitle}>Peso Referencial</LatoText>
                              {petParameters.weight.ideal_min !== undefined && petParameters.weight.ideal_max !== undefined ? (
                                <LatoText style={styles.paramData}>
                                  Ideal: {petParameters.weight.ideal_min} - {petParameters.weight.ideal_max} {petParameters.weight.unit}
                                </LatoText>
                              ) : null}
                              {petParameters.weight.min_acceptable !== undefined && petParameters.weight.max_acceptable !== undefined ? (
                                <LatoText style={styles.paramData}>
                                  Aceptable: {petParameters.weight.min_acceptable} - {petParameters.weight.max_acceptable} {petParameters.weight.unit}
                                </LatoText>
                              ) : null}
                               {!petParameters.weight.ideal_min && !petParameters.weight.min_acceptable && petParameters.weight.approx ? (
                                <LatoText style={styles.paramData}>
                                  Aprox: {petParameters.weight.approx} {petParameters.weight.unit}
                                </LatoText>
                              ) : null}
                              {petParameters.weight.notes && <LatoText style={styles.paramNote}>Nota: {petParameters.weight.notes}</LatoText>}
                            </View>
                          </View>
                        )}

                        {/* Tamaño / Longitud Adulta */}
                        {(petParameters.size_category || petParameters.adult_length) && (
                          <View style={styles.paramItemContainer}>
                            <View style={styles.paramIconContainer}>
                              <MaterialCommunityIcons name="ruler-square" size={20} color="#EF9B93" />
                            </View>
                            <View style={styles.paramTextContainer}>
                              <LatoText style={styles.paramTitle}>{petParameters.adult_length ? 'Longitud Adulta' : 'Categoría de Tamaño'}</LatoText>
                              {petParameters.adult_length ? (
                                <LatoText style={styles.paramData}>
                                  {typeof petParameters.adult_length === 'object' ? 
                                   `${petParameters.adult_length.min}-${petParameters.adult_length.max} ${petParameters.adult_length.unit}` : 
                                   petParameters.adult_length}
                                  {petParameters.adult_length.notes && ` (${petParameters.adult_length.notes})`}
                                </LatoText>
                              ) : (
                                <LatoText style={styles.paramData}>{petParameters.size_category}</LatoText>
                              )}
                            </View>
                          </View>
                        )}

                        {/* Temperamento */}
                        {petParameters.temperament && (
                           <View style={styles.paramItemContainer}>
                            <View style={styles.paramIconContainer}>
                              <MaterialCommunityIcons name="paw" size={20} color="#EF9B93" />
                            </View>
                            <View style={styles.paramTextContainer}>
                              <LatoText style={styles.paramTitle}>Temperamento</LatoText>
                              {Array.isArray(petParameters.temperament) ? (
                                petParameters.temperament.map((item, index) => (
                                  <LatoText key={index} style={styles.paramListItem}>• {item}</LatoText>
                                ))
                              ) : (
                                <LatoText style={styles.paramData}>{petParameters.temperament}</LatoText>
                              )}
                            </View>
                          </View>
                        )}
                        
                        {/* Dieta Primaria */}
                        {(petParameters.primary_diet_type || petParameters.diet_type) && (
                           <View style={styles.paramItemContainer}>
                            <View style={styles.paramIconContainer}>
                              <MaterialCommunityIcons name="food-apple-outline" size={20} color="#EF9B93" />
                            </View>
                            <View style={styles.paramTextContainer}>
                              <LatoText style={styles.paramTitle}>Tipo de Dieta Principal</LatoText>
                              <LatoText style={styles.paramData}>{petParameters.primary_diet_type || petParameters.diet_type}</LatoText>
                            </View>
                          </View>
                        )}

                        {/* Necesidades Sociales */}
                        {petParameters.social_needs && (
                          <View style={styles.paramItemContainer}>
                            <View style={styles.paramIconContainer}>
                              <MaterialCommunityIcons name="account-group-outline" size={20} color="#EF9B93" />
                            </View>
                            <View style={styles.paramTextContainer}>
                              <LatoText style={styles.paramTitle}>Necesidades Sociales</LatoText>
                              {Array.isArray(petParameters.social_needs) ? 
                                petParameters.social_needs.map((item, index) => <LatoText key={index} style={styles.paramListItem}>• {item}</LatoText>) :
                                <LatoText style={styles.paramData}>{petParameters.social_needs}</LatoText>
                              }
                            </View>
                          </View>
                        )}

                        {/* Notas de Alojamiento / Tamaño Mínimo Recinto */}
                        {(petParameters.housing_notes || petParameters.enclosure_min_size) && (
                          <View style={styles.paramItemContainer}>
                            <View style={styles.paramIconContainer}>
                              <MaterialCommunityIcons name="home-city-outline" size={20} color="#EF9B93" />
                            </View>
                            <View style={styles.paramTextContainer}>
                              <LatoText style={styles.paramTitle}>{petParameters.housing_notes ? 'Notas de Alojamiento' : 'Tamaño Mín. Recinto'}</LatoText>
                              {petParameters.housing_notes && Array.isArray(petParameters.housing_notes) &&
                                petParameters.housing_notes.map((item, index) => (
                                  <LatoText key={index} style={styles.paramListItem}>• {item}</LatoText>
                                ))}
                              {petParameters.enclosure_min_size && <LatoText style={styles.paramData}>{petParameters.enclosure_min_size}</LatoText>}
                            </View>
                          </View>
                        )}
                        
                        {/* Temperatura (Reptiles, Anfibios, Peces) */}
                        {petParameters.temperature && renderComplexParameter('Temperatura', petParameters.temperature, 'thermometer')}

                        {/* Humedad (Reptiles, Anfibios) */}
                        {petParameters.humidity && renderComplexParameter('Humedad', petParameters.humidity, 'water-percent')}
                        
                        {/* Iluminación (Reptiles, Anfibios) */}
                        {petParameters.lighting && (
                          <View style={styles.paramItemContainer}>
                            <View style={styles.paramIconContainer}>
                              <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color="#EF9B93" />
                            </View>
                            <View style={styles.paramTextContainer}>
                              <LatoText style={styles.paramTitle}>Iluminación</LatoText>
                              {Array.isArray(petParameters.lighting) ? 
                                petParameters.lighting.map((item, index) => <LatoText key={index} style={styles.paramListItem}>• {item}</LatoText>) :
                                <LatoText style={styles.paramData}>{petParameters.lighting}</LatoText>
                              }
                            </View>
                          </View>
                        )}

                        {/* Parámetros Específicos de Peces */}
                        {petParameters.min_tank_size && (
                          <View style={styles.paramItemContainer}>
                            <View style={styles.paramIconContainer}><MaterialCommunityIcons name="barrel" size={20} color="#EF9B93" /></View>
                            <View style={styles.paramTextContainer}>
                              <LatoText style={styles.paramTitle}>Tamaño Mín. Acuario</LatoText>
                              <LatoText style={styles.paramData}>{petParameters.min_tank_size.volume} {petParameters.min_tank_size.unit}</LatoText>
                            </View>
                          </View>
                        )}
                        {petParameters.ph && (
                           <View style={styles.paramItemContainer}>
                            <View style={styles.paramIconContainer}><MaterialCommunityIcons name="ph" size={20} color="#EF9B93" /></View>
                            <View style={styles.paramTextContainer}>
                              <LatoText style={styles.paramTitle}>Rango de pH</LatoText>
                              <LatoText style={styles.paramData}>{petParameters.ph.ideal_min} - {petParameters.ph.ideal_max}</LatoText>
                            </View>
                          </View>
                        )}
                        {petParameters.salinity && (
                           <View style={styles.paramItemContainer}>
                            <View style={styles.paramIconContainer}><MaterialCommunityIcons name="water-opacity" size={20} color="#EF9B93" /></View>
                            <View style={styles.paramTextContainer}>
                              <LatoText style={styles.paramTitle}>Salinidad</LatoText>
                              <LatoText style={styles.paramData}>{petParameters.salinity.ideal_min} - {petParameters.salinity.ideal_max} {petParameters.salinity.unit}</LatoText>
                            </View>
                          </View>
                        )}

                        {/* Sustrato (Reptiles, Anfibios) */}
                        {petParameters.substrate && (
                          <View style={styles.paramItemContainer}>
                            <View style={styles.paramIconContainer}><MaterialCommunityIcons name="shovel" size={20} color="#EF9B93" /></View>
                            <View style={styles.paramTextContainer}>
                              <LatoText style={styles.paramTitle}>Sustrato Recomendado</LatoText>
                              {Array.isArray(petParameters.substrate) ? 
                                petParameters.substrate.map((item, index) => <LatoText key={index} style={styles.paramListItem}>• {item}</LatoText>) :
                                <LatoText style={styles.paramData}>{petParameters.substrate}</LatoText>
                              }
                            </View>
                          </View>
                        )}
                        
                        {/* Necesidades de Agua (Anfibios) */}
                        {petParameters.water_needs && (
                          <View style={styles.paramItemContainer}>
                            <View style={styles.paramIconContainer}><MaterialCommunityIcons name="water-well-outline" size={20} color="#EF9B93" /></View>
                            <View style={styles.paramTextContainer}>
                              <LatoText style={styles.paramTitle}>Necesidades de Agua</LatoText>
                              {Array.isArray(petParameters.water_needs) ? 
                                petParameters.water_needs.map((item, index) => <LatoText key={index} style={styles.paramListItem}>• {item}</LatoText>) :
                                <LatoText style={styles.paramData}>{petParameters.water_needs}</LatoText>
                              }
                            </View>
                          </View>
                        )}

                        {/* Notas de Salud (Hurones) */}
                        {petParameters.health_notes && (
                          <View style={styles.paramItemContainer}>
                            <View style={styles.paramIconContainer}><MaterialCommunityIcons name="hospital-box-outline" size={20} color="#EF9B93" /></View>
                            <View style={styles.paramTextContainer}>
                              <LatoText style={styles.paramTitle}>Notas de Salud Importantes</LatoText>
                              {Array.isArray(petParameters.health_notes) &&
                                petParameters.health_notes.map((item, index) => (
                                  <LatoText key={index} style={styles.paramListItem}>• {item}</LatoText>
                                ))}
                            </View>
                          </View>
                        )}

                        {/* Otros parámetros que no encajan en categorías anteriores */}
                        {Object.entries(petParameters)
                          .filter(([key]) => ![
                            'lifespan', 'weight', 'size_category', 'adult_length', 'temperament', 'primary_diet_type', 'diet_type',
                            'social_needs', 'housing_notes', 'enclosure_min_size', 'temperature', 'humidity', 'lighting',
                            'min_tank_size', 'ph', 'salinity', 'substrate', 'water_needs', 'health_notes', 'name'
                          ].includes(key))
                          .map(([key, value]) => (
                            <View key={key} style={styles.paramItemContainer}>
                               <View style={styles.paramIconContainer}><MaterialCommunityIcons name="information-outline" size={20} color="#EF9B93" /></View>
                               <View style={styles.paramTextContainer}>
                                  <LatoText style={styles.paramTitle}>{formatKeyToTitle(key)}</LatoText>
                                  {typeof value === 'object' && value !== null ? (
                                    <LatoText style={styles.paramData}>{JSON.stringify(value)}</LatoText>
                                  ) : Array.isArray(value) ? (
                                    value.map((item, idx) => <LatoText key={idx} style={styles.paramListItem}>• {item}</LatoText>)
                                  ) : (
                                    <LatoText style={styles.paramData}>{String(value)}</LatoText>
                                  )}
                               </View>
                            </View>
                         ))}
                      </View>
                      )
                    ) : (
                      <View style={styles.noDataTextContainer}>
                        <MaterialCommunityIcons name="file-question-outline" size={40} color="#757575" style={{ marginBottom: 15 }} />
                        <LatoText style={styles.noDataText}>
                          No hay parámetros disponibles para {petData.name}.
                        </LatoText>
                        <LatoText style={styles.noDataSubText}>
                          Esto puede deberse a que no se ha seleccionado una raza específica o la información aún no está cargada.
                        </LatoText>
                      </View>
                    )}
                  </>
                )
              }
            </View>
          </>
        }
      </ScrollView>
      {!isLoading && petData !== null && 
        <Modal
          isVisible={isWeightModalVisible}
          onBackdropPress={() => !isDataLoading && setIsWeightModalVisible(false)}
          onBackButtonPress={() => !isDataLoading && setIsWeightModalVisible(false)}
          animationIn="zoomIn"
          animationOut="zoomOut"
          backdropTransitionOutTiming={0}
          useNativeDriverForBackdrop
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
              {isDataLoading ? 
              (<LatoText style={styles.submitButtonText}>Cargando...</LatoText>) 
              : 
              (<LatoText style={styles.submitButtonText}>Actualizar</LatoText>)}
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} onPress={() => !isDataLoading && setIsWeightModalVisible(false)}>
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
        backdropTransitionOutTiming={0}
        useNativeDriverForBackdrop
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

/**
 * Función para formatear una Key en un título legible
 * @param {string} keyString - La Key a formatear
 * @returns {string} - El título formateado
 */
const formatKeyToTitle = (keyString) => {
  if (!keyString) return '';
  const result = keyString.replace(/_/g, ' ');
  return result.charAt(0).toUpperCase() + result.slice(1);
};

/**
 * Componente para renderizar parámetros complejos
 * @param {string} title - El título del parámetro
 * @param {object} dataObject - El objeto de datos del parámetro
 * @param {string} iconName - El nombre del icono a mostrar
 * @param {string} unitOverride - La unidad a mostrar
 * @returns 
 */
const renderComplexParameter = (title, dataObject, iconName, unitOverride = null) => {
  if (!dataObject) return null;
  const unit = unitOverride || dataObject.unit || '';
  return (
    <View style={styles.paramSection}>
      <View style={styles.paramItemContainer}>
        <View style={styles.paramIconContainer}>
          <MaterialCommunityIcons name={iconName} size={20} color="#EF9B93" />
        </View>
        <View style={styles.paramTextContainer}>
          <LatoText style={styles.paramTitle}>{title} {dataObject.unit ? `(${dataObject.unit})` : ''}</LatoText>
          {Object.entries(dataObject).map(([key, value]) => {
            if (key === 'unit' || key === 'notes') return null;
            let displayValue = '';
            if (typeof value === 'object' && value !== null && value.min !== undefined && value.max !== undefined) {
              displayValue = `${value.min} - ${value.max} ${unit}`;
            } else if (typeof value === 'object' && value !== null ) {
              let subValues = [];
              if (value.ideal_min !== undefined && value.ideal_max !== undefined) subValues.push(`Ideal: ${value.ideal_min}-${value.ideal_max}`);
              if (value.min_acceptable !== undefined && value.max_acceptable !== undefined) subValues.push(`Aceptable: ${value.min_acceptable}-${value.max_acceptable}`);
              displayValue = subValues.join(', ') + (subValues.length > 0 ? ` ${unit}` : '');
              if (!displayValue && typeof value === 'object') displayValue = JSON.stringify(value);
            }
             else {
              displayValue = `${value} ${key.toLowerCase().includes('min') || key.toLowerCase().includes('max') ? unit : ''}`;
            }
            return (
              <View key={key} style={{ marginLeft: 5 }}>
                <LatoText style={styles.paramDataNestedTitle}>{formatKeyToTitle(key)}:</LatoText>
                <LatoText style={styles.paramDataNestedValue}>{displayValue}</LatoText>
              </View>
            );
          })}
          {dataObject.notes && <LatoText style={styles.paramNote}>Nota: {dataObject.notes}</LatoText>}
        </View>
      </View>
    </View>
  );
};

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
    gap: 10,
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
  noDataText: {
    fontSize: 16,
    color: '#242222',
    textAlign: 'center',
    marginTop: 20,
  },
  paramsContainer: {
    width: '100%',
    backgroundColor: '#F6F6F6',
    padding: 20,
    borderRadius: 15,
    marginTop: 10,
    gap: 18,
    elevation: 3,
    shadowColor: '#00000060',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  paramItemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  paramIconContainer: {
    width: 30,
    alignItems: 'center',
    marginTop: 2,
  },
  paramTextContainer: {
    flex: 1,
    gap: 4,
  },
  paramTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#191717',
  },
  paramData: {
    fontSize: 15,
    color: '#242222',
    lineHeight: 20,
  },
  paramListItem: {
    fontSize: 15,
    color: '#555151',
    marginLeft: 5,
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    minWidth: 150,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    paddingHorizontal: 10,
    backgroundColor: '#458AC3',
    borderRadius: 28,
    elevation: 5,
    shadowColor: '#00000070',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    flexDirection: 'row',
    gap: 10,
    zIndex: 5,
  },
  fabText: {
    fontSize: 13,
    color: '#FFF',
  },
  clickableText: {
    fontSize: 16,
    color: '#458AC3',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default ManagePetScreen;