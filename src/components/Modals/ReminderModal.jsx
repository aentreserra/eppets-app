import { View, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import Modal from 'react-native-modal';
import LatoText from '../Fonts/LatoText';
import { formattedDateDayMonthYear } from '../../utils/shared';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ReminderModal = ({data, isVisible, setIsVisible}) => {

  return (
    <Modal 
      isVisible={isVisible}
      onBackdropPress={() => setIsVisible(false)}
      onBackButtonPress={() => setIsVisible(false)}
      animationIn='zoomIn'
      animationOut='zoomOut'
      backdropTransitionOutTiming={0}
      useNativeDriverForBackdrop
    >
      {data && (
        <View style={styles.modalContent}>
          <View style={styles.absoluteCircle}>
            <MaterialCommunityIcons 
              name={
                data.reminder_type === 0 ? "pill"
                : data.reminder_type === 1 ? "calendar-heart" 
                : "needle"
              } 
              size={60} 
              color="#EF9B93" 
            />
          </View>
          <LatoText style={styles.title}>{data.title}</LatoText>
          {data.body !== null && <LatoText style={styles.subtitle}>{data.body}</LatoText>}
          <LatoText style={styles.dateText}>{formattedDateDayMonthYear(data.next_trigger_datetime_utc)}</LatoText>

          <TouchableOpacity activeOpacity={0.8} onPress={() => setIsVisible(false)} style={styles.btn}>
            <LatoText style={styles.btnText}>Aceptar</LatoText>
          </TouchableOpacity>
        </View>
      )}
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContent: {
    position: 'relative',
    backgroundColor: '#EEEAE8',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  absoluteCircle: {
    position: 'absolute',
    top: -60,
    backgroundColor: '#EDDFD0',
    borderWidth: 5,
    borderColor: '#EEEAE8',
    width: 120,
    height: 120,
    borderRadius: 99,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginTop: 45,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#191717',
  },
  subtitle: {
    fontSize: 16,
    color: '#242222',
    marginBottom: 15,
  },
  dateText: {
    fontSize: 16,
    color: '#191717',
  },
  btn: {
    width: '90%',
    alignItems: 'center',
    padding: 10,
    paddingVertical: 15,
    borderRadius: 99,
    marginTop: 15,
    backgroundColor: '#EF9B93',
  },
  btnText: {
    fontSize: 16,
    color: '#FFF',
  },
  editText: {
    fontSize: 16,
    color: '#242222',
    marginTop: 10,
  },
});

export default ReminderModal;