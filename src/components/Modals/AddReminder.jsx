import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard
} from 'react-native';
import Modal from 'react-native-modal';
import LatoText from '../Fonts/LatoText';
import DropDown from '../UI/DropDown';
import DateTimePicker, {useDefaultStyles} from 'react-native-ui-datepicker';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useToast } from 'react-native-toast-notifications';
import { getDayName, getMonthName, getTimeStampInHours } from '../../utils/shared';
import { getItem } from '../../utils/storage';
import { STORAGE_KEYS } from '../../constants/storageKeys';

const { height } = Dimensions.get('window');

const recurrenceOptions = [
  { label: 'Una sola vez', value: 'none', icon: 'repeat-off'},
  { label: 'Una vez al día', value: 'daily_single', icon: 'repeat-once'},
  { label: 'Varias veces al día', value: 'daily_multiple', icon: 'repeat'},
  { label: 'Días especificos', value: 'weekly', icon: 'calendar-week'},
  { label: 'Mensualmente', value: 'monthly', icon: 'calendar-month'},
  { label: 'Anualmente', value: 'yearly', icon: 'calendar-clock'},
];

const typesOptions = [
  { label: 'Medicación', value: 0, icon: 'pill' },
  { label: 'Cita veterinaria', value: 1, icon: 'calendar-heart' },
  { label: 'Vacunación', value: 2, icon: 'needle' },
];

