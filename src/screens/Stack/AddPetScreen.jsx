import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, ScrollView } from 'react-native'
import React, { useState } from 'react'
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import LatoText from '../../components/Fonts/LatoText'
import * as ImagePicker from 'expo-image-picker';
import { useToast } from 'react-native-toast-notifications'

const AddPetScreen = ({navigation}) => {
  const [step, setStep] = useState(0);

  const [petData, setPetData] = useState({
    image: null,
    name: '',
    type: '',
  });

  const toast = useToast();

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      toast.show('La aplicación no tiene permiso de camara', {type: 'danger'});
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setPetData({...petData, image: result.assets[0].uri});
    }
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep(prev => prev + 1);
    } else {
      //navigation.navigate('Register', {});
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    } else {
      //navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.page}>
        <View style={styles.headerContainer}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#191717" onPress={() => navigation.goBack()} />
            <View style={styles.headerRow}>
              <TouchableOpacity activeOpacity={0.8} style={styles.roundedItem} onPress={() => {}}>
                <MaterialIcons name="add" size={24} color="#EF9B93" onPress={() =>{}} />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.8} style={styles.roundedItem} onPress={() => {}}>
                <MaterialIcons name="edit" size={24} color="#EF9B93" onPress={() =>{}} />
              </TouchableOpacity>
            </View>
        </View>
        <View style={styles.petdata}>
          {
            step === 0 ? (
              <>
                <TouchableOpacity style={styles.imagePicker} activeOpacity={0.8} onPress={() => pickImage()}>
                  {petData.image ? (
                    <Image source={{ uri: petData.image }} style={styles.image} />
                  ) : (
                    <MaterialIcons name="add-a-photo" size={24} color="#242222" />
                  )}
                </TouchableOpacity>
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="pen" size={24} color="#242222" />
                  <TextInput 
                    placeholder='Nombre de la mascota...'
                    value={petData.name}
                    onChangeText={text => setPetData({...petData, name: text})}
                    style={styles.input}
                  />
                </View>
              </>
            ) : step === 1 ? (
              <Text>Step 2: Add Pet Details</Text>
            ) : step === 2 ? (
              <Text>Step 3: Add Pet Image</Text>
            ) : (
              <Text>Step 4: Review and Submit</Text>
            )
          }
          <View style={styles.buttonsContainer}>
            <TouchableOpacity activeOpacity={0.8} style={styles.nextButton} onPress={handleNextStep}>
              <LatoText style={styles.nextButtonText}>Siguiente</LatoText>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} style={styles.button} onPress={handleBack}>
              {step > 0 && <LatoText style={styles.buttonText}>Anterior</LatoText>}
            </TouchableOpacity>
          </View>
        </View>
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
  petdata: {
    flex: 1,
    marginTop: -55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    paddingHorizontal: 5,
    gap: 15,
  },
  nextButton: {
    width: '90%',
    alignItems: 'center',
    padding: 10,
    paddingVertical: 15,
    borderRadius: 99,
    marginTop: 10,
    backgroundColor: '#458AC3',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 20,
  },
  buttonText: {
    color: '#191717',
    fontSize: 20,
  },
  imagePicker: {
    width: 145,
    height: 145,
    borderRadius: 99,
    overflow: 'hidden',
    marginBottom: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 99,
  },
  inputContainer: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderWidth: 1,
    borderColor: 'transparent',
    padding: 15,
    paddingVertical: 12,
    gap: 10,
    borderRadius: 99,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 10,
  },
});

export default AddPetScreen;