import { View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import LatoText from '../../components/Fonts/LatoText'
import DateTimePicker, {useDefaultStyles} from 'react-native-ui-datepicker'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { getTimeStampInHours, getDayName, getMonthName } from '../../utils/shared'

const CalendarScreen = () => {

  const defaultDatePickerStyles = useDefaultStyles();

  const [selectedDate, setSelectedDate] = useState(new Date());

  const [userTodos, setUserTodos] = useState([
    {todoType: 'Vacuna', todoName: 'Vacuna de rabia', todoTimeStamp: new Date("2024-04-25T17:58:00").getTime(), todoDesc: 'Vacuna de rabia para Luna', petIcon: 'https://dynamoprojects.com/wp-content/uploads/2022/12/no-image.jpg', petName: 'Luna', id: 1},
    {todoType: 'Vacuna', todoName: 'Vacuna de rabia', todoTimeStamp: new Date("2025-04-25T17:58:00").getTime(), todoDesc: 'Vacuna de rabia para Luna', petIcon: 'https://dynamoprojects.com/wp-content/uploads/2022/12/no-image.jpg', petName: 'Luna', id: 1},
    {todoType: 'Píldora', todoName: 'Píldora de desparacitación', todoTimeStamp: new Date("2025-04-26T18:06:00").getTime(), todoDesc: 'Píldora de desparacitación para Luna', petIcon: 'https://dynamoprojects.com/wp-content/uploads/2022/12/no-image.jpg', petName: 'Luna', id: 2},
    {todoType: 'Cita', todoName: 'Cita con el veterinario', todoTimeStamp: new Date("2025-04-26T19:25:00").getTime(), todoDesc: 'Cita con el veterinario para Luna', petIcon: 'https://dynamoprojects.com/wp-content/uploads/2022/12/no-image.jpg', petName: 'Luna', id: 3},
  ]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  }

  const getDayTodos = userTodos.filter(item => {
    const date = new Date(item.todoTimeStamp);
    return date.getDate() === selectedDate.getDate() && date.getMonth() === selectedDate.getMonth() && date.getFullYear() === selectedDate.getFullYear();
  });

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <LatoText style={styles.title}>Calendario</LatoText>
        </View>
        <DateTimePicker 
          mode='single'
          multiRangeMode={false}
          date={selectedDate}
          onChange={({date}) => handleDateChange(date)}
          styles={{
            ...defaultDatePickerStyles,
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
            {getDayTodos.length > 1 ? (
              getDayTodos.map((item) => (
                <Item 
                  key={item.id}
                  todoType={item.todoType}
                  todoName={item.todoName}
                  todoTimeStamp={item.todoTimeStamp}
                  todoDesc={item.todoDesc}
                  petIcon={item.petIcon}
                  petName={item.petName}
                  id={item.id}
                />
              ))
              ) : (
              <View style={styles.noDataContainer}>
                <MaterialCommunityIcons name="calendar-remove" size={45} color="#555151" />
                <LatoText style={styles.noDataTitle}>No hay eventos para este día</LatoText>
                <LatoText style={styles.noDataDesc}>Programa recordatorios de medicación, citas veterinarias o cualquier actividad para tus mascotas.</LatoText>
                <TouchableOpacity activeOpacity={0.9} >
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

const Item = ({todoType, todoName, todoTimeStamp, todoDesc, petIcon, petName, id}) => (
  <View style={styles.itemContainer}>
    <View style={styles.itemTopContainer}>
      <View style={styles.itemImageContainer}>
        <Image source={{uri: petIcon}} style={styles.itemImage} />
        <View style={styles.itemIconContainer}>
          <MaterialCommunityIcons name={todoType === "pill" ? "pill" : todoType === "date" ?  "calendar-heart" : "needle"} size={16} color="#EF9B93" />
        </View>
      </View>
      <View style={styles.itemMiddleContainer}>
        <LatoText numberOfLines={1} style={styles.todoName}>{todoName}</LatoText>
        <LatoText numberOfLines={1} style={styles.todoInfo}>{petName} · {getTimeStampInHours(todoTimeStamp)}</LatoText>
      </View>
      <View>
        <LatoText style={styles.seeMoreText}>Ver más <MaterialCommunityIcons name='arrow-right' /></LatoText>
      </View>
    </View>
    <View style={styles.itemDescContainer}>
      <LatoText numberOfLines={3} style={styles.descText}>{todoDesc}</LatoText>
    </View>
  </View>
);

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
    marginBottom: 50,
  },
  itemContainer: {
    backgroundColor: '#F6F6F6',
    borderRadius: 15,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#00000050',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemTopContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemImageContainer: {
    position: 'relative',
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#FFF',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  itemIconContainer: {
    position: 'absolute',
    bottom: 1,
    right: -1,
    width: 21,
    height: 21,
    borderRadius: 99,
    backgroundColor: '#EDDFD0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemMiddleContainer: {
    width: '100%',
    paddingLeft: 10,
    justifyContent: 'center',
    flex: 1,
  },
  todoName: {
    fontSize: 15,
    color: '#191717',
  },
  todoInfo: {
    fontSize: 13,
    color: '#555151',
  },
  seeMoreText: {
    fontSize: 12,
    color: '#555151',
  },
  itemDescContainer: {
    width: '100%',
    marginTop: 10,
  },
  descText: {
    fontSize: 13,
    color: '#191717',
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