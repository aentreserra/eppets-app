import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import LatoText from '../../components/Fonts/LatoText';
import { MaterialIcons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { emailChecker } from '../../utils/shared';
import { useToast } from 'react-native-toast-notifications';
import functions from '@react-native-firebase/functions';
import { storeItem, storeSecureItem } from '../../utils/storage';
import { SECURE_STORAGE_KEYS, STORAGE_KEYS } from '../../constants/storageKeys';
import { useUser } from '../../context/UserContext';
import { callFirebaseFunction } from '../../services/backendCall';
import { firebase } from '@react-native-firebase/messaging'

const RegisterScreen = ({navigation, route}) => {

  const {email} = route.params || {};

  const {updateUser} = useUser();

  const toast = useToast();

  const [userInput, setUserInput] = useState({
    username: '',
    email: email || '',
    password: '',
    validation: false
  });

  const [errors, setErrors] = useState('');

  const handleRegister = async () => {
    if (userInput.username.length < 3) {
      toast.show('El nombre de usuario debe tener al menos 3 caracteres', {type: 'danger'});
      setErrors('user');
      return;
    }
    if (!emailChecker(userInput.email)) {
      toast.show('El email no es válido', {type: 'danger'});
      setErrors('mail');
      return;
    }
    if (userInput.password.length < 6) {
      toast.show('La contraseña debe tener al menos 6 caracteres', {type: 'danger'});
      setErrors('password');
      return;
    }
    if (!userInput.validation) {
      toast.show('Debes aceptar los términos de uso y la política de privacidad', {type: 'danger'});
      setErrors('validation');
      return;
    }

    const fcmToken = await firebase.messaging().getToken();

    const formattedData = {
      name: userInput.username,
      email: userInput.email,
      password: userInput.password,
      fcm: fcmToken,
    };

    // TODO !! ENVIAR FCM TOKEN
    const response = await callFirebaseFunction('createUserAttempt', formattedData, toast);

    if (response.success) {
      const userProfile = {
        name: userInput.username,
        email: userInput.email,
      };

      await storeSecureItem(SECURE_STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      await storeItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(userProfile));

      updateUser({
        ...userProfile,
        accessToken: response.accessToken,
        accessTokenExpiration: new Date().getTime() + 900000,
      });

      navigation.replace('MainTabs');
    }
  };

  const handleChangeText = (key, value) => {
    setUserInput(prevState => ({...prevState, [key]: value}));
    setErrors('');
  };

  const handleGoToLogin = () => {
    if (emailChecker(userInput.email)) {
      navigation.navigate('Login', {email: userInput.email});
    }
    else {
      navigation.navigate('Login', {});
    }
  };

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.topContainer}>
        <LatoText style={styles.title}>Crea una nueva Cuenta</LatoText>
        <LatoText style={styles.desc}>Crea una cuenta para empezar a usar la app</LatoText>
      </View>
      <View style={styles.formContainer}>
        <View style={[styles.inputContainer, {borderColor: errors === 'user' ? 'red' : 'transparent'}]}>
          <MaterialIcons name="person-outline" size={27} color="#191717" />
          <TextInput 
            placeholder='Nombre de usuario...'
            keyboardType='default'
            value={userInput.username}
            onChangeText={text => handleChangeText('username', text)}
            style={styles.input}
          />
        </View>
        <View style={[styles.inputContainer, {borderColor: errors === 'mail' ? 'red' : 'transparent'}]}>
          <MaterialIcons name="mail-outline" size={27} color="#191717" />
          <TextInput 
            placeholder='Email...'
            keyboardType='email-address'
            autoCapitalize='none'
            value={userInput.email}
            onChangeText={text => handleChangeText('email', text)}
            style={styles.input}
          />
        </View>
        <View style={[styles.inputContainer, {borderColor: errors === 'password' ? 'red' : 'transparent'}]}>
          <MaterialIcons name="lock-outline" size={27} color="#191717" />
          <TextInput 
            placeholder='Contraseña...'
            keyboardType='default'
            secureTextEntry={true}
            autoCapitalize='none'
            autoComplete='off'
            value={userInput.password}
            onChangeText={text => handleChangeText('password', text)}
            style={styles.input}
          />
        </View>
        <View style={[styles.inputContainer, {backgroundColor: 'transparent', marginTop: -10}]}>
          <Checkbox
            value={userInput.validation}
            onValueChange={value => handleChangeText('validation', value)}
            color={userInput.validation ? '#458AC3' : undefined}
            style={[styles.checkbox, {borderColor: errors === 'validation' ? 'red' : '#1E1E1E'}]}
          />
          <LatoText style={styles.registerPolicy}>Acepta los términos de uso y la política de privacidad para poder crear una cuenta</LatoText>
        </View>
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity activeOpacity={0.8} style={styles.submitButton} onPress={handleRegister}>
          <LatoText style={styles.submitButtonText}>Registrarse</LatoText>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8} style={styles.goToLoginButton} onPress={handleGoToLogin}>
          <LatoText style={styles.goToLoginButtonText}>¿Ya tienes cuenta? <LatoText style={styles.colorChange}>Inicia sesión</LatoText></LatoText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEEAE8',
    padding: 13,
  },
  topContainer: {
    alignItems: 'flex-start',
    width: '100%',
  },
  title: {
    fontSize: 40,
    color: '#191717',
  },
  desc: {
    fontSize: 14,
    marginVertical: 10,
    color: '#555151',
  },
  formContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
    paddingHorizontal: 5,
    gap: 15,
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: 'transparent',
    padding: 15,
    paddingVertical: 12,
    borderRadius: 99,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  input: {
    width: '100%',
    paddingLeft: 10,
    fontSize: 15,
    color: '#555050',
    fontFamily: 'Lato-Regular',
  },
  checkbox: {
    borderRadius: 5,
    borderWidth: 1,
    backgroundColor: '#F6F6F6',
    height: 24,
    width: 24,
  },
  registerPolicy: {
    fontSize: 13,
    color: '#555050',
    marginLeft: 10,
    maxWidth: '90%',
  },
  buttonsContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitButton: {
    width: '100%',
    alignItems: 'center',
    padding: 10,
    paddingVertical: 20,
    borderRadius: 99,
    marginTop: 10,
    backgroundColor: '#458AC3',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 20,
  },
  goToLoginButton: {
    marginTop: 15,
  },
  goToLoginButtonText: {
    color: '#555151',
    fontSize: 16,
  },
  colorChange: {
    color: '#458AC3',
  },
});

export default RegisterScreen;