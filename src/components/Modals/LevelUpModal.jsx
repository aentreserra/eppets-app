import { View, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect, useRef } from 'react';
import Modal from 'react-native-modal';
import { useLevelUpModal } from '../../context/LevelUpModalContext';
import ConfettiCannon from 'react-native-confetti-cannon';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LatoText from '../Fonts/LatoText';

const LevelUpModal = () => {
  const {isModalVisible, hideLevelUpModal, levelUpInfo} = useLevelUpModal();
  const confettiRef = useRef(null);

  useEffect(() => {
    if (isModalVisible && confettiRef.current) {
      confettiRef.current.start();
    }
  }, [isModalVisible]);

  if (!levelUpInfo) {
    return null;
  }

  const { newLevel, oldLevel } = levelUpInfo;

  return (
    <Modal
      isVisible={isModalVisible}
      onBackButtonPress={hideLevelUpModal}
      onBackdropPress={hideLevelUpModal}
      animationIn="fadeIn"
      animationOut="fadeOut"
      backdropTransitionOutTiming={0}
      useNativeDriverForBackdrop
    >
      <ConfettiCannon 
        ref={confettiRef}
        count={200}
        origin={{x: 0, y: 0}}
        autoStart={false}
        fallSpeed={2000}
        explosionSpeed={200}
        fadeOut={true}
      />
      <View style={styles.modalContainer}>
        <View style={styles.absoluteCircle}>
          <MaterialCommunityIcons name="trophy-award" size={60} color="#EF9B93" />
        </View>
        <LatoText style={styles.title}>¡Has subido de Nivel!</LatoText>
        <LatoText style={styles.message}>Nivel {oldLevel} → Nivel {newLevel}</LatoText>

        <TouchableOpacity activeOpacity={0.8} onPress={hideLevelUpModal} style={styles.button}>
          <LatoText style={styles.buttonText}>¡Genial!</LatoText>
        </TouchableOpacity>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#EEEAE8',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    alignSelf: 'center',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#191717',
    marginTop: 45,
    marginBottom: 10,
  },
  message: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    color: '#555151',
  },
  button: {
    padding: 15,
    paddingHorizontal: 30,
    backgroundColor: '#EF9B93',
    borderRadius: 99
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
  },
});

export default LevelUpModal;