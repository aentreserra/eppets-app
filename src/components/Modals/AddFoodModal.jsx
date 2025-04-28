import { View, StyleSheet, Dimensions, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import Modal from 'react-native-modal';
import LatoText from '../Fonts/LatoText';
import Checkbox from 'expo-checkbox';

const { height } = Dimensions.get('window');

const AddFoodModal = ({searchTerm, isVisible, setIsVisible}) => {

  const [userInput, setUserInput] = useState({
    foodName: searchTerm,
    dog: false,
    cat: false,
    rabbit: false,
    rodent: false,
    fish: false,
    turtle: false,
    bird: false,
  });

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={() => setIsVisible(false)}
      swipeDirection="down"
      onSwipeComplete={() => setIsVisible(false)}
      propagateSwipe={true}
      style={styles.modalContainer}
    >
      <View style={[styles.modalContent, { height: height * 0.75 }]}>
        <View style={styles.inputContainer}>
          <LatoText style={styles.modalTitle}>Nombre del alimento: </LatoText>
          <TextInput
            placeholder='Ej: Zanahoria'
            placeholderTextColor="#ADA9A7"
            value={userInput.foodName}
            onChangeText={(text) => setUserInput({...userInput, foodName: text})}
            style={styles.input}
          />
        </View>
        <LatoText style={styles.questionText}>¿Para qué mascotas es adecuado?</LatoText>
        <View style={styles.checkerContainer}>
          <Checkbox
            value={userInput.dog}
            onValueChange={value => setUserInput({...userInput, dog: value})}
            color={userInput.dog ? '#458AC3' : undefined}
            style={styles.checkbox}
          />
          <LatoText style={styles.modalTitle}>Apto para Perros</LatoText>
        </View>
        <View style={styles.checkerContainer}>
          <Checkbox
            value={userInput.cat}
            onValueChange={value => setUserInput({...userInput, cat: value})}
            color={userInput.cat ? '#458AC3' : undefined}
            style={styles.checkbox}
          />
          <LatoText style={styles.modalTitle}>Apto para Gatos</LatoText>
        </View>
        <View style={styles.checkerContainer}>
          <Checkbox
            value={userInput.rabbit}
            onValueChange={value => setUserInput({...userInput, rabbit: value})}
            color={userInput.rabbit ? '#458AC3' : undefined}
            style={styles.checkbox}
          />
          <LatoText style={styles.modalTitle}>Apto para Conejos</LatoText>
        </View>
        <View style={styles.checkerContainer}>
          <Checkbox
            value={userInput.rodent}
            onValueChange={value => setUserInput({...userInput, rodent: value})}
            color={userInput.rodent ? '#458AC3' : undefined}
            style={styles.checkbox}
          />
          <LatoText style={styles.modalTitle}>Apto para Roedores</LatoText>
        </View>
        <View style={styles.checkerContainer}>
          <Checkbox
            value={userInput.fish}
            onValueChange={value => setUserInput({...userInput, fish: value})}
            color={userInput.fish ? '#458AC3' : undefined}
            style={styles.checkbox}
          />
          <LatoText style={styles.modalTitle}>Apto para Peces</LatoText>
        </View>
        <View style={styles.checkerContainer}>
          <Checkbox
            value={userInput.turtle}
            onValueChange={value => setUserInput({...userInput, turtle: value})}
            color={userInput.turtle ? '#458AC3' : undefined}
            style={styles.checkbox}
          />
          <LatoText style={styles.modalTitle}>Apto para Tortugas</LatoText>
        </View>
        <View style={styles.checkerContainer}>
          <Checkbox
            value={userInput.bird}
            onValueChange={value => setUserInput({...userInput, bird: value})}
            color={userInput.bird ? '#458AC3' : undefined}
            style={styles.checkbox}
          />
          <LatoText style={styles.modalTitle}>Apto para Aves</LatoText>
        </View>
        <TouchableOpacity activeOpacity={0.9} onPress={() => setIsVisible(false)} style={styles.saveButton}>
          <LatoText style={styles.saveButtonText}>Guardar</LatoText>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.9} onPress={() => setIsVisible(false)}>
          <LatoText style={styles.closeText}>Cerrar</LatoText>
        </TouchableOpacity>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: '#EEEAE8',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 16,
    color: '#191717',
  },
  questionText: {
    fontSize: 16,
    color: '#191717',
    marginTop: 20,
    marginBottom: 10,
  },
  inputContainer: {
    width: '100%',
    gap: 10,
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
  checkerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
    marginTop: 20,
  },
  checkbox: {
    borderRadius: 5,
    borderWidth: 1,
    backgroundColor: '#F6F6F6',
    height: 24,
    width: 24,
  },
  saveButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#458AC3',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
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

export default AddFoodModal;