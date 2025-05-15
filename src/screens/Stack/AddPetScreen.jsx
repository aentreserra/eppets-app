import { View, TouchableOpacity, StyleSheet, Image, TextInput, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import LatoText from '../../components/Fonts/LatoText'
import * as ImagePicker from 'expo-image-picker';
import { useToast } from 'react-native-toast-notifications'
import DateTimePicker, {useDefaultStyles} from 'react-native-ui-datepicker';
import Modal from 'react-native-modal';
import { formattedDateDayMonthYear } from '../../utils/shared'
import { tokenRefreshWrapper } from '../../services/tokenRefreshWrapper'
import { useUser } from '../../context/UserContext'
import { STORAGE_KEYS } from '../../constants/storageKeys'
import { storeItem, getItem } from '../../utils/storage'
import { speciesOptions } from '../../constants/globals'
import BreedData from '../../lib/breedsData.json';
import loadingGif from '../../gifs/loading.gif'
import { giveLevel } from '../../utils/levelManager'
import { useLevelUpModal } from '../../context/LevelUpModalContext'

const BUCKET_NAME = "eppets-4b8cb.firebasestorage.app";

const AddPetScreen = ({route, navigation}) => {

  const {pet} = route.params;
  
  const [step, setStep] = useState(0);
  
  const [petData, setPetData] = useState({
    image: null,
    name: '',
    species: null,
    breed: {value: '', name: ''},
    weight: null,
    bornDate: new Date(),
    gender: true,
    neutered: false,
    color: '',
    microchip: '',
  });
  const [isImageChanged, setIsImageChanged] = useState(false);
  const [isDateChanged, setIsDateChanged] = useState(false);
  
  const [errors, setErrors] = useState('');
  const [isPrimate, setIsPrimate] = useState(false);
  
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [filteredBreeds, setFilteredBreeds] = useState([]);
  
  const [isEditing, setIsEditing] = useState(false);
  
  const {user, refreshUser, updateUser} = useUser();
  const {showLevelUpModal} = useLevelUpModal();
  const toast = useToast();
  const defaultDatePickerStyles = useDefaultStyles('light');

  useEffect(() => {
    if (pet !== null) {
      setPetData({
        image: {uri: pet.image_url},
        name: pet.name,
        species: pet.species,
        breed: {value: pet.breed, name: BreedData[pet.species].filter(item => item.value === pet.breed)[0]?.name || pet.breed},
        weight: parseFloat(pet.weight),
        bornDate: pet.born_date,
        gender: pet.gender,
        neutered: pet.neutered,
        color: pet.color,
        microchip: pet.microchip,
      });
      setIsDateChanged(true);
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [pet]);

  /**
   * Función para abrir el selector de imagen y seleccionar una imagen
   */
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      toast.show('La aplicación no tiene permiso de cámara', {type: 'danger'});
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setIsImageChanged(true);
      setPetData({...petData, image: result.assets[0]});
    }
  };

  /**
   * Función para manejar el paso siguiente, validar los datos,
   * subir la imagen y guardar los datos de la mascota en el backend
   */
  const handleNextStep = async () => {
    if (petData.name.length < 1) {
      toast.show('El nombre de la mascota es requerido', {type: 'danger'});
      setErrors('name');
      return;
    }

    if (step < 3 && petData.species !== 'primate') {
      setStep(prev => prev + 1);
    } else {
      if (petData.species === 'primate') {
        setStep(4);
      } else {
        setStep(prev => prev + 1);
      }

      // Variables para el estado y datos de la subida de la imagen
      let finalImageUrl = isEditing && !isImageChanged ? petData.image.uri : null;
      let uploadAttempt = false;
      let isUploaded = false;

      // Verificar si la imagen ha cambiado y si es necesario subirla
      if (petData.image !== null && petData.image.uri && isImageChanged) {
        uploadAttempt = true;
        const formattedImageData = {
          filename: petData.image.fileName,
          contentType: petData.image.mimeType,
        }
        const response = await tokenRefreshWrapper('generateUploadUrl', formattedImageData, toast, user, refreshUser, updateUser, showLevelUpModal);
        if (response.success && response.signedUrl && response.filePath) {
          const signedUrl = response.signedUrl;

          // Subimos la imagen con un fetch a la url firmada
          const uploaded = await fetch(petData.image.uri);
          if (!uploaded.ok) {
            toast.show('Error al subir la imagen', {type: 'danger'});
            return;
          }
          const blob = await uploaded.blob();
          
          const uploadResponse = await fetch(signedUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': petData.image.mimeType,
            },
            body: blob,
          });

          if (uploadResponse.ok) { // Si la subida fue exitosa creamos la url de la imagen
            const encodedFilePath = encodeURIComponent(response.filePath);
            finalImageUrl = `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/${encodedFilePath}?alt=media`;
            isUploaded = true;
          } else {
            toast.show('Error al subir la imagen', {type: 'danger'});
            return;
          }

        } else {
          toast.show('Error al subir la imagen', {type: 'danger'});
          return;
        }
      }

      // Formateo de los datos para el backend
      const formattedData = {
        ...petData,
        imageUrl: isUploaded ? finalImageUrl : null,
        bornDate: petData.bornDate ? new Date(petData.bornDate).toISOString() : null,
        breed: petData.breed.value,
      };

      if (isEditing) {
        const response = await tokenRefreshWrapper('updatePetProfile', {...formattedData, id: pet.id}, toast, user, refreshUser, updateUser, showLevelUpModal);

        if (response.success) {
          const storedData = await getItem(STORAGE_KEYS.PETS_PROFILE);
          let pets = [];

          const saveFormatted = {
            id: pet.id,
            name: petData.name,
            species: petData.species,
            breed: petData.breed.value,
            born_date: petData.bornDate,
            gender: petData.gender,
            color: petData.color,
            microchip: petData.microchip,
            neutered: petData.neutered,
            weight: petData.weight,
            image_url: finalImageUrl,
          }

          if (storedData) {
            pets = JSON.parse(storedData) || [];
          }
          const petIndex = pets.findIndex(item => item.id === pet.id);
          if (petIndex !== -1) {
            pets[petIndex] = {
              ...pets[petIndex],
              ...saveFormatted,
            };
          } else {
            pets.push({...saveFormatted, created_at: pet.created_at, last_visit: pet.last_visit});
          }
          await storeItem(STORAGE_KEYS.PETS_PROFILE, JSON.stringify(pets));
          toast.show('Mascota añadida correctamente', {type: 'success'});
          navigation.goBack();
        } else {
          toast.show('Error al actualizar la mascota', {type: 'danger'});
        }
      } else {
        console.log('Creating new pet profile...'); 
        const response = await tokenRefreshWrapper('createNewPetProfile', formattedData, toast, user, refreshUser, updateUser, showLevelUpModal);

        if (response.success) {
          console.log('Pet profile created successfully:', response); 
          const {petProfileId} = response;
  
          console.log('Pet profile created successfully:', petProfileId);
  
          const saveFormatted = {
            id: petProfileId,
            name: petData.name,
            species: petData.species,
            breed: petData.breed.value,
            born_date: petData.bornDate,
            gender: petData.gender,
            color: petData.color,
            microchip: petData.microchip,
            neutered: petData.neutered,
            weight: petData.weight,
            created_at: new Date().toISOString(),
            last_visit: null,
            image_url: isUploaded ? finalImageUrl : null,
          }
  
          const savedData = await getItem(STORAGE_KEYS.PETS_PROFILE);
          let pets = [];
  
          if (savedData) {
            pets = JSON.parse(savedData);
          }
  
          pets.push(saveFormatted);
          await storeItem(STORAGE_KEYS.PETS_PROFILE, JSON.stringify(pets));
  
          toast.show('Mascota añadida correctamente', {type: 'success'});
          navigation.goBack();
        } else {
          console.log('Error creating pet profile:', response.message);
          toast.show('Error al añadir la mascota', {type: 'danger'});
        }
      }
    }
  };

  /**
   * Función para manejar la selección de la especie
   * @param {object} item - El objeto de la especie seleccionada
   */
  const handlePickSpecies = (item) => {
    setPetData({...petData, species: item.value});
    setStep(prev => prev + 1);

    if (item.value === 'primate') {
      setIsPrimate(true);
    }
  }

  /**
   * Función para manejar el paso anterior
   */
  const handleBack = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    }
  };

  /**
   * Función para verificar si la fecha es anterior a hoy
   * @param {string} date - La fecha a comparar
   * @returns {boolean} - true si la fecha es anterior a hoy, false si no
   */
  const isDateBeforeToday = (date) => {
    const today = new Date();
    const selectedDate = new Date(date);
    return selectedDate < today;
  };

  /**
   * Función para seleccionar la fecha si es anterior a hoy
   * @param {string} date - La fecha a comparar
   */
  const handleConfirmDateRange = (date) => {
    if (!isDateBeforeToday(date)) return; 
    setPetData({...petData, bornDate: date});
    setIsDateChanged(true);
    setIsDatePickerVisible(false);
  }

  /**
   * Función para obtener la fecha formateada en años
   * @returns {string} - La fecha formateada
   */
  const getDateFormatted = () => {
    if (!petData.bornDate) return 'Fecha de nacimiento';
    const bornDate = new Date(petData.bornDate);
    const date = formattedDateDayMonthYear(bornDate);

    const today = new Date();
    let age = today.getFullYear() - bornDate.getFullYear();

    const monthDiff = today.getMonth() - bornDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < bornDate.getDate())) {
      age--;
    }

    return `${date} - (${age} ${age > 1 ? 'años' : age === 0 ? 'años' : 'año'})`;
  };

  /**
   * Función para generar el autocompletado de raza
   * @param {string} text - El texto ingresado en el campo de raza
   */
  const handleBreedTyping = (text) => {
    setPetData({...petData, breed: {...petData.breed, name: text}});
    if (text.length > 2) {
      const filteredBreeds = BreedData[petData.species].filter(breed => breed.name.normalize("NFD").toLowerCase().includes(text.normalize("NFD").toLowerCase()));
      setFilteredBreeds(filteredBreeds);
    }
  };

  /**
   * Función para seleccionar la raza del autocompletado
   * @param {object} item - El objeto de la raza seleccionada
   */
  const selectBreed = (item) => {
    setPetData({...petData, breed: {name: item.name, value: item.value}});
    setFilteredBreeds([]);
  }

  /**
   * Función para obtener la unidad de peso de la raza seleccionada
   * @returns {string} - La unidad de peso de la raza seleccionada
   */
  const getWeightUnit = () => {
    try {
      return BreedData[petData.species].filter(item => item.value === petData.breed.value)[0].parameters.weight.unit || "kg"
    } catch {
      return "kg"
    }
  };

  return (
    <SafeAreaView style={styles.page}>
      {step !== 4 &&
        <View style={styles.headerContainer}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#191717" onPress={() => navigation.goBack()} />
          <View style={styles.headerRow}>
            <TouchableOpacity activeOpacity={0.8} style={styles.roundedItem} onPress={() => {}}>
              <MaterialIcons name="add" size={24} color="#EF9B93" />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} style={styles.roundedItem} onPress={() => {}}>
              <MaterialIcons name="edit" size={24} color="#EF9B93" />
            </TouchableOpacity>
          </View>
        </View>
      }
      <View style={styles.petdata}>
        {
          step === 0 ? (
            <>
              <LatoText style={styles.sectionTitle}>Información Básica</LatoText>
              <TouchableOpacity style={styles.imagePicker} activeOpacity={0.8} onPress={() => pickImage()}>
                {petData.image?.uri ? (
                  <Image source={{ uri: petData.image.uri }} style={styles.image} />
                ) : (
                  <MaterialIcons name="add-a-photo" size={24} color="#242222" />
                )}
              </TouchableOpacity>
              <View style={[styles.inputContainer, {borderColor: errors === 'name' ? 'red' : 'transparent'}]}>
                <MaterialCommunityIcons name="pencil" size={24} color="#242222" />
                <TextInput 
                  placeholder='Nombre de la mascota...'
                  value={petData.name}
                  onChangeText={text => setPetData({...petData, name: text})}
                  style={styles.input}
                />
              </View>
            </>
          ) 
          : step === 1 ? (
            <>
              <View style={styles.inputsRowContainer}>
                {
                  speciesOptions.map((item, index) => (
                    <TouchableOpacity onPress={() => handlePickSpecies(item)} key={index} style={[styles.speciesButton, {backgroundColor: petData.species === item.value ? '#EF9B93' : '#F6F6F6'}]}>
                      <MaterialCommunityIcons name={item.icon} size={45} color={petData.species === item.value ? "#FFF" : "#242222"} />
                      <LatoText style={{color: petData.species === item.value ? "#FFF" : '#242222'}}>{item.label}</LatoText>
                    </TouchableOpacity>
                  ))
                }
              </View>
            </>
          ) : step === 2 ? (
            <>
              <LatoText style={styles.sectionTitle}>Información Opcional</LatoText>
              <View style={styles.inputsContainer}>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="variable" size={24} color="#242222" />
                  <TextInput 
                    placeholder='Raza...'
                    value={petData.breed.name}
                    onChangeText={text => handleBreedTyping(text)}
                    style={styles.input}
                  />
                </View>
                {filteredBreeds.length > 0 && <AutocompleteDropdown data={filteredBreeds} onSelect={(item) => selectBreed(item)} />}
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="weight" size={24} color="#242222" />
                  <TextInput 
                    placeholder='Peso actual...'
                    editable={petData.species !== 'primate'}
                    keyboardType='numeric'
                    value={parseFloat(petData.weight)}
                    onChangeText={text => setPetData({...petData, weight: parseFloat(text)})}
                    style={styles.input}
                  />
                  <LatoText style={styles.absoluteWeight}>{petData.breed.value.length > 1 && getWeightUnit()}</LatoText>
                </View>
                <TouchableOpacity activeOpacity={0.8} style={styles.inputContainer} onPress={() => petData.species !== 'primate' && setIsDatePickerVisible(true)}>
                  <MaterialCommunityIcons name="calendar" size={24} color="#242222" />
                  <LatoText style={{color: '#242222'}}>{!isDateChanged ? "Fecha de nacimiento" : getDateFormatted()}</LatoText>
                </TouchableOpacity>
                <View style={styles.buttonsInputContainer}>
                  <TouchableOpacity activeOpacity={0.8} style={[styles.genderButton, {backgroundColor: petData.gender ? "#EF9B93" : "transparent"}]} onPress={() => setPetData({...petData, gender: true})}>
                    <MaterialCommunityIcons name='gender-male' size={24} color={petData.gender ? "#FFF" : "#242222"} />
                    <LatoText style={{color: petData.gender ? '#FFF' : '#242222'}}>Macho</LatoText>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={0.8} style={[styles.genderButton, {backgroundColor: !petData.gender ? "#EF9B93" : "transparent"}]} onPress={() => setPetData({...petData, gender: false})}>
                    <MaterialCommunityIcons name='gender-female' size={24} color={!petData.gender ? "#FFF" : "#242222"} />
                    <LatoText style={{color: !petData.gender ? '#FFF' : '#242222'}}>Hembra</LatoText>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          ) : step === 3 ? (
            <>
              <LatoText style={styles.sectionTitle}>Información Opcional</LatoText>
              <View style={styles.inputsContainer}>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="palette" size={24} color="#242222" />
                  <TextInput 
                    placeholder='Color...'
                    value={petData.color}
                    onChangeText={text => setPetData({...petData, color: text})}
                    style={styles.input}
                  />
                </View>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="card-bulleted" size={24} color="#242222" />
                  <TextInput 
                    placeholder='Micochip...'
                    value={petData.microchip}
                    onChangeText={text => setPetData({...petData, microchip: text})}
                    style={styles.input}
                  />
                </View>
              </View>
            </>
          ) : step === 4 ? (
            <>
              <Image source={loadingGif} style={styles.loadingGif} />
              <LatoText style={styles.updatingText}>{isEditing ? "Actualizando perfil..." : "Creando perfil..."}</LatoText>
              <LatoText>Por favor, espera un momento</LatoText>
              <LatoText style={styles.loadingText}>Recuerda que puedes editar la información de tu mascota en cualquier momento</LatoText>
            </>
          ) : (
            <View style={styles.inputsContainer}>
              <LatoText>Ups, no hay datos</LatoText>
            </View>
          )
        }
        {step !== 4 && 
          <View style={styles.buttonsContainer}>
            <TouchableOpacity activeOpacity={0.8} style={styles.nextButton} onPress={handleNextStep}>
              <LatoText style={styles.nextButtonText}>{step !== 3 ? "Siguiente" : "Acabar"}</LatoText>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} style={styles.button} onPress={handleBack}>
              {step > 0 && <LatoText style={styles.buttonText}>Anterior</LatoText>}
            </TouchableOpacity>
          </View>
        }
      </View>
      <Modal 
        isVisible={isDatePickerVisible}
        onBackdropPress={() => setIsDatePickerVisible(false)}
        onBackButtonPress={() => setIsDatePickerVisible(false)}
        animationIn='fadeInUp'
        animationOut='fadeOutDown'
        backdropTransitionOutTiming={0}
        useNativeDriverForBackdrop
      >
        <View style={styles.modalContainer}>
        <DateTimePicker
          mode={'single'}
          locale='es-ES'
          date={new Date(petData.bornDate)}
          startDate={new Date()}
          onChange={({date}) => handleConfirmDateRange(date)}
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
      <Modal
        isVisible={isPrimate}
        animationIn='fadeInUp'
        animationOut='fadeOutDown'
        backdropTransitionOutTiming={0}
        useNativeDriverForBackdrop
      >
        <View style={styles.modalContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={50} color="#EF9B93" />
          <LatoText style={styles.alertTitle}>¡Atención!</LatoText>
          {
            BreedData['primate'][BreedData['primate'].length - 1].parameters.add_pet_alert.map((item, index) => (
              <LatoText key={index} style={{textAlign: 'center', marginBottom: 10}}>{item}</LatoText>
            ))
          }
          <TouchableOpacity activeOpacity={0.8} style={styles.nextButton} onPress={() => setIsPrimate(false)}>
            <LatoText style={styles.nextButtonText}>Entendido</LatoText>
          </TouchableOpacity>
        </View>
        </Modal>
    </SafeAreaView>
  )
}

