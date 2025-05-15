import { View, Text, StyleSheet, ScrollView, Dimensions, Touchable, TouchableOpacity, Linking } from 'react-native';
import Modal from 'react-native-modal';
import LatoText from '../Fonts/LatoText';
import { formattedDateDayMonthYear } from '../../utils/shared';

const {height} = Dimensions.get('window');

const MedicalRecordsInfoModal = ({isVisible, item, onClose}) => {
  if (!item) return null;
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modalContainer}
      animationIn='fadeInUp'
      animationOut='fadeOutDown'
      backdropTransitionOutTiming={0}
      useNativeDriverForBackdrop
    >
      <ScrollView style={styles.scrollViewStyle} contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.modalContent}>
          <LatoText style={styles.title}>Historial Clinico</LatoText>
          <View style={styles.itemContainer}>
            <LatoText style={styles.text}>Fecha:</LatoText>
            <LatoText style={styles.text}>{formattedDateDayMonthYear(item.visit_date)}</LatoText>
          </View>
          {
            item.vet_name && (
              <View style={styles.itemContainer}>
                <LatoText style={styles.text}>Veterinario:</LatoText>
                <LatoText style={styles.text}>{item.vet_name}</LatoText>
              </View>
            )
          }
          <View style={styles.itemContainer}>
            <LatoText style={styles.text}>Diagnostico:</LatoText>
            <LatoText style={styles.text}>{item.diagnosis}</LatoText>
          </View>
          {
            item.treatment && (
              <View style={styles.itemContainer}>
                <LatoText style={styles.text}>Tratamiento:</LatoText>
                <LatoText style={styles.text}>{item.treatment}</LatoText>
              </View>
            )
          }
          {
            item.notes && (
              <View style={styles.itemContainer}>
                <LatoText style={styles.text}>Notas:</LatoText>
                <LatoText style={styles.text}>{item.notes}</LatoText>
              </View>
            )
          }
          {
            item.document_url && (
              <View style={styles.itemContainer}>
                <TouchableOpacity onPress={() => Linking.openURL(item.document_url)} activeOpacity={0.8} style={styles.openButton}>
                  <LatoText style={styles.btnText}>Abrir documento</LatoText>
                </TouchableOpacity>
              </View>
            )
          }
          <TouchableOpacity onPress={onClose} activeOpacity={0.8} style={[styles.openButton, {marginTop: 10}]}>
            <LatoText style={styles.btnText}>Cerrar</LatoText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  scrollViewStyle: {
    maxHeight: height * 0.7,
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
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 19,
    color: '#191717',
    textAlign: 'center',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: '#191717',
    marginBottom: 5,
    maxWidth: '85%',
  },
  openButton: {
    flex: 1,
    backgroundColor: '#EF9B93',
    padding: 10,
    borderRadius: 99,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 16,
    color: '#FFF',
  },
});

export default MedicalRecordsInfoModal;