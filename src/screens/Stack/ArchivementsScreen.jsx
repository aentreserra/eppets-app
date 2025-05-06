import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import LatoText from '../../components/Fonts/LatoText';
import Modal from 'react-native-modal';
import { getItem, removeItem, storeItem } from '../../utils/storage';
import { STORAGE_KEYS } from '../../constants/storageKeys';

const ArchivementsScreen = ({navigation}) => {

  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    getFirstTimeTutorial();
  }, []);

  const getFirstTimeTutorial = async () => {
    const item = await getItem(STORAGE_KEYS.FIRST_TIME_TUTORIAL);

    if (item) {
      const parsedItem = JSON.parse(item);
      setIsModalVisible(!parsedItem.archivements);

      const newItem = {
        ...parsedItem,
        archivements: true,
      }

      await storeItem(STORAGE_KEYS.FIRST_TIME_TUTORIAL, JSON.stringify(newItem));
    } else {
      const newItem = {
        archivements: true,
      }

      setIsModalVisible(true);

      await storeItem(STORAGE_KEYS.FIRST_TIME_TUTORIAL, JSON.stringify(newItem));
    }
  };

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#191717" onPress={() => navigation.goBack()} />
          <View style={styles.headerRow}>
            <TouchableOpacity activeOpacity={0.8} style={styles.roundedItem} onPress={() => setIsModalVisible(true)}>
              <MaterialIcons name="question-mark" size={24} color="#EF9B93" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.levelContainer}>
          <LatoText style={styles.levelLabelText}>NIVEL</LatoText>
          <LatoText style={styles.levelText}>5</LatoText>
          <View style={styles.levelBarContainer}>
            <View style={[styles.levelBar, {width: `80%`}]}/>
          </View>
        </View>
      </ScrollView>
      <Modal 
        isVisible={isModalVisible}
        onBackdropPress={() => setIsModalVisible(false)}
        onBackButtonPress={() => setIsModalVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
      >
        <View style={styles.modalContainer}>
          <LatoText style={styles.modalTitle}>Ayuda</LatoText>
          <LatoText style={styles.modalText}>En esta pantalla puedes ver tu nivel y logros, tus avances en la aplicación.</LatoText>
          <LatoText style={styles.modalText}>Para poder subir de nivel solamente tienes que usar la aplicación, crear recordatorios, añadir tus mascotas ¡y cuidarlas bien!</LatoText>
          <TouchableOpacity activeOpacity={0.8} onPress={() => setIsModalVisible(false)}>
            <LatoText style={styles.closeText}>Cerrar</LatoText>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

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
  levelContainer: {
    width: '100%',
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  levelLabelText: {
    fontSize: 13,
    color: '#191717',
  },
  levelText: {
    fontSize: 35,
    color: '#EF9B93',
    fontWeight: 'bold',
  },
  levelBarContainer: {
    width: '100%',
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    marginTop: 10,
    overflow: 'hidden',
  },
  levelBar: {
    height: '100%',
    backgroundColor: '#EF9B93',
    borderRadius: 2,
  },
  modalContainer: {
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    color: '#191717',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 15,
    color: '#191717',
    textAlign: 'center',
    marginBottom: 10,
  },
  closeText: {
    fontSize: 15,
    color: '#458AC3',
    fontWeight: 'bold',
    marginTop: 10,
  },
});

export default ArchivementsScreen;