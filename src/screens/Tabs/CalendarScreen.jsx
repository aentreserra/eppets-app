import { View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import LatoText from '../../components/Fonts/LatoText'
import DateTimePicker, {useDefaultStyles} from 'react-native-ui-datepicker'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { getTimeStampInHours, getDayName, getMonthName } from '../../utils/shared'
import AddReminder from '../../components/Modals/AddReminder'
import { useUser } from '../../context/UserContext'
import ReminderItem from '../../components/UI/ReminderItem'
import ReminderModal from '../../components/Modals/ReminderModal'
import RemoveReminderModal from '../../components/Modals/RemoveReminderModal'

const CalendarScreen = ({route, navigation}) => {

  const [selectedDate, setSelectedDate] = useState(new Date());

  const [isAddReminderVisible, setIsAddReminderVisible] = useState(false);
  const [isReminderModalVisible, setIsReminderModalVisible] = useState(false);
  const [isRemoveReminderModalVisible, setIsRemoveReminderModalVisible] = useState(false);
  
  const [userReminders, setUserReminders] = useState([]);
  const [selectedReminder, setSelectedReminder] = useState(null);

  const {user} = useUser();
  const defaultDatePickerStyles = useDefaultStyles('light');

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      getReminders();
      if (route.params?.defaultDay) {
        setSelectedDate(new Date());
        navigation.setParams({screen:undefined, defaultDay: null });
      }
    });

    getReminders();

    return unsubscribe;
  }, []);

  /**
   * Función para obtener los recordatorios del usuario
   */
  const getReminders = () => {
    const reminders = user.reminders || [];
    setUserReminders(reminders);
  };

  /**
   * Función para manejar el cambio de fecha en el calendario
   * @param {Date} date - Fecha seleccionada
   */
  const handleDateChange = (date) => {
    setSelectedDate(date);
  }

  /**
   * Función para obtener los recordatorios del día seleccionado
   */
  const getDayTodos = userReminders.filter(item => {
    const date = new Date(item.next_trigger_datetime_utc);
    return date.getDate() === selectedDate.getDate() && date.getMonth() === selectedDate.getMonth() && date.getFullYear() === selectedDate.getFullYear();
  });

  /**
   * Función para manejar cerrar los modales y recargar los recordatorios
   */
  const handleReloadReminders = () => {
    setIsAddReminderVisible(false);
    setIsReminderModalVisible(false);
    setIsRemoveReminderModalVisible(false);
    getReminders();
  };

  return (
    <SafeAreaView style={styles.page}>
      <AddReminder isVisible={isAddReminderVisible} setIsVisible={handleReloadReminders} defaultDay={selectedDate}/>
      <ReminderModal isVisible={isReminderModalVisible} setIsVisible={setIsReminderModalVisible} data={selectedReminder}/>
      <RemoveReminderModal isVisible={isRemoveReminderModalVisible} setIsVisible={setIsRemoveReminderModalVisible} data={selectedReminder} onClose={handleReloadReminders}/>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <LatoText style={styles.title}>Calendario</LatoText>
          <TouchableOpacity activeOpacity={0.9} style={styles.roundedButton} onPress={() => setIsAddReminderVisible(true)}>
            <MaterialCommunityIcons name="plus-circle" size={30} color="#458AC3" />
          </TouchableOpacity>
        </View>
        <DateTimePicker 
          mode='single'
          multiRangeMode={false}
          date={selectedDate}
          onChange={({date}) => handleDateChange(date)}
          styles={{
            ...defaultDatePickerStyles,
            day_label: {color: '#191717', fontFamily: 'Lato-Regular'},
            today: {borderColor: '#458AC3', borderWidth: 1, borderRadius: 15, aspectRatio: 1},
            selected: {backgroundColor: '#458AC3', borderRadius: 15, aspectRatio: 1},
            selected_label: {color: '#FFF', fontFamily: 'Lato-Regular'},
            outside_label: {color: '#55515150', fontFamily: 'Lato-Regular'},
          }}
          locale='es-ES'
          firstDayOfWeek={1}
          showOutsideDays={true}
        />
        <View style={styles.bottomContainer}>
          <LatoText style={styles.dateTitle}>{getDayName(selectedDate)}, {selectedDate.getDate()} de {getMonthName(selectedDate)}</LatoText>
          <View style={styles.itemsContainer}>
            {getDayTodos.length > 0 ? (
              getDayTodos.map((item, index) => (
                <ReminderItem 
                  key={index}
                  item={item}
                  isManagePet={true}
                  onClick={() => [setSelectedReminder(item), setIsReminderModalVisible(true)]}
                  onLongPress={() => [setSelectedReminder(item), setIsRemoveReminderModalVisible(true)]}
                />
              ))
              ) : (
              <View style={styles.noDataContainer}>
                <MaterialCommunityIcons name="calendar-remove" size={45} color="#555151" />
                <LatoText style={styles.noDataTitle}>No hay eventos para este día</LatoText>
                <LatoText style={styles.noDataDesc}>Programa recordatorios de medicación, citas veterinarias o cualquier actividad para tus mascotas.</LatoText>
                <TouchableOpacity activeOpacity={0.9} onPress={() => setIsAddReminderVisible(true)}>
                  <LatoText style={styles.noDataClick}>¡Agrega uno!</LatoText>
                </TouchableOpacity>
              </View>
              )
            }
          </View>
        </View>
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
    justifyContent: 'center',
    marginBottom: 20,
  },
  roundedButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
    marginTop: -5,
    marginRight: 0,
  },
  title: {
    fontSize: 24,
    color: '#191717',
  },
  bottomContainer: {
    width: '100%',
  },
  dateTitle: {
    fontSize: 16,
    color: '#191717',
    fontWeight: 'bold',
  },
  itemsContainer: {
    width: '100%',
    marginTop: 10,
    marginBottom: 55,
    gap: 10,
  },
  noDataContainer: {
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataTitle: {
    fontSize: 18,
    color: '#191717',
    marginTop: 10,
    fontWeight: 'bold',
  },
  noDataDesc: {
    fontSize: 15,
    color: '#191717',
    marginTop: 15,
    textAlign: 'center',
  },
  noDataClick: {
    fontSize: 15,
    color: '#458AC3',
    marginTop: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default CalendarScreen;