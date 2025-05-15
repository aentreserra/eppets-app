import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import Modal from 'react-native-modal';
import LatoText from '../Fonts/LatoText';
import { tokenRefreshWrapper } from '../../services/tokenRefreshWrapper';
import { useUser } from '../../context/UserContext';
import { useLevelUpModal } from '../../context/LevelUpModalContext';
import { useToast } from 'react-native-toast-notifications';

const RemoveReminderModal = ({data, isVisible, onClose}) => {
  const [isLoading, setIsLoading] = useState(false);

  const {user, refreshUser, updateUser} = useUser();
  const {showLevelUpModal} = useLevelUpModal();
  const toast = useToast();

  const handleRemove = async () => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      const response = await tokenRefreshWrapper('deleteReminder', {reminderId: data.id}, toast, user, refreshUser, updateUser, showLevelUpModal);

      if (response.success) {
        toast.show('Recordatorio eliminado con éxito', { type: 'success' });

        const updatedReminders = user.reminders.filter(item => item.id !== data.id);
        updateUser({...user, reminders: updatedReminders });

        onClose();
      } else {
        toast.show('Error al eliminar el recordatorio', { type: 'danger' });
        onClose();
      }
    } catch (error) {
      toast.show('Error al eliminar el recordatorio', { type: 'danger' });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={!isLoading && onClose}
      onBackButtonPress={!isLoading && onClose}
      animationIn='zoomIn'
      animationOut='zoomOut'
      backdropTransitionOutTiming={0}
      useNativeDriverForBackdrop
    >
      <View style={styles.modalContent}>
        <LatoText style={styles.title}>Eliminar Recordatorio</LatoText>
        <LatoText style={styles.description}>¿Estás seguro de que quieres eliminar este recordatorio?</LatoText>
        <TouchableOpacity activeOpacity={0.8} onPress={handleRemove} style={styles.btn}>
          <LatoText style={styles.btnText}>{isLoading ? 'Eliminando...' : 'Eliminar'}</LatoText>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8} onPress={!isLoading && onClose}>
          <LatoText style={styles.closeText}>Cancelar</LatoText>
        </TouchableOpacity>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: '#EEEAE8',
    padding: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
    color: '#191717',
  },
  description: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
    color: '#555151',
  },
  btn: {
    width: '100%',
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
  closeText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555151',
    textAlign: 'center',
  },
});

export default RemoveReminderModal