/**
 * Componente para el autocompletado de razas
 */
const AutocompleteDropdown = ({data, onSelect}) => (
  <View style={styles.autocompleteContainer}>
    <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollViewAutocomplete}>
      {
        data.map((item) => (
          <TouchableOpacity key={item.value} style={styles.autocompleteItem} onPress={() => onSelect(item)}>
            <LatoText style={styles.autocompleteItemText}>{item.name}</LatoText>
          </TouchableOpacity>
        ))
      }
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#EEEAE8',
    padding: 13,
  },
  scrollView: {
    width: '100%',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
    zIndex: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roundedItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
  },
  sectionTitle: {
    position: 'absolute',
    top: 55,
    left: 0,
    width: '100%',
    textAlign: 'center',
    fontSize: 20,
    color: '#191717',
    marginBottom: 10,
  },
  petdata: {
    flex: 1,
    marginTop: -55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    paddingHorizontal: 5,
    gap: 15,
  },
  nextButton: {
    width: '90%',
    alignItems: 'center',
    padding: 10,
    paddingVertical: 15,
    borderRadius: 99,
    marginTop: 10,
    backgroundColor: '#458AC3',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 20,
  },
  buttonText: {
    color: '#555151',
    fontSize: 14,
  },
  imagePicker: {
    width: 145,
    height: 145,
    borderRadius: 99,
    overflow: 'hidden',
    marginBottom: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 99,
  },
  inputsContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  inputsRowContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    alignItems: 'center',
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
    paddingVertical: 12,
    gap: 10,
    borderRadius: 99,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 10,
  },
  buttonsInputContainer: {
    width: '90%',
    height: 45,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 99,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 10,
    overflow: 'hidden',
  },
  input: {
    width: '90%',
    fontFamily: 'Lato-Regular',
  },
  genderButton: {
    width: '50%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  speciesButton: {
    width: '48%',
    padding: 10,
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#EEEAE8',
    borderRadius: 10,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  autocompleteContainer: {
    position: 'absolute',
    width: '90%',
    top: 50,
    left: 20,
    right: 0,
    zIndex: 999,
  },
  scrollViewAutocomplete: {
    maxHeight: 200,
    width: '100%',
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    padding: 10,
    elevation: 5,
  },
  autocompleteItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  autocompleteItemText: {
    color: '#242222',
    fontSize: 14,
  },
  absoluteWeight: {
    position: 'absolute',
    right: 15,
    top: 15,
    fontSize: 14,
    color: '#242222',
  },
  alertTitle: {
    fontSize: 20,
    color: '#191717',
    marginBottom: 10,
  },
  updatingText: {
    fontSize: 20,
    color: '#191717',
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 14,
    color: '#242222',
    marginTop: 10,
    textAlign: 'center',
  },
  loadingGif: {
    width: 120,
    height: 120,
    marginBottom: 5,
  },
});

export default AddPetScreen;