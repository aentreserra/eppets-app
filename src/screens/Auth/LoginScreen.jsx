import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity, TextInput, Keyboard } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { emailChecker } from '../../utils/shared';
import LatoText from '../../components/Fonts/LatoText';
import { MaterialIcons } from '@expo/vector-icons';
import { useToast } from 'react-native-toast-notifications';
import { storeItem, storeSecureItem } from '../../utils/storage';
import { SECURE_STORAGE_KEYS, STORAGE_KEYS } from '../../constants/storageKeys';
import { useUser } from '../../context/UserContext';
import { callFirebaseFunction } from '../../services/backendCall';
import { firebase } from '@react-native-firebase/messaging';
import Modal from 'react-native-modal';

const LoginScreen = ({navigation, route}) => {

  const {email} = route.params || {};

  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
  const [changePasswordStep, setChangePasswordStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [userInput, setUserInput] = useState({
    email: email || '',
    password: ''
  });

  const [recoveryCode, setRecoveryCode] = useState('');
  const [tempAccessToken, setTempAccessToken] = useState('');

  const [errors, setErrors] = useState('');

  const {updateUser} = useUser();

  const toast = useToast();

  /**
   * Función para logear el usuario comprobando los datos de entrada
   */
  const handleLogin = async () => {
    Keyboard.dismiss();
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

    setIsLoading(true);

    try {
      const fcmToken = await firebase.messaging().getToken();

      console.log('FCM Token: ', fcmToken);

      const formattedData = {
        email: userInput.email,
        password: userInput.password,
        fcm: fcmToken
      };
      const response = await callFirebaseFunction('loginUserAttempt', formattedData, toast);

      if (response.success) {
        console.log('Login successful: ', response);
        const userProfile = {
          name: response.name,
          email: userInput.email,
          xp: response.userXp || 0,
        }

        await storeSecureItem(SECURE_STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
        await storeItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(userProfile));

        updateUser({
          ...userProfile, 
          accessToken: response.accessToken, 
          accessTokenExpiration: new Date().getTime() + 900000,
        });

        navigation.replace('MainTabs');
      } else {
        toast.show('Error al iniciar sesión', {type: 'danger'});
      }
    } catch (error) {
      console.log('Error: ', error);
      toast.show('Error al iniciar sesión', {type: 'danger'});
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Función para navegar a la pantalla de registro y pasar el email si es correcto
   */
  const handleGoToRegister = () => {
    if (emailChecker(userInput.email)) {
      navigation.navigate('Register', {email: userInput.email});
    }
    else {
      navigation.navigate('Register', {});
    }
  };

  /**
   * Función para recuperar contraseña
   */
  const handleForgotPassword = async () => {
    try {
      if (changePasswordStep === 0) {
        if (!emailChecker(userInput.email)) {
          toast.show('El email no es válido', {type: 'danger'});
          return;
        }

        setIsLoading(true);
        const formattedData = {
          email: userInput.email,
        };

        const response = await callFirebaseFunction('forgotPasswordSendCode', formattedData, toast);

        if (response.success) {
          setChangePasswordStep(1);
        } else {
          toast.show('Error al enviar el email de recuperación', {type: 'danger'});
        }
      } else if (changePasswordStep === 1) {
        if (recoveryCode.length < 6 || recoveryCode.length > 6) {
          toast.show('El código de recuperación no es válido', {type: 'danger'});
          return;
        }

        setIsLoading(true);
        const formattedData = {
          email: userInput.email,
          code: recoveryCode,
        };

        const response = await callFirebaseFunction('verifyRecoveryCode', formattedData, toast);
        if (response.success) {
          setChangePasswordStep(2);
          setTempAccessToken(response.accessToken);
        } else {
          toast.show('Error al comprobar el código de recuperación', {type: 'danger'});
        }
      } else if (changePasswordStep === 2) {
        if (userInput.password.length < 6) {
          toast.show('La contraseña no es válida', {type: 'danger'});
          return;
        }

        setIsLoading(true);
        const formattedData = {
          newPassword: userInput.password,
          accessToken: tempAccessToken,
        };

        const response = await callFirebaseFunction('resetPasswordAttempt', formattedData, toast);
        if (response.success) {
          toast.show('Contraseña cambiada correctamente', {type: 'success'});
          setIsChangePasswordVisible(false);
        } else {
          toast.show('Error al cambiar la contraseña', {type: 'danger'});
        }
      }
    } catch (error) {
      console.log('Error: ', error);
    } finally {
      setIsLoading(false);
    }
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
            onChangeText={text => !isLoading && setUserInput({...userInput, email: text})}
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
            onChangeText={text => !isLoading && setUserInput({...userInput, password: text})}
            style={styles.input}
          />
        </View>
        <TouchableOpacity style={styles.forgotPassword} activeOpacity={0.8} onPress={() => !isLoading && setIsChangePasswordVisible(true)}>
          <LatoText style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</LatoText>
        </TouchableOpacity>
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity activeOpacity={0.8} style={styles.submitButton} onPress={!isLoading && handleLogin}>
          <LatoText style={styles.submitButtonText}>{isLoading ? 'Cargando...' : 'Entrar'}</LatoText>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8} style={styles.goToRegisterButton} onPress={!isLoading && handleGoToRegister}>
          <LatoText style={styles.goToRegisterButtonText}>¿No tienes cuenta? <LatoText style={styles.colorChange}>Regístrate</LatoText></LatoText>
        </TouchableOpacity>
      </View>
      <Modal
        isVisible={isChangePasswordVisible}
        onBackdropPress={() => !isLoading && setIsChangePasswordVisible(false)}
        onBackButtonPress={() => !isLoading && setIsChangePasswordVisible(false)}
        animationIn="fadeIn"
        animationOut="fadeOut"
        backdropTransitionOutTiming={0}
        useNativeDriverForBackdrop
      >
        <View style={styles.modalContainer}>
          {
            changePasswordStep === 0 && (
              <>
                <LatoText style={styles.modalTitle}>Recuperar Contraseña</LatoText>
                <LatoText style={styles.desc}>Introduce tu email para recuperar tu contraseña</LatoText>
                <View style={[styles.inputContainer, {borderColor: errors === 'mail' ? 'red' : 'transparent'}]}>
                  <MaterialIcons name="mail-outline" size={27} color="#191717" />
                  <TextInput 
                    placeholder='Email...'
                    keyboardType='email-address'
                    autoCapitalize='none'
                    value={userInput.email}
                    onChangeText={text => !isLoading && setUserInput({...userInput, email: text})}
                    style={styles.input}
                  />
                </View>
              </>
            )
          }

          {
            changePasswordStep === 1 && (
              <>
                <LatoText style={styles.modalTitle}>Email Enviado</LatoText>
                <LatoText style={styles.desc}>Revisa tu email para obtener el código de recuperación</LatoText>
                <View style={styles.inputContainer}>
                  <MaterialIcons name="lock-outline" size={27} color="#191717" />
                  <TextInput
                    placeholder='Código de recuperación...'
                    keyboardType='numeric'
                    autoCapitalize='none'
                    autoComplete='off'
                    value={recoveryCode}
                    onChangeText={text => !isLoading && setRecoveryCode(text)}
                    style={styles.input}
                  />
                </View>
              </>
            )
          }

          {
            changePasswordStep === 2 && (
              <>
                <LatoText style={styles.modalTitle}>Código Comprobado</LatoText>
                <LatoText style={styles.desc}>Introduce tu nueva contraseña</LatoText>
                <View style={[styles.inputContainer, {borderColor: errors === 'password' ? 'red' : 'transparent'}]}>
                  <MaterialIcons name="lock-outline" size={27} color="#191717" />
                  <TextInput 
                    placeholder='Nueva contraseña...'
                    keyboardType='default'
                    secureTextEntry={true}
                    autoCapitalize='none'
                    autoComplete='off'
                    value={userInput.password}
                    onChangeText={text => !isLoading && setUserInput({...userInput, password: text})}
                    style={styles.input}
                  />
                </View>
              </>
            )
          }
          
          <TouchableOpacity activeOpacity={0.8} style={styles.modalSubmitButton} onPress={() => !isLoading && handleForgotPassword()}>
            <LatoText style={styles.submitButtonText}>{isLoading ? 'Cargando...' : 'Recuperar'}</LatoText>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} onPress={() => setIsChangePasswordVisible(false)}>
            <LatoText style={styles.goToRegisterButtonText}>Cancelar</LatoText>
          </TouchableOpacity>
        </View>
      </Modal>
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
  modalContainer: {
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  modalTitle: {
    fontSize: 21,
    color: '#191717',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  modalSubmitButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#458AC3',
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    marginBottom: 10,
  },
});

export default LoginScreen;