const AddReminder = ({isVisible, setIsVisible, defaultPet = null, defaultDay = new Date()}) => {

  const [scrollOffset, setScrollOffset] = useState(0);
  const scrollViewRef = useRef(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPetId, setSelectedPetId] = useState(null);
  const [selectedTypeId, setSelectedTypeId] = useState(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedRange, setSelectedRange] = useState({ startDate: defaultDay, endDate: null });
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [recurrenceType, setRecurrenceType] = useState(null);
  const [interval, setInterval] = useState(1);
  const [selectedWeekdays, setSelectedWeekdays] = useState([]);
  const [hourlyInterval, setHourlyInterval] = useState(8)
  const [instructions, setInstructions] = useState('');
  const [petOptions, setPetOptions] = useState([]);

  const [manuallyPicked, setManuallyPicked] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const [errors, setErrors] = useState('');

  const defaultDatePickerStyles = useDefaultStyles('light');
  const toast = useToast();

  useEffect(() => {
    getLocalData();

    resetFormState();
  }, [isVisible]);

  const getLocalData = async () => {
    const data = await getItem(STORAGE_KEYS.PETS_PROFILE);

    if (data) {
      const pets = JSON.parse(data);
      const petOptions = pets.map((pet) => ({
        label: pet.name,
        value: pet.id,
        icon: 'paw',
      }));
      setPetOptions(petOptions);
    }

    if (defaultPet !== null) {
      const defaultPetOption = petOptions.find((pet) => pet.value === defaultPet.id);
      if (defaultPetOption) {
        setSelectedPetId(defaultPetOption);
      } else {
        setSelectedPetId(null);
      }
    }
  };

  const handleScrollTo = (p) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo(p);
    }
  };

  const handleOnScroll = (e) => {
    setScrollOffset(e.nativeEvent.contentOffset.y);
  };

  const closeModal = () => {
    setIsVisible(false);
    resetFormState();
  };

  const resetFormState = () => {
    setTitle('');
    setDescription('');
    setSelectedPetId(null);
    setSelectedTypeId(null);
    setSelectedRange({ startDate: defaultDay, endDate: null });
    setSelectedTime(new Date());
    setRecurrenceType(null);
    setInterval(1);
    setSelectedWeekdays([]);
    setHourlyInterval(8);
    setInstructions('');
    setManuallyPicked(false);
    setErrors('');
  };

  const handleConfirmDateRange = (params) => {
    if (params.date) {
      setSelectedRange({
        startDate: params.date,
        endDate: null,
      });
      if (!manuallyPicked) {
        setRecurrenceType(recurrenceOptions[0]);
      }
      return;
    }
    setSelectedRange({
      startDate: params.startDate,
      endDate: params.endDate,
    });
    //setDatePickerVisible(false);

    if (!manuallyPicked && params.startDate && params.endDate === undefined) {
      setRecurrenceType(recurrenceOptions[0]);
    } else if (!manuallyPicked && params.startDate && params.endDate && recurrenceType?.value === 'none') {
      setRecurrenceType(recurrenceOptions[1]);
    }
  };

  const handleConfirmTime = (time) => {
    if (time) {
      setSelectedTime(time);

    }
    setTimePickerVisible(false);
  };

  const buildRecurrence = () => {
    // Para la conversión de la recurrencia de las notificaciones usaré el formato RRULE de iCalendar

    // Si no hay recurrencia o no hay datos de fecha, no se agrega la regla de recurrencia
    if (!recurrenceType || recurrenceType?.value === 'none' || !selectedRange.startDate) return 'FREQ=NONE';

    // Mapeo de los tipos de recurrencia a los valores de RRULE
    const baseFreqMap = {
      'daily_single': 'DAILY',
      'daily_multiple': 'HOURLY',
      'weekly': 'WEEKLY',
      'monthly': 'MONTHLY',
      'yearly': 'YEARLY',
    };

    // Obtener el valor de frecuencia correspondiente al tipo de recurrencia seleccionado
    const freq = baseFreqMap[recurrenceType.value];
    if (!freq) return `FREQ=${freq}`; // Si no hay frecuencia, no se agrega la regla de recurrencia

    // Construir la regla de recurrencia
    let ruleParts = [`FREQ=${freq}`];

    // Agregar el intervalo de repetición
    let currentInterval = 1;
    if (freq === 'HOURLY') {
      currentInterval = parseInt(hourlyInterval) || 1;
    } else {
      currentInterval = parseInt(interval) || 1;
    }

    // Validar el intervalo
    if (currentInterval > 1) {
      ruleParts.push(`INTERVAL=${currentInterval}`);
    }

    // Agregar recurrencia por día, semana, mes o año
    if (freq === 'WEEKLY') {
      if (!selectedWeekdays.length) {
        setErrors('weekdays');
        return;
      }
      const days = selectedWeekdays.map(day => ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'][day]).join(',');
      ruleParts.push(`BYDAY=${days}`);
    } else if (freq === 'MONTHLY') {
      ruleParts.push(`BYMONTHDAY=${selectedRange.startDate.getDate()}`);
    } else if (freq === 'YEARLY') {
      ruleParts.push(`BYMONTH=${selectedRange.startDate.getMonth() + 1}`);
      ruleParts.push(`BYMONTHDAY=${selectedRange.startDate.getDate()}`);
    }

    // Agregar la fecha de inicio y de fin
    if (selectedRange.endDate) {
      const startDateOnly = new Date(selectedRange.startDate);
      startDateOnly.setHours(0, 0, 0, 0);
      const endDateOnly = new Date(selectedRange.endDate);
      endDateOnly.setHours(0, 0, 0, 0);

      if (endDateOnly.getTime() > startDateOnly.getTime()) {
        const untilDate = new Date(selectedRange.endDate);
        untilDate.setHours(23, 59, 59, 999);
        try {
          const untilISOString = untilDate.toISOString().replace(/.\d{3}Z$/, 'Z').replace(/[-:]/g, '');
          ruleParts.push(`UNTIL=${untilISOString}`);
        } catch (error) {
          console.error('Error converting date to UTC:', error);
          return;
        }
      }
    }

    // Devolvemos el string de la regla de recurrencia
    return ruleParts.join(';');
  };

  const handleShowSummary = async () => {
    if (!title) {
      setErrors('title');
      return;
    } else if (!selectedPetId) {
      setErrors('petId');
      return;
    } else if (!selectedTypeId) {
      setErrors('typeId');
      return;
    } else {
      setErrors('');
    }

    setShowSummary(true);
  };

  const handleSaveAndClose = () => {
    const recurrenceRule = buildRecurrence();
    let triggerDateTimeUTC = null;

    if (selectedRange.startDate && selectedTime) {
      const startDate = new Date(selectedRange.startDate);
      startDate.setHours(selectedTime.getHours());
      startDate.setMinutes(selectedTime.getMinutes());
      startDate.setSeconds(0);
      startDate.setMilliseconds(0);
      try {
        triggerDateTimeUTC = startDate.toISOString();
      } catch (error) {
        console.error('Error converting date to UTC:', error);
        return;
      }
    } else {
      setErrors('date');
      return;
    }

    const reminderData = {
      title,
      description,
      petId: selectedPetId?.value,
      reminderType: selectedTypeId?.value,
      instructions,
      recurrenceRule,
      triggerDateTimeUTC,
    };

    // Aquí se enviaria la información al backend, junto al accessToken
    console.log('Data to send to backend:', reminderData);
    // TODO -> Save reminder data to API
    toast.show('Recordatorio guardado', { type: 'success' });
    setShowSummary(false);
    closeModal();
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={closeModal}
      propagateSwipe={true}
      style={styles.modalContainer}
      animationIn='fadeInUp'
      animationOut='fadeOutDown'
      scrollTo={handleScrollTo}
      scrollOffset={scrollOffset}
    >
        <ScrollView
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps='handled'
          style={styles.scrollViewStyle}
          contentContainerStyle={styles.scrollViewContent}
        >
          <View style={[styles.modalContent, { height: height * 0.9 }]}>
            <LatoText style={styles.title}>Añadir recordatorio</LatoText>

            {/* CAMPOS BÁSICOS */}
            <View style={styles.inputContainer}>
              <LatoText style={styles.modalTitle}>Título del recordatorio: </LatoText>
              <TextInput
                placeholder='Ej: Vacuna Rabia Anual'
                placeholderTextColor="#ADA9A7"
                value={title}
                onChangeText={(text) => setTitle(text)}
                style={styles.input}
              />
              {errors === 'title' && <LatoText style={styles.errorText}>El título es requerido</LatoText>}
            </View>
            <View style={styles.inputContainer}>
              <LatoText style={styles.modalTitle}>Descripción del recordatorio: </LatoText>
              <TextInput
                placeholder='Notas adicionales (opcional)'
                placeholderTextColor="#ADA9A7"
                value={description}
                onChangeText={(text) => setDescription(text)}
                style={styles.input}
              />
            </View>
            <View style={styles.inputInlineContainer}>
              <LatoText style={styles.modalTitle}>Mascota asignada: </LatoText>
              <DropDown
                inline
                onValueChange={(value => setSelectedPetId(value))}
                selectedValue={selectedPetId}
                options={petOptions}
                placeholder='Selecciona mascota...'
                leftIcon='paw'
                disabled={false}
              />
            </View>
            {errors === 'petId' && <LatoText style={styles.errorText}>Seleciona una mascota para guardar</LatoText>}
            <View style={styles.inputInlineContainer}>
              <LatoText style={styles.modalTitle}>Tipo de recordatorio: </LatoText>
              <DropDown 
                onValueChange={(value => [setSelectedTypeId(value), setManuallyPicked(true)])}
                selectedValue={selectedTypeId}
                options={typesOptions}
                placeholder='Selecciona tipo...'
                leftIcon='calendar'
                disabled={false}
              />
            </View>
            {errors === 'typeId' && <LatoText style={styles.errorText}>Seleciona un tipo de recordatorio</LatoText>}

            {/* INSTRUCCIONES */}
            {
              selectedTypeId?.value === 0 && (
                <View style={styles.inputContainer}>
                  <LatoText style={styles.modalTitle}>Instrucciones: </LatoText>
                  <TextInput
                    placeholder='Ej: 1 pastilla cada 12 horas'
                    placeholderTextColor="#ADA9A7"
                    value={instructions}
                    onChangeText={(text) => setInstructions(text)}
                    style={styles.input}
                  />
                </View>
              )
            }

            {/* FECHA / HORA de INICIO */}
            <View style={styles.inputContainer}>
              <LatoText style={styles.modalTitle}>{(selectedTypeId?.value === 0 || !selectedTypeId) ? "Período del Recordatorio:" : "Día del recordatorio:"} </LatoText>
              <TouchableOpacity activeOpacity={0.8} onPress={() => [setDatePickerVisible(true), Keyboard.dismiss()]} style={styles.inputButton}>
                <LatoText style={styles.inputButtonText}>{selectedRange.startDate ? `${(selectedRange.endDate && (selectedTypeId?.value === 0 || !selectedTypeId)) ? "Empezar: " : ""}${getDayName(selectedRange.startDate)}, ${selectedRange.startDate.getDate()} de ${getMonthName(selectedRange.startDate)}` : "Seleccionar fecha"}</LatoText>
                {selectedRange.endDate && (selectedTypeId?.value === 0 || !selectedTypeId) && (
                  <LatoText style={styles.inputButtonText}>{`Fin: ${getDayName(selectedRange.endDate)}, ${selectedRange.endDate.getDate()} de ${getMonthName(selectedRange.endDate)}`}</LatoText>
                )}
              </TouchableOpacity>
              <Modal isVisible={isDatePickerVisible} onBackdropPress={() => setDatePickerVisible(false)} animationIn='fadeIn' animationOut='fadeOut'>
                <View style={styles.subModalContainer}>
                  <DateTimePicker
                    mode={(selectedTypeId?.value === 0 || !selectedTypeId) ? 'range' : 'single'}
                    locale='es-ES'
                    date={selectedRange.startDate}
                    startDate={selectedRange.startDate}
                    endDate={selectedRange.endDate}
                    onChange={handleConfirmDateRange}
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
                  <TouchableOpacity activeOpacity={0.9} onPress={() => setDatePickerVisible(false)} style={styles.saveButton}>
                    <LatoText style={styles.saveButtonText}>Guardar</LatoText>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={0.9} onPress={() => setDatePickerVisible(false)}>
                    <LatoText style={styles.closeText}>Cerrar</LatoText>
                  </TouchableOpacity>
                </View>
              </Modal>
            </View>
            <View style={styles.inputContainer}>
              <LatoText style={styles.modalTitle}>Hora del recordatorio: </LatoText>
              <TouchableOpacity activeOpacity={0.8} onPress={() => [setTimePickerVisible(true), Keyboard.dismiss()]} style={styles.inputButton}>
                <LatoText style={styles.inputButtonText}>{getTimeStampInHours(selectedTime)}</LatoText>
              </TouchableOpacity>
              {
                isTimePickerVisible && (
                  <DateTimePickerModal 
                    mode='time'
                    locale='es-ES'
                    is24Hour={true}
                    isVisible={isTimePickerVisible}
                    date={new Date(selectedTime)}
                    onConfirm={(date) => handleConfirmTime(date)}
                    onCancel={() => setTimePickerVisible(false)}
                  />
                )
              }
            </View>
            <View style={styles.inputInlineContainer}>
              <LatoText style={styles.modalTitle}>Repetición:</LatoText>
              <DropDown 
                onValueChange={(value => setRecurrenceType(value))}
                selectedValue={recurrenceType}
                options={recurrenceOptions}
                placeholder='Selecciona tipo...'
                leftIcon='repeat'
                disabled={false}
              />
            </View>

            {recurrenceType?.value === 'daily_single' && (
              <>                    
                <View style={styles.inputInlineContainer}>
                  <LatoText style={styles.modalTitle}>Repetir cada:</LatoText>
                  <View style={styles.inlineInput}>
                    <TextInput
                      value={interval}
                      onChangeText={(text) => [setInterval(text), setManuallyPicked(true)]}
                      keyboardType="numeric"
                      placeholder='1'
                      placeholderTextColor="#ADA9A7"
                      style={styles.numericInput}
                      />
                      <LatoText> día(s)</LatoText>
                  </View>
                </View>
              </>
            )}

            {recurrenceType?.value === 'daily_multiple' && (
              <>                    
                <View style={styles.inputInlineContainer}>
                  <LatoText style={styles.modalTitle}>Repetir cada:</LatoText>
                  <View style={styles.inlineInput}>
                    <TextInput
                      value={hourlyInterval}
                      onChangeText={(text) => [setHourlyInterval(text), setManuallyPicked(true)]}
                      keyboardType="numeric"
                      placeholder='8'
                      placeholderTextColor="#ADA9A7"
                      style={styles.numericInput}
                      />
                      <LatoText> hora(s)</LatoText>
                  </View>
                </View>
              </>
            )}

            {recurrenceType?.value === 'weekly' && (
              <View style={styles.subSectionContainer}>
                <View style={styles.inputInlineContainer}>
                  <LatoText style={styles.modalTitle}>Repetir cada:</LatoText>
                  <View style={styles.inlineInput}>
                    <TextInput
                      value={interval}
                      onChangeText={(text) => [setInterval(text), setManuallyPicked(true)]}
                      keyboardType="numeric"
                      placeholder='1'
                      placeholderTextColor="#ADA9A7"
                      style={styles.numericInput}
                      />
                      <LatoText> semana(s)</LatoText>
                  </View>
                </View>
                <LatoText style={styles.modalTitle}>En los días:</LatoText>
                <WeekdaySelector selectedDays={selectedWeekdays} onSelectionChange={setSelectedWeekdays} />
              </View>
            )}

            {recurrenceType?.value === 'monthly' && (
              <View style={styles.subSectionContainer}>
                <View style={styles.inputInlineContainer}>
                  <LatoText style={styles.modalTitle}>Repetir cada:</LatoText>
                  <View style={styles.inlineInput}>
                    <TextInput
                      value={interval}
                      onChangeText={(text) => [setInterval(text), setManuallyPicked(true)]}
                      keyboardType="numeric"
                      placeholder='2'
                      placeholderTextColor="#ADA9A7"
                      style={styles.numericInput}
                      />
                      <LatoText> mes(es)</LatoText>
                  </View>
                </View>
              </View>
            )}

            {recurrenceType?.value === 'yearly' && (
              <>
                <View style={styles.subSectionContainer}>
                  <View style={styles.inputInlineContainer}>
                    <LatoText style={styles.modalTitle}>Repetir cada:</LatoText>
                    <View style={styles.inlineInput}>
                      <TextInput
                        value={interval}
                        onChangeText={(text) => [setInterval(text), setManuallyPicked(true)]}
                        keyboardType="numeric"
                        placeholder='1'
                        placeholderTextColor="#ADA9A7"
                        style={styles.numericInput}
                        />
                        <LatoText> año(s)</LatoText>
                    </View>
                  </View>
                </View>
                <LatoText style={styles.modalTitle}>* Al marcar anualmente, se te recordará cada año(s), el día y hora que indeiques</LatoText>
              </>
              )}
            <TouchableOpacity activeOpacity={0.9} onPress={handleShowSummary} style={styles.saveButton}>
              <LatoText style={styles.saveButtonText}>Guardar</LatoText>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.9} onPress={closeModal}>
              <LatoText style={styles.closeText}>Cerrar</LatoText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      <Modal
        isVisible={showSummary}
        onBackdropPress={() => setShowSummary(false)}
        animationIn='fadeIn'
        animationOut='fadeOut'
        style={styles.summaryModalContainer}
      >
        <View style={styles.summaryModalBox}>
          <LatoText style={styles.title}>Resumen del Recordatorio</LatoText>
          <LatoText style={styles.normalText}>Título: <LatoText style={styles.bold}>{title}</LatoText></LatoText>
          {description.length > 0 && <LatoText style={styles.normalText}>Descripción: {description}</LatoText>}
          <LatoText style={styles.normalText}>Mascota: <LatoText style={styles.bold}>{selectedPetId?.label}</LatoText></LatoText>
          <LatoText style={styles.normalText}>Tipo: <LatoText style={styles.bold}>{selectedTypeId?.label}</LatoText></LatoText>
          <LatoText style={styles.normalText}>Fecha: <LatoText style={styles.bold}>{getDayName(selectedRange.startDate)}, {selectedRange.startDate.getDate()} de {getMonthName(selectedRange.startDate)}</LatoText></LatoText>
          {selectedRange.endDate && <LatoText style={styles.normalText}>Fin: <LatoText style={styles.bold}>{getDayName(selectedRange.endDate)}, {selectedRange.endDate.getDate()} de {getMonthName(selectedRange.endDate)}</LatoText></LatoText>}
          <LatoText style={styles.normalText}>Hora: <LatoText style={styles.bold}>{getTimeStampInHours(selectedTime)}</LatoText></LatoText>
          {recurrenceType && <LatoText style={styles.normalText}>Repetición: <LatoText style={styles.bold}>{recurrenceType.label}</LatoText></LatoText>}
          {recurrenceType?.value === 'weekly' && <LatoText style={styles.normalText}>Días: <LatoText style={styles.bold}>{selectedWeekdays.map(day => ['L', 'M', 'X', 'J', 'V', 'S', 'D'][day]).join(', ')}</LatoText></LatoText>}
          {recurrenceType?.value === 'daily_multiple' && <LatoText style={styles.normalText}>Cada: <LatoText style={styles.bold}>{hourlyInterval} hora(s)</LatoText></LatoText>}
          {recurrenceType?.value === 'monthly' && <LatoText style={styles.normalText}>Cada: <LatoText style={styles.bold}>{interval} mes(es)</LatoText></LatoText>}
          {recurrenceType?.value === 'anually' && <LatoText style={styles.normalText}>Cada: <LatoText style={styles.bold}>{interval} año(s)</LatoText></LatoText>}
          <TouchableOpacity activeOpacity={0.9} onPress={handleSaveAndClose} style={styles.saveButton}>
            <LatoText style={styles.saveButtonText}>Aceptar</LatoText>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.9} onPress={() => setShowSummary(false)}>
            <LatoText style={styles.closeText}>Editar</LatoText>
          </TouchableOpacity>
        </View>
      </Modal>
    </Modal>
  )
}

