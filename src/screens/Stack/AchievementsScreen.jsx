import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import LatoText from '../../components/Fonts/LatoText';
import Modal from 'react-native-modal';
import { getItem, removeItem, storeItem } from '../../utils/storage';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { useUser } from '../../context/UserContext';
import { calculateLevelFromXP } from '../../utils/levelManager';

const AchievementsScreen = ({navigation}) => {

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userLevel, setUserLevel] = useState(0);
  const [userProgressBar, setUserProgressBar] = useState(0);

  const {user} = useUser();

  useEffect(() => {
    getFirstTimeTutorial();
    getUserLevel();
  }, []);

  /**
   * Función para mostrar el turorial para primera vez que se entra a la pantalla
   */
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

  /**
   * Función para calcular el nivel del usuario a partir de su XP
   */
  const getUserLevel = () => {
    const userXp = user?.xp || 0;

    console.log('User XP: ', userXp);

    const {level, progressBar} = calculateLevelFromXP(userXp);
    setUserLevel(level);
    setUserProgressBar(progressBar);
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
          <LatoText style={styles.levelText}>{userLevel}</LatoText>
          <View style={styles.levelBarContainer}>
            <View style={[styles.levelBar, {width: `${userProgressBar}%`}]}/>
          </View>
        </View>
        <View style={styles.rewardsContainer}>
          <View style={[styles.rewardItem, {backgroundColor: userLevel >= 5 ? '#F6F6F6' : '#F6F6F680'}]}>
            <View style={styles.rewardIcon}>
              <MaterialCommunityIcons name="plus-circle-multiple" size={24} color="#FFF" />
            </View>
            <View>
              <LatoText style={styles.rewardTitle}>Sube de nivel para crear eventos</LatoText>
              <LatoText style={styles.rewardDesc}>Alcanza el nivel 5 en tu cuenta para poder crear eventos propios</LatoText>
            </View>
          </View>
        </View>
      </ScrollView>
      <Modal 
        isVisible={isModalVisible}
        onBackdropPress={() => setIsModalVisible(false)}
        onBackButtonPress={() => setIsModalVisible(false)}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropTransitionOutTiming={0}
        useNativeDriverForBackdrop
      >
        <View style={styles.modalContainer}>
          <LatoText style={styles.modalTitle}>Ayuda</LatoText>
          <LatoText style={styles.modalText}>En esta pantalla puedes ver tu nivel de la cuenta. Este te servirá para ir desbloqueando funcionalidades a medida que vas subiendo de nivel.</LatoText>
          <LatoText style={styles.modalText}>Para poder subir de nivel solamente tienes que usar la aplicación, crear recordatorios, añadir tus mascotas, ¡y cuidarlas bien!</LatoText>
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
  rewardsContainer: {
    width: '100%',
    marginTop: 10,
    marginBottom: 50,
  },
  rewardItem: {
    width: '100%',
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    padding: 20,
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
  },
  rewardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EF9B93',
  },
  rewardTitle: {
    fontSize: 16,
    color: '#191717',
    fontWeight: 'bold',
    maxWidth: '95%',
  },
  rewardDesc: {
    fontSize: 14,
    color: '#242222',
    marginTop: 5,
    maxWidth: '95%',
  },
});

export default AchievementsScreen;