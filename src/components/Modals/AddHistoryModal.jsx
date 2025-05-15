import { View, StyleSheet, ScrollView, Dimensions, TextInput, Keyboard, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import Modal from 'react-native-modal';
import LatoText from '../Fonts/LatoText';
import DateTimePicker, {useDefaultStyles} from 'react-native-ui-datepicker';
import { formattedDateDayMonthYear } from '../../utils/shared';
import * as DocumentPicker from 'expo-document-picker';
import { useToast } from 'react-native-toast-notifications';
import { tokenRefreshWrapper } from '../../services/tokenRefreshWrapper';
import { useUser } from '../../context/UserContext';
import { useLevelUpModal } from '../../context/LevelUpModalContext';
import { getItem, storeItem } from '../../utils/storage';
import { STORAGE_KEYS } from '../../constants/storageKeys';

const {height} = Dimensions.get('window');

const BUCKET_NAME = "eppets-4b8cb.firebasestorage.app";

const AddHistoryModal = ({ isVisible, onClose, defaultPet }) => {

  const [isLoading, setIsLoading] = useState(false);

  const [visitDate, setVisitDate] = useState(new Date());
  const [vetName, setVetName] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [notes, setNotes] = useState('');
  const [document, setDocument] = useState(null);

  const [isSelectingDate, setIsSelectingDate] = useState(false);

  const [error, setError] = useState(null);

  const {user, refreshUser, updateUser} = useUser();
  const {showLevelUpModal} = useLevelUpModal();
  const toast = useToast();
  const defaultDatePickerStyles = useDefaultStyles('light');

  const handleVetNameAutoComplete = (text) => {
    setVetName(text);
  };

  const handleConfirmDate = ({date}) => {
    setVisitDate(date);
    setIsSelectingDate(false);
  };

  const handleDocumentSelection = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['aplication/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const selectedDocument = result.assets[0];
        if (selectedDocument.size > 5 * 1024 * 1024) {
          setError('document-size');
          return;
        }
        setDocument(selectedDocument);
      }
    } catch (error) { 
      console.error('Error selecting document:', error);
      setError('document');
    }
  };

  const handleSubmit = async () => {
    if (diagnosis.length < 3) {
      setError('diagnosis');
      return;
    }

    try {
      setIsLoading(true);

      let finalDocUrl = null;

      if (document !== null) {
        console.log('Document selected:', document);
        const formattedDocData = {
          filename: document.name,
          contentType: document.type,
          petId: defaultPet.id,
        };
        const uploadedResponse = await tokenRefreshWrapper('generateUploadDocLink', formattedDocData, toast, user, refreshUser, updateUser, showLevelUpModal);

        if (uploadedResponse.success) {
          const signedUrl = uploadedResponse.signedUrl;

          const uploaded = await fetch(document.uri);
          if (!uploaded.ok) {
            toast.show('Error al subir la imagen', {type: 'danger'});
            return;
          }
          const blob = await uploaded.blob();
          
          const uploadResponse = await fetch(signedUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': document.type,
            },
            body: blob,
          });

          if (uploadResponse.ok) {
            const encodedFilePath = encodeURIComponent(uploadedResponse.filePath);
            finalDocUrl = `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/${encodedFilePath}?alt=media`;
          } else {
            toast.show('Error al subir el documento', {type: 'danger'});
            return;
          }
        }
      }

      const formattedData = {
        petId: defaultPet.id,
        visitDate: visitDate.toISOString(),
        vetName: vetName,
        diagnosis: diagnosis,
        treatment: treatment,
        notes: notes,
        documentUrl: finalDocUrl,
      };

      const response = await tokenRefreshWrapper('addMedicalRecord', formattedData, toast, user, refreshUser, updateUser, showLevelUpModal);

      console.log('Response from addMedicalRecord:', response);

      if (response.success) {
        const databaseFormattedData = {
          pet_id: defaultPet.id,
          visit_date: visitDate.toISOString(),
          vet_name: vetName,
          diagnosis: diagnosis,
          treatment: treatment,
          notes: notes,
          document_url: finalDocUrl,
          id: response.id,
        };

        const savedData = await getItem(STORAGE_KEYS.MEDICAL_RECORDS);

        try {
          const parsedData = JSON.parse(savedData) || [];
          const updatedData = [...parsedData, databaseFormattedData];
          await storeItem(STORAGE_KEYS.MEDICAL_RECORDS, JSON.stringify(updatedData));

          toast.show('Historial guardado correctamente', { type: 'success' });
          onClose();
        } catch (error) {
          console.error('Error parsing medical records data:', error);
        }
      } else {
        toast.show('Error al guardar el historial', { type: 'danger' });
      }

    } catch (error) {
      console.error('Error al guardar el historial:', error);
      toast.show('Error al guardar el historial', { type: 'danger' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal 
      isVisible={isVisible}
      onBackdropPress={!isLoading && onClose}
      onBackButtonPress={!isLoading && onClose}
      propagateSwipe={true}
      style={styles.modalContainer}
      animationIn='fadeInUp'
      animationOut='fadeOutDown'
      backdropTransitionOutTiming={0}
      useNativeDriverForBackdrop
    >
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollViewStyle} contentContainerStyle={styles.scrollViewStyle}>
        <View style={styles.modalContent}>
          <LatoText style={styles.title}>Agregar un historial para {defaultPet?.name}</LatoText>
          <View style={styles.inputContainer}>
            <LatoText style={styles.itemLabel}>Nombre del veterinario: </LatoText>
            <TextInput
              placeholder='Nombre del veterinario (opcional)...'
              placeholderTextColor="#ADA9A7"
              value={vetName}
              onChangeText={(text) => handleVetNameAutoComplete(text)}
              style={styles.input}
            />
          </View>
          <View style={styles.inputContainer}>
            <LatoText style={styles.itemLabel}>Diagnóstico: </LatoText>
            <TextInput
              placeholder='Diagnóstico...'
              placeholderTextColor="#ADA9A7"
              value={diagnosis}
              onChangeText={(text) => setDiagnosis(text)}
              style={styles.input}
            />
          </View>
          {error === 'diagnosis' && <LatoText style={styles.errorText}>Debes ingresar un diagnóstico válido.</LatoText>}
          <View style={styles.inputContainer}>
            <LatoText style={styles.itemLabel}>Tratamiento: </LatoText>
            <TextInput
              placeholder='Tratamiento (opcional)...'
              placeholderTextColor="#ADA9A7"
              value={treatment}
              onChangeText={(text) => setTreatment(text)}
              style={styles.input}
            />
          </View>
          <View style={styles.inputContainer}>
            <LatoText style={styles.itemLabel}>Notas: </LatoText>
            <TextInput
              placeholder='Notas (opcional)...'
              placeholderTextColor="#ADA9A7"
              value={notes}
              onChangeText={(text) => setNotes(text)}
              style={styles.input}
            />
          </View>
          <View style={styles.inputContainer}>
            <LatoText style={styles.itemLabel}>Fecha de la visita: </LatoText>
            <TouchableOpacity activeOpacity={0.8} onPress={() => [setIsSelectingDate(true), Keyboard.dismiss()]} style={styles.inputButton}>
              <LatoText style={styles.inputButtonText}>{formattedDateDayMonthYear(visitDate)}</LatoText>
            </TouchableOpacity>
            <Modal isVisible={isSelectingDate} onBackdropPress={() => setIsSelectingDate(false)} animationIn='fadeIn' animationOut='fadeOut'>
              <View style={styles.subModalContainer}>
                <DateTimePicker
                  mode='single'
                  locale='es-ES'
                  date={visitDate}
                  startDate={visitDate}
                  onChange={handleConfirmDate}
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
          </View>
          <View style={styles.inputContainer}>
            <LatoText style={styles.itemLabel}>Seleccionar documento: </LatoText>
            <TouchableOpacity activeOpacity={0.8} onPress={handleDocumentSelection} style={styles.inputButton}>
              <LatoText style={styles.inputButtonText}>{document ? document.name : 'Seleccionar PDF o Imagen'}</LatoText>
            </TouchableOpacity>
          </View>
          {error === 'document' && <LatoText style={styles.errorText}>Error al seleccionar el documento.</LatoText>}
          {error === 'document-size' && <LatoText style={styles.errorText}>El documento debe tener un tamaño máximo de 5MB.</LatoText>}
          <TouchableOpacity activeOpacity={0.8} onPress={!isLoading && handleSubmit} style={styles.saveButton}>
            <LatoText style={styles.saveButtonText}>Guardar</LatoText>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} onPress={!isLoading && onClose}>
            <LatoText style={styles.closeText}>Cerrar</LatoText>
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
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    gap: 10,
  },
  itemLabel: {
    fontSize: 16,
    color: '#191717',
    marginBottom: 2,
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
  inputButtonText: {
    fontSize: 16,
    color: '#FFF',
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
});

export default AddHistoryModal;