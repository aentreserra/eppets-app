import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from 'expo-secure-store';

// FUNCIONES PARA ALMACENAMIENTO LOCAL (ASYNC STORAGE) 

/**
 * Guardar un valor en el almacenamiento local
 * @param {string} key 
 * @param {string} value 
 * @returns 
 */
export const storeItem = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.error("Error storing data:", e);
    return false;
  }
};

/**
 * Obtener un valor del almacenamiento local
 * @param {string} key 
 * @returns 
 */
export const getItem = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return value;
    } else {
      return null;
    }
  } catch (e) {
    console.error("Error retrieving data:", e);
    return null;
  }
}

/**
 * Eliminar un valor del almacenamiento local
 * @param {string} key 
 * @returns 
 */
export const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (e) {
    console.error("Error removing data:", e);
    return false;
  }
};

// FUNCIONES PARA ALMACENAMIENTO SEGURO (SECURE STORE)

/**
 * Guardar un valor en el almacenamiento seguro
 * @param {string} key 
 * @param {string} value 
 * @returns 
 */
export const storeSecureItem = async (key, value) => {
  try {
    await SecureStore.setItemAsync(key, value);
    return true;
  } catch (e) {
    console.error("Error storing secure item:", e);
    return false;
  }
}

/**
 * Obtener un valor del almacenamiento seguro
 * @param {string} key 
 * @returns 
 */
export const getSecureItem = async (key) => {
  try {
    const value = await SecureStore.getItemAsync(key);
    return value;
  } catch (e) {
    console.error("Error retrieving secure item:", e);
    return null;
  }
}

/**
 * Eliminar un valor del almacenamiento seguro
 * @param {string} key 
 * @returns 
 */
export const removeSecureItem = async (key) => {
  try {
    await SecureStore.deleteItemAsync(key);
    return true;
  } catch (e) {
    console.error("Error removing secure item:", e);
    return false;
  }
}