const WeekdaySelector = ({ selectedDays, onSelectionChange }) => {
  const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const dayValues = [0, 1, 2, 3, 4, 5, 6];

  const toogleDay = (day) => {
    const newSelectedDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];
    onSelectionChange(newSelectedDays.sort());
  };

  return (
    <View style={styles.checkerContainer}>
      {days.map((day, index) => (
        <TouchableOpacity key={index} onPress={() => toogleDay(dayValues[index])} style={[styles.checkboxDay, { backgroundColor: selectedDays.includes(dayValues[index]) ? '#458AC3' : '#F6F6F6' }]}>
          <LatoText style={[styles.modalTitle, {color: selectedDays.includes(dayValues[index]) ? '#fff' : "#191717"}]}>{day}</LatoText>
        </TouchableOpacity>
      ))}
    </View>
  )
};

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  scrollViewStyle: {
    maxHeight: height * 0.9,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#EEEAE8',
    flexGrow: 0,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  modalContent: {
    backgroundColor: '#EEEAE8',
    padding: 20,
    gap: 13
  },
  subModalContainer: {
    backgroundColor: '#EEEAE8',
    borderRadius: 16,
    padding: 20,
    gap: 10,
  },
  title: {
    fontSize: 19,
    color: '#191717',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    color: '#191717',
  },
  normalText: {
    fontSize: 16,
    color: '#191717',
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
    fontSize: 16,
    color: '#191717',
    fontFamily: 'Lato-Regular',
  },
  checkerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  checkbox: {
    borderRadius: 5,
    borderWidth: 1,
    backgroundColor: '#F6F6F6',
    height: 24,
    width: 24,
  },
  saveButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#458AC3',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
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
  inputButton: {
    width: '100%',
    height: 45,
    backgroundColor: '#EF9B93',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    gap: 2,
  },
  inputSubtitle: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  inputButtonText: {
    fontSize: 16,
    color: '#FFF',
  },
  inputInlineContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inlineInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  numericInput: {
    width: 80,
    height: 40,
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#191717',
    fontFamily: 'Lato-Regular',
  },
  checkboxDay: {
    width: 45,
    height: 30,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    marginRight: 10,
  },
  errorText: {
    fontSize: 12,
    color: '#FF0000',
    marginTop: -5,
  },
  summaryModalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
    borderRadius: 16,
    padding: 20,
  },
  summaryModalBox: {
    backgroundColor: '#EEEAE8',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    gap: 7
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default AddReminder;