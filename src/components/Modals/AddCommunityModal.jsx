import { View, StyleSheet, Dimensions, TextInput, TouchableOpacity, ScrollView, Keyboard, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Modal from 'react-native-modal';
import LatoText from '../Fonts/LatoText';
import petEventIcons from '../../lib/petEventIcons.json';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapSelection from '../UI/MapSelection';
import DateTimePicker, {useDefaultStyles} from 'react-native-ui-datepicker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { getDayName, getMonthName, getTimeStampInHours } from '../../utils/shared';
import { useToast } from 'react-native-toast-notifications';
import { tokenRefreshWrapper } from '../../services/tokenRefreshWrapper';
import { useUser } from '../../context/UserContext';
import { useLevelUpModal } from '../../context/LevelUpModalContext';
import Markdown, {MarkdownIt} from 'react-native-markdown-display';
import { markdownStyles } from '../../constants/globals';

const { height } = Dimensions.get('window');

const AddCommunityModal = ({isVisible, setIsVisible}) => {

  const [isSelectingIcon, setIsSelectingIcon] = useState(false);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [isSelectingDate, setIsSelectingDate] = useState(false);
  const [isSelectingTime, setIsSelectingTime] = useState(false);

  const [isTimeSelected, setIsTimeSelected] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isMarkdownHelperVisible, setIsMarkdownHelperVisible] = useState(false);

  const [userLocation, setUserLocation] = useState({});

  const [userInput, setUserInput] = useState({
    eventName: '',
    eventIcon: petEventIcons[Math.random() * petEventIcons.length | 0],
    eventUbication: '',
    eventDescription: '',
    eventBody: '',
    maxAttendees: undefined,
    eventDate: new Date(),
    eventTime: new Date(),
  });

  const [locationStreet, setLocationStreet] = useState('');

  const [errors, setErrors] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const [scrollOffset, setScrollOffset] = useState(0);
  const scrollViewRef = useRef(null);

  const defaultDatePickerStyles = useDefaultStyles('light');
  const toast = useToast();
  const {user, refreshUser, updateUser} = useUser();
  const {showLevelUpModal} = useLevelUpModal();

  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
    };
    requestLocationPermission();
  }, []);

  const handleInputChange = (key, value, errorKey) => {
    if (key === 'maxAttendees') {
      if (value !== '' && isNaN(value)) {
        return;
      }
    }
    setUserInput(prevState => ({...prevState, [key]: value}));
    setErrors(prev => prev === errorKey ? '' : prev);
  };

  const handleScrollTo = (p) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo(p);
    }
  };

  const handleOnScroll = (e) => {
    setScrollOffset(e.nativeEvent.contentOffset.y);
  };

  const handleCloseMap = async (location) => {
    if (location) {
      setUserLocation(location);
      const cityName = await Location.reverseGeocodeAsync(location);
      setUserInput({...userInput, eventUbication: cityName[0].city});
      setLocationStreet(`${cityName[0].street}, ${cityName[0].streetNumber}`);
      console.log(location);
    }
    setIsSelectingLocation(false);
  };

  const handelSubmit = async () => {
    if (userInput.eventName.length < 3) {
      setErrors('name');
      return;
    }
    if (userInput.eventDescription.length < 3) {
      setErrors('description');
      return;
    }
    if (userInput.eventUbication.length < 3) {
      setErrors('location');
      return;
    }
    if (userInput.eventBody.length < 10) {
      setErrors('body');
      return;
    }

    if (!isTimeSelected) {
      setErrors('date');
      return;
    }

    setIsLoading(true);

    let formattedBody;

    try {
      formattedBody = JSON.stringify(userInput.eventBody).slice(1, -1);
    } catch (error) {
      console.log('Error al formatear el body', error);
    }
     
    try {
      const formattedData = {
        title: userInput.eventName,
        description: userInput.eventDescription,
        body: formattedBody,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        eventDatetime: convertFullTime(),
        maxAttendees: maxAttendees ? parseInt(userInput.maxAttendees) : null,
        iconName: userInput.eventIcon,
        address: locationStreet,
      };
      
      const response = await tokenRefreshWrapper('addCommunityEvent', formattedData, toast, user, refreshUser, updateUser, showLevelUpModal);

      if (response.success) {
        toast.show('Evento creado con éxito', {type: 'success'});
        handleClose();
      } else {
        if (response.message === "Missing required fields") {
          toast.show('Faltan campos obligatorios', {type: 'danger'});
          return;
        }
        toast.show('Error al crear el evento', {type: 'danger'});
        console.log('Error al crear el evento', response.message);
      }
    } catch (error) {
      console.log('Error al guardar el evento', error);
      toast.show('Error inesperado', {type: 'danger'});
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setUserInput({
      eventName: '',
      eventIcon: petEventIcons[Math.random() * petEventIcons.length | 0],
      eventUbication: '',
      eventDescription: '',
      eventDate: new Date(),
      eventTime: new Date(),
    });
    setLocationStreet('');
    setIsSelectingIcon(false);
    setIsSelectingLocation(false);
    setIsSelectingDate(false);
    setIsSelectingTime(false);
    setIsTimeSelected(false);
  };

  const convertFullTime = () => {
    const date = new Date(userInput.eventDate);
    const time = new Date(userInput.eventTime);
    const fullDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(), time.getMinutes(), time.getSeconds());
    console.log('Full date: ', fullDate);
    return fullDate.toUTCString();
  } 

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={() => !isLoading && setIsVisible(false)}
      swipeDirection={isSelectingLocation ? null : "down"}
      onSwipeComplete={() => !isLoading && setIsVisible(false)}
      propagateSwipe={true}
      scrollTo={handleScrollTo}
      scrollOffset={scrollOffset}
      style={styles.modalContainer}
      backdropTransitionOutTiming={0}
      useNativeDriverForBackdrop
    >
      {isSelectingLocation && <MapSelection initialLocation={userLocation} close={handleCloseMap}/>}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.modalContent}>
            <LatoText style={styles.title}>Añadir evento a la comunidad</LatoText>
            <View style={styles.inputContainer}>
              <LatoText style={styles.modalTitle}>Icono:</LatoText>
              <View style={styles.inputContainerRow}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name={userInput.eventIcon} size={30} color="#EF9B93" />
                </View>
                <TouchableOpacity activeOpacity={0.8} onPress={() => setIsSelectingIcon(!isSelectingIcon)} style={styles.inputButton}>
                  <LatoText style={styles.inputButtonText}>Seleccionar icono</LatoText>
                </TouchableOpacity>
              </View>
            </View>
            {
              isSelectingIcon && (
                <ScrollView 
                ref={scrollViewRef}
                onScroll={handleOnScroll}
                showsVerticalScrollIndicator={false} 
                style={{ height: 200, minHeight: 200 }} 
                scrollEventThrottle={16} 
                nestedScrollEnabled={true}
              >
                <View style={styles.iconSelectorContainer}>
                  {
                    petEventIcons.map((icon, index) => (
                      <TouchableOpacity key={index} activeOpacity={0.8} onPress={() => [setUserInput({...userInput, eventIcon: icon}), setIsSelectingIcon(false)]}>
                        <MaterialCommunityIcons name={icon} size={40} color="#EF9B93" />
                      </TouchableOpacity>
                    ))
                  }
                </View>
              </ScrollView>
              )
            }
            <View style={styles.inputContainer}>
              <LatoText style={styles.modalTitle}>Nombre del Evento: </LatoText>
              <TextInput
                placeholder='Nombre especifico para el evento'
                placeholderTextColor="#ADA9A7"
                value={userInput.eventName}
                onChangeText={(text) => handleInputChange('eventName', text, 'name')}
                style={[styles.input, {borderColor: errors === 'name' ? '#EF6C61' : 'transparent'}]}
              />
              {errors === 'name' && <LatoText style={styles.errorText}>El nombre del evento debe contener al menos 3 caracteres</LatoText>}
            </View>
            <View style={styles.inputContainer}>
              <LatoText style={styles.modalTitle}>Descripción: </LatoText>
              <TextInput
                placeholder='Descripción corta del evento'
                placeholderTextColor="#ADA9A7"
                value={userInput.eventDescription}
                onChangeText={(text) => handleInputChange('eventDescription', text, 'description')}
                style={[styles.input, {borderColor: errors === 'description' ? '#EF6C61' : 'transparent'}]}
              />
              {errors === 'description' && <LatoText style={styles.errorText}>La descripción es obligatoria</LatoText>}
            </View>
            <View style={styles.inputContainer}>
              <View style={styles.labelContainer}>
                <LatoText style={styles.modalTitle}>Contenido: </LatoText>
                <TouchableOpacity activeOpacity={0.8} onPress={() => setIsMarkdownHelperVisible(true)}> 
                  <MaterialCommunityIcons name="information-outline" size={18} color="#ADA9A7" />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.8} style={styles.markdownButton} onPress={() => setIsPreviewVisible(true)}>
                  <MaterialCommunityIcons name="eye" size={18} color="#FFF" />
                  <LatoText style={styles.previewText}>Previsualizar</LatoText>
                </TouchableOpacity>
              </View>
              <TextInput
                placeholder='Contenido del evento en formato markdown'
                placeholderTextColor="#ADA9A7"
                multiline={true}
                value={userInput.eventBody}
                onChangeText={(text) => handleInputChange('eventBody', text, 'body')}
                style={[styles.input, {borderColor: errors === 'body' ? '#EF6C61' : 'transparent', height: 70, maxHeight: 120, textAlignVertical: 'top'}]}
              />
              {errors === 'body' && <LatoText style={styles.errorText}>El cuerpo del evento es obligatorio</LatoText>}
            </View>
            <View style={styles.inputContainer}>
              <LatoText style={styles.modalTitle}>Máximos asistentes: </LatoText>
              <TextInput
                placeholder='Dejar en blanco para ilimitado'
                keyboardType='numeric'
                placeholderTextColor="#ADA9A7"
                value={userInput.maxAttendees}
                onChangeText={(text) => handleInputChange('maxAttendees', text, 'maxAttendees')}
                style={styles.input}
              />
            </View>
            <View style={styles.inputContainer}>
              <LatoText style={styles.modalTitle}>Ubicación: </LatoText>
              <TouchableOpacity activeOpacity={0.8} onPress={() => [setIsSelectingLocation(true), Keyboard.dismiss()]} style={styles.ubiButton}>
                <LatoText style={styles.inputButtonText}>{userInput.eventUbication ? userInput.eventUbication : 'Seleccionar ubicación'}</LatoText>
                {locationStreet !== "" && <LatoText style={styles.ubiSubtitle}>{locationStreet}</LatoText>}
              </TouchableOpacity>
              {errors === 'location' && <LatoText style={styles.errorText}>La ubicación es obligatoria</LatoText>}
            </View>
            <View style={styles.inputContainer}>
              <LatoText style={styles.modalTitle}>Fecha/Hora: </LatoText>
              <TouchableOpacity activeOpacity={0.8} onPress={() => [setIsSelectingDate(true), Keyboard.dismiss()]} style={styles.ubiButton}>
                <LatoText style={styles.inputButtonText}>{isTimeSelected ? `${getDayName(userInput.eventDate)}, ${userInput.eventDate.getDate()} de ${getMonthName(userInput.eventDate)}` : "Seleccionar fecha"}</LatoText>
                {isTimeSelected && (
                  <LatoText style={styles.ubiSubtitle}>{getTimeStampInHours(userInput.eventTime)}</LatoText>
                )}
              </TouchableOpacity>
              {errors === 'date' && <LatoText style={styles.errorText}>La fecha y hora son obligatorias</LatoText>}
            </View>
            {
              isSelectingDate && (
                <View style={styles.absoluteDatePicker}>
                  <TouchableOpacity activeOpacity={0.8} onPress={() => setIsSelectingDate(false)} style={styles.closeButton}>
                    <MaterialCommunityIcons name="close" size={30} color="#EF9B93" />
                  </TouchableOpacity>
                  <LatoText style={styles.dateTitle}>Seleciona una fecha</LatoText>
                  <DateTimePicker 
                    mode='single'
                    onChange={({date}) => [setUserInput({...userInput, eventDate: date}), setIsSelectingTime(true)]}
                    styles={{
                      ...defaultDatePickerStyles,
                      today: {borderColor: '#458AC3', borderWidth: 1, borderRadius: 15, aspectRatio: 1},
                      selected: {backgroundColor: '#458AC3', borderRadius: 15, aspectRatio: 1},
                      selected_label: {color: '#FFF', fontFamily: 'Lato-Regular'},
                      outside_label: {color: '#55515150', fontFamily: 'Lato-Regular'},
                    }}
                    date={userInput.eventDate}
                    locale="es-ES"
                    firstDayOfWeek={1}
                    showOutsideDays={true}
                    multiRangeMode={false}
                    min={new Date()}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
                  />
                  {
                    isSelectingTime && (
                      <DateTimePickerModal 
                        mode='time'
                        locale='es-ES'
                        is24Hour={true}
                        isVisible={isSelectingTime}
                        date={new Date(userInput.eventTime)}
                        onConfirm={(date) => {
                          setUserInput({...userInput, eventTime: date});
                          setIsSelectingTime(false);
                          setIsTimeSelected(true);
                        }}
                        onCancel={() => setIsSelectingTime(false)}
                      />
                    )
                  }
                  <TouchableOpacity activeOpacity={0.8} onPress={() => setIsSelectingDate(false)} style={styles.saveButton}>
                    <LatoText style={styles.saveButtonText}>Guardar</LatoText>
                  </TouchableOpacity>
                </View>
              )
            }
            <View style={styles.buttonsContainer}>
              <TouchableOpacity activeOpacity={0.9} onPress={() => !isLoading && handelSubmit()} style={styles.saveButton}>
                <LatoText style={styles.saveButtonText}>{isLoading ? "Cargando..." : "Guardar"}</LatoText>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.9} onPress={() => !isLoading && handleClose()}>
                <LatoText style={styles.closeText}>Cerrar</LatoText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal
        isVisible={isPreviewVisible}
        onBackdropPress={() => setIsPreviewVisible(false)}
        onBackButtonPress={() => setIsPreviewVisible(false)}
        animationIn="fadeIn"
        animationOut="fadeOut"
      >
        <View style={styles.previewContainer}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => setIsPreviewVisible(false)} style={styles.closeButton}> 
            <MaterialCommunityIcons name="close" size={30} color="#EF9B93" />
          </TouchableOpacity>
          <Markdown 
            style={markdownStyles}
            markdownit={
              MarkdownIt({typographer: true, breaks: true}).disable([ 'link', 'image' ])
            }
          >
            {userInput.eventBody || ''}
          </Markdown>
        </View>
      </Modal>
      <Modal
        isVisible={isMarkdownHelperVisible}
        onBackdropPress={() => setIsMarkdownHelperVisible(false)}
        onBackButtonPress={() => setIsMarkdownHelperVisible(false)}
        animationIn="fadeIn"
        animationOut="fadeOut"
      >
        <View style={styles.helperContainer}>
          <LatoText style={styles.helperTitle}>Ayuda de Markdown</LatoText>
          <LatoText style={styles.helperText}>Puedes usar el siguiente formato para darle estilo a tu contenido, los ejemplos se muestran entre ` `:</LatoText>
          <LatoText style={styles.helperText}>Título principal: <LatoText style={styles.examplesText}>`# Texto`</LatoText>: </LatoText>
          <Markdown style={markdownStyles}># Título Principal</Markdown>
          <LatoText style={styles.helperText}>Título secundario: <LatoText style={styles.examplesText}>`## Texto`</LatoText>: </LatoText>
          <Markdown style={markdownStyles}># Título Secundario</Markdown>
          <LatoText style={styles.helperText}>Negrita: <LatoText style={styles.examplesText}>`**Texto**`</LatoText>:</LatoText>
          <Markdown style={markdownStyles}>**Texto en negrita**</Markdown>
          <LatoText style={styles.helperText}>Cursiva: <LatoText style={styles.examplesText}>`*Texto*`</LatoText>: </LatoText>
          <Markdown style={markdownStyles}>*Texto en cursiva*</Markdown>
          <LatoText style={styles.helperText}>Lista desordenada: <LatoText style={styles.examplesText}>`- Item`</LatoText>: </LatoText>
          <Markdown style={markdownStyles}>- Elemento de lista</Markdown>
          <LatoText style={styles.helperText}>Lista ordenada: <LatoText style={styles.examplesText}>`1. Item`</LatoText>: </LatoText>
          <Markdown style={markdownStyles}>1. Elemento de lista</Markdown>
          <LatoText style={styles.helperText}>Cita: <LatoText style={styles.examplesText}>{"`> Texto`"}</LatoText>:</LatoText>
          <Markdown style={markdownStyles}>{"> Texto de cita"}</Markdown>
          <LatoText style={styles.helperText}> Separador: <LatoText style={styles.examplesText}>`---`</LatoText>: </LatoText>
          <Markdown style={markdownStyles}>---</Markdown>
          <TouchableOpacity activeOpacity={0.8} onPress={() => setIsMarkdownHelperVisible(false)} style={styles.saveButton}>
            <LatoText style={styles.saveButtonText}>Cerrar</LatoText>
          </TouchableOpacity>
        </View>
      </Modal>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: 'flex-end',
    margin: 0,
    zIndex: 999
  },
  modalContent: {
    backgroundColor: '#EEEAE8',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 50,
    gap: 12,
  },
  title: {
    fontSize: 19,
    color: '#191717',
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: 16,
    color: '#191717',
  },
  errorText: {
    fontSize: 13,
    color: '#EF6C61',
    marginTop: -5,
  },
  inputContainer: {
    width: '100%',
    gap: 10,
  },
  input: {
    width: '100%',
    height: 40,
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 5,
    fontSize: 16,
    color: '#191717',
    borderWidth: 1,
    borderColor: 'transparent',
    fontFamily: 'Lato-Regular',
  },
  saveButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#458AC3',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFF',
  },
  closeText: {
    fontSize: 14,
    color: '#555151',
    textAlign: 'center',
    marginTop: 15,
  },
  iconSelectorContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
    backgroundColor: '#EDDFD0',
    borderRadius: 10,
    padding: 10,
  },
  inputContainerRow: {
    width: '100%',
    gap: 10,
    flexDirection: 'row',
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 25,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EDDFD0',
  },
  inputButton: {
    height: 45,
    paddingHorizontal: 15,
    backgroundColor: '#EF9B93',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    flexDirection: 'row',
    gap: 10,
  },
  inputButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
  ubiButton: {
    width: '100%',
    height: 45,
    backgroundColor: '#EF9B93',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    gap: 2,
  },
  ubiSubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  absoluteDatePicker: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
    zIndex: 9999,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFF',
    borderRadius: 99,
    padding: 5,
    elevation: 5,
  },
  dateTitle: {
    fontSize: 20,
    color: '#191717',
    marginBottom: 10,
  },
  buttonsContainer: {
    marginTop: -15,
  },
  labelContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  markdownButton: {
    position: 'absolute',
    flexDirection: 'row',
    right: 0,
    top: -5,
    backgroundColor: '#EF9B93',
    borderRadius: 99,
    padding: 5,
    gap: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewText: {
    fontSize: 13,
    color: '#FFF',
  },
  previewContainer: {
    backgroundColor: '#EEEAE8',
    borderRadius: 10,
    padding: 10,
    height: '100%',
    width: '100%',
    paddingTop: 50,
  },
  helperContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    gap: 10,
    width: '100%',
  },
  helperTitle: {
    fontSize: 20,
    color: '#191717',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  helperText: {
    fontSize: 15,
    color: '#191717',
  },
  examplesText: {
    color: '#EF9B93',
  },
});

export default AddCommunityModal;