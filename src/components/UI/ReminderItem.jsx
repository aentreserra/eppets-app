import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import LatoText from '../Fonts/LatoText'
import { getItem } from '../../utils/storage';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ReminderItem = ({item, isManagePet, onClick, onLongPress}) => {

  const [petName, setPetName] = useState('');

  useEffect(() => {
    getPetName(item.pet_id);
  }, []);

  /**
   * Función para obtener el nombre del animal a partir de su id
   * @param {number} petId - Id del animal 
   */
  const getPetName = async (petId) => {
    const petData = await getItem(STORAGE_KEYS.PETS_PROFILE);
    try {
      if (petData) {
        const parsedPetData = JSON.parse(petData) || [];
        const exactPet = parsedPetData.filter(item => item.id == petId);
        if (exactPet.length < 1) return;
        setPetName(exactPet[0].name);
      }
    } catch (error) {
      console.error("Error fetching pet data:", error);
    }
  };

  /**
   * Función para formatear la fecha del recordatorio
   * @param {string} date
   * @returns {string} - Fecha formateada
   */
  const getReminderDate = (date) => {
    const dateObj = new Date(date);

    const isToday = dateObj.getDate() === new Date().getDate() && dateObj.getMonth() === new Date().getMonth() && dateObj.getFullYear() === new Date().getFullYear();

    return isToday ? `Hoy - ${dateObj.getHours()}:${dateObj.getMinutes()}` : `${dateObj.getDate()}-${dateObj.getMonth() + 1}-${dateObj.getFullYear()} - ${dateObj.getHours()}:${dateObj.getMinutes()}`;
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={onClick}
      onLongPress={onLongPress}
      style={[
        styles.reminderContainer, 
        {
          backgroundColor: isManagePet ? '#F6F6F6' : 'transparent',
          padding: isManagePet ? 10 : 0
        }
      ]}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons 
          name={
            item.reminder_type === 0 ? "pill"
            : item.reminder_type === 1 ? "calendar-heart" 
            : "needle"
          } 
          size={30} 
          color="#EF9B93" />
      </View>
      <View>
        <LatoText style={styles.reminderTitle}>{item.title}</LatoText>
        <LatoText style={styles.reminderDesc}>{petName} · {getReminderDate(item.next_trigger_datetime_utc)}</LatoText>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  reminderContainer: {
    width: '100%',
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 10,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 99,
    backgroundColor: '#EDDFD0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderTitle: {
    fontSize: 17,
    color: '#191717',
  },
  reminderDesc: {
    fontSize: 14,
    color: '#242222',
    fontFamily: 'Lato-Light',
  },
});

export default ReminderItem;