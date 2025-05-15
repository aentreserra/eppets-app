import { View, StyleSheet, TouchableOpacity, Keyboard } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import { MaterialIcons } from '@expo/vector-icons';
import LatoText from '../../components/Fonts/LatoText';
import { tokenRefreshWrapper } from '../../services/tokenRefreshWrapper';
import { useUser } from '../../context/UserContext';
import { useToast } from 'react-native-toast-notifications';
import { useLevelUpModal } from '../../context/LevelUpModalContext';
import { removeItem, removeSecureItem, storeSecureItem } from '../../utils/storage';
import { SECURE_STORAGE_KEYS, STORAGE_KEYS } from '../../constants/storageKeys';
import Modal from 'react-native-modal';
import { firebase } from '@react-native-firebase/messaging';

const SettingsScreen = ({navigation}) => {

  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState(false);
  const [isDeleteAccountModalVisible, setIsDeleteAccountModalVisible] = useState(false);

  const [userInput, setUserInput] = useState({
    oldPassword: '',
    newPassword: '',
  });

  const {user, refreshUser, updateUser} = useUser();
  const {showLevelUpModal} = useLevelUpModal();
  const toast = useToast();

  /**
   * Función para manejar el cierre de sesión
   */
  const handleLogout = async () => {
    try {
      const fcmToken = await firebase.messaging().getToken();
      const formattedData = {
        fcm: fcmToken,
      };

      const response = await tokenRefreshWrapper('logoutUserAttempt', formattedData, toast, user, refreshUser, updateUser, showLevelUpModal);

      if (response.success) {
        await deleteAllData();
        toast.show('Sesión cerrada correctamente', {type: 'success'});
        navigation.replace('Login');
      };
    } catch (error) {
      console.error('Error logging out:', error);
      toast.show('Error al cerrar sesión', {type: 'danger'});
    }
  };

  /**
   * Función para borrar la cuenta del usuario
   */
  const handleDeleteAccount = async () => {
    try {
      const fcmToken = await firebase.messaging().getToken();
      const formattedData = {
        fcm: fcmToken,
      };

      const response = await tokenRefreshWrapper('deleteUser', formattedData, toast, user, refreshUser, updateUser, showLevelUpModal);

      if (response.success) {
        await deleteAllData();
        toast.show('Cuenta borrada correctamente', {type: 'success'});
        navigation.replace('Login');
      };
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.show('Error al borrar la cuenta', {type: 'danger'});
    }
  };

  /**
   * Función para borrar todos los datos locales del usuario
   */
  const deleteAllData = async () => {
    await removeSecureItem(SECURE_STORAGE_KEYS.REFRESH_TOKEN);
    await removeItem(STORAGE_KEYS.DAILY_PHOTOS);
    await removeItem(STORAGE_KEYS.LOCAL_EVENTS);
    await removeItem(STORAGE_KEYS.NOTIFICATIONS);
    await removeItem(STORAGE_KEYS.PETS_PROFILE);
    await removeItem(STORAGE_KEYS.REMINDERS);
    await removeItem(STORAGE_KEYS.USER_PROFILE);
    await removeItem(STORAGE_KEYS.MEDICAL_RECORDS);
    updateUser(null);
  };

  /**
   * Función para manejar el cambio de contraseña
   */
  const handleChangePassword = async () => {
    Keyboard.dismiss();
    if (userInput.oldPassword.length < 6) {
      toast.show('La contraseña antigua no es correcta', {type: 'danger'});
      return;
    }
    if (userInput.newPassword.length < 6) {
      toast.show('La nueva contraseña debe tener al menos 6 caracteres', {type: 'danger'});
      return;
    }

    const formattedData = {
      oldPassword: userInput.oldPassword,
      newPassword: userInput.newPassword,
    };

    const response = await tokenRefreshWrapper('changeUserPasswordAttempt', formattedData, toast, user, refreshUser, updateUser, showLevelUpModal);

    if (response.success) {
      const refreshToken = response.refreshToken;

      await storeSecureItem(SECURE_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

      toast.show('Contraseña cambiada correctamente', {type: 'success'});

      setUserInput({
        oldPassword: '',
        newPassword: '',
      });
      setIsChangePasswordModalVisible(false);
    }
  };

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#191717" onPress={() => navigation.goBack()} />
        </View>
        <LatoText style={styles.title}>Ajustes</LatoText>
        <View style={styles.settingsContainer}>
          <SettingsItem
            icon={<MaterialIcons name="password" size={20} color="white" />}
            title="Cambiar contraseña"
            onPress={() => setIsChangePasswordModalVisible(true)}
          />
          <SettingsItem
            icon={<MaterialIcons name="logout" size={20} color="white" />}
            title="Cerrar sesión"
            onPress={() => setIsLogoutModalVisible(true)}
            textType="danger"
          />
          <SettingsItem
            icon={<MaterialIcons name="delete-forever" size={20} color="white" />}
            title="Borrar cuenta"
            onPress={() => setIsDeleteAccountModalVisible(true)}
            textType="danger"
          />
        </View>
      </ScrollView>
      {/* MODAL DE CIERRE DE SESIÓN */}
      <Modal
        isVisible={isLogoutModalVisible}
        onBackdropPress={() => setIsLogoutModalVisible(false)}
        onBackButtonPress={() => setIsLogoutModalVisible(false)}
        animationIn="fadeIn"
        animationOut="fadeOut"
        backdropTransitionOutTiming={0}
        useNativeDriverForBackdrop
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <LatoText style={styles.modalText}>¿Estás seguro de que quieres cerrar sesión?</LatoText>
            <LatoText style={styles.modalSubText}>Esto borrará todos los datos locales como las fotos diarias</LatoText>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={() => {
                handleLogout();
                setIsLogoutModalVisible(false);
              }}
            >
              <LatoText style={styles.textStyle}>Cerrar sesión</LatoText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsLogoutModalVisible(false)}
            >
              <LatoText style={styles.cancelText}>Cancelar</LatoText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* MODAL DE CAMBIO DE CONTRASEÑA */}
      <Modal
        isVisible={isChangePasswordModalVisible}
        onBackdropPress={() => setIsChangePasswordModalVisible(false)}
        onBackButtonPress={() => setIsChangePasswordModalVisible(false)}
        animationIn="fadeIn"
        animationOut="fadeOut"
        backdropTransitionOutTiming={0}
        useNativeDriverForBackdrop
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <LatoText style={styles.modalText}>Cambiar contraseña</LatoText>
            <LatoText style={styles.modalSubText}>Esto invalidará todas las sesiones que tienes iniciadas</LatoText>
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock-outline" size={27} color="#191717" />
              <TextInput 
                placeholder='Contraseña antigua...'
                keyboardType='default'
                secureTextEntry={true}
                autoCapitalize='none'
                autoComplete='off'
                value={userInput.oldPassword}
                onChangeText={text => setUserInput({...userInput, oldPassword: text})}
                style={styles.input}
              />
            </View>
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock-outline" size={27} color="#191717" />
              <TextInput 
                placeholder='Contraseña nueva...'
                keyboardType='default'
                secureTextEntry={true}
                autoCapitalize='none'
                autoComplete='off'
                value={userInput.newPassword}
                onChangeText={text => setUserInput({...userInput, newPassword: text})}
                style={styles.input}
              />
            </View>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={handleChangePassword}
            >
              <LatoText style={styles.textStyle}>Cambiar contraseña</LatoText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsChangePasswordModalVisible(false)}
            >
              <LatoText style={styles.cancelText}>Cancelar</LatoText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* MODAL DE BORRADO DE CUENTA */}
      <Modal
        isVisible={isDeleteAccountModalVisible}
        onBackdropPress={() => setIsDeleteAccountModalVisible(false)}
        onBackButtonPress={() => setIsDeleteAccountModalVisible(false)}
        animationIn="fadeIn"
        animationOut="fadeOut"
        backdropTransitionOutTiming={0}
        useNativeDriverForBackdrop
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <LatoText style={styles.modalText}>¿Estás seguro de que quieres borrar tu cuenta?</LatoText>
            <LatoText style={styles.modalSubText}>Este es un proceso que no se puede revertir</LatoText>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={handleDeleteAccount}
            >
              <LatoText style={styles.textStyle}>Borrar cuenta</LatoText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsDeleteAccountModalVisible(false)}
            >
              <LatoText style={styles.cancelText}>Cancelar</LatoText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const SettingsItem = ({ icon, title, onPress, textType }) => (
  <TouchableOpacity activeOpacity={0.8} style={styles.settingsItem} onPress={onPress}>
    <View style={styles.headerRow}>
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <LatoText style={[styles.settingsText, {color: textType === "danger" ? "#db3d3d" : "#191717"}]}>{title}</LatoText>
    </View>
    <MaterialIcons name="chevron-right" size={24} color="#191717" />
  </TouchableOpacity>
);

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
    marginBottom: 5,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 24,
    color: '#191717',
    marginBottom: 10,
    textAlign: 'center',
  },
  settingsContainer: {
    width: '100%',
    paddingHorizontal: 5,
    gap: 10,
  },
  settingsItem: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
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
    shadowRadius: 10,
  },
  settingsText: {
    fontSize: 16,
    color: '#191717',
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: 99,
    backgroundColor: '#EF9B93',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F6F6F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIconText: {
    fontSize: 15,
    color: '#555050',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '90%',
    backgroundColor: '#EEEAE8',
    borderRadius: 20,
    padding: 30,
    gap: 10,
    alignItems: 'center',
  },
  modalText: {
    marginBottom: 5,
    textAlign: 'center',
    fontSize: 16,
    color: '#191717',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    width: '100%',
    marginVertical: 5,
  },
  buttonClose: {
    marginTop: 10,
    backgroundColor: '#EF9B93',
  },
  cancelText: {
    color: '#242222',
    fontSize: 14,
    textAlign: 'center',
  },
  textStyle: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  modalSubText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#555151',
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
});

export default SettingsScreen;