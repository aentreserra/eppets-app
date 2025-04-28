import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { emailChecker } from '../../utils/shared';
import LatoText from '../../components/Fonts/LatoText';
import { MaterialIcons } from '@expo/vector-icons';
import { useToast } from 'react-native-toast-notifications';
import { storeItem, storeSecureItem } from '../../utils/storage';
import { SECURE_STORAGE_KEYS, STORAGE_KEYS } from '../../constants/storageKeys';
import { useUser } from '../../context/UserContext';
import { callFirebaseFunction } from '../../services/backendCall';
import { firebase } from '@react-native-firebase/messaging'

const LoginScreen = ({navigation, route}) => {

  const {email} = route.params || {};
  
  const {updateUser} = useUser();

  const toast = useToast();

  const [userInput, setUserInput] = useState({
    email: email || '',
    password: ''
  });

  const [errors, setErrors] = useState('');

  const handleLogin = async () => {
    if (!emailChecker(userInput.email)) {
      toast.show('El email no es válido', {type: 'danger'});
      setErrors('mail');
      return;
    }
    if (userInput.password.length < 6) {
      toast.show('La contraseña no es correcta', {type: 'danger'});
      setErrors('password');
      return;
    }

    const fcmToken = await firebase.messaging().getToken();

    console.log('FCM Token: ', fcmToken);

    const formattedData = {
      email: userInput.email,
      password: userInput.password,
      fcm: fcmToken
    };
    const response = await callFirebaseFunction('loginUserAttempt', formattedData, toast);

    if (response.success) {
      const userProfile = {
        name: response.name,
        email: userInput.email,
      }

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

  const handleGoToRegister = () => {
    if (emailChecker(userInput.email)) {
      navigation.navigate('Register', {email: userInput.email});
    }
    else {
      navigation.navigate('Register', {});
    }
  };

  const handleForgotPassword = () => {

  };

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.topContainer}>
        <LatoText style={styles.title}>Accede a tu Cuenta</LatoText>
        <LatoText style={styles.desc}>Entra en tu cuenta para poder usar la app</LatoText>
      </View>
      <View style={styles.formContainer}>
        <View style={[styles.inputContainer, {borderColor: errors === 'mail' ? 'red' : 'transparent'}]}>
          <MaterialIcons name="mail-outline" size={27} color="#191717" />
          <TextInput 
            placeholder='Email...'
            keyboardType='email-address'
            autoCapitalize='none'
            value={userInput.email}
            onChangeText={text => setUserInput({...userInput, email: text})}
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
            onChangeText={text => setUserInput({...userInput, password: text})}
            style={styles.input}
          />
        </View>
        <TouchableOpacity style={styles.forgotPassword} activeOpacity={0.8} onPress={handleForgotPassword}>
          <LatoText style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</LatoText>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity activeOpacity={0.8} style={styles.submitButton} onPress={handleLogin}>
          <LatoText style={styles.submitButtonText}>Entrar</LatoText>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8} style={styles.goToRegisterButton} onPress={handleGoToRegister}>
          <LatoText style={styles.goToRegisterButtonText}>¿No tienes cuenta? <LatoText style={styles.colorChange}>Regístrate</LatoText></LatoText>
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
  forgotPassword: {
    width: '100%',
    marginTop: -10,
    marginRight: 20,
  },
  forgotPasswordText: {
    color: '#458AC3',
    fontSize: 14,
    textAlign: 'right',
    width: '100%',
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
  goToRegisterButton: {
    marginTop: 15,
  },
  goToRegisterButtonText: {
    color: '#555151',
    fontSize: 16,
  },
  colorChange: {
    color: '#458AC3',
  },
});

export default LoginScreen;