// React
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useToast } from 'react-native-toast-notifications';

// Storage
import { getItem, storeSecureItem, getSecureItem } from '../utils/storage';
import { SECURE_STORAGE_KEYS, STORAGE_KEYS } from '../constants/storageKeys';

// Services
import { callFirebaseFunction } from '../services/backendCall';
import { replace } from '../utils/RootNavigation';

const UserContext = createContext({
  user: null,
  loading: true,
  refreshUser: async () => null,
  updateUser: () => {},
  getUser: () => null,
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const toast = useToast();

  /**
   * Función para obtener el access token del usuario desde el backend usando el refresh token
   */
  const getUserData = async () => {
    try {
      const firstRun = await getItem(STORAGE_KEYS.FIRST_TIME_WELCOME);
      if (firstRun === null) return;
      
      const token = await getSecureItem(SECURE_STORAGE_KEYS.REFRESH_TOKEN);
      if (token) {
        const now = Date.now();
        const reamingTime = user ? user.accessTokenExpiration - now : 0;

        if (reamingTime > 60000) {
          return;
        }

        const response = await callFirebaseFunction('refreshTokenAttempt', { refreshToken: token }, toast);

        if (!response.success) {
          console.log("Error getting user data:", response.message);
          replace('Login', {});
          setUser(null);
          throw new Error('Error getting user data');
        } else {
          const storedUser = await getItem(STORAGE_KEYS.USER_PROFILE);
          if (storedUser) {
            const storedData = JSON.parse(storedUser);
            const userData = {
              ...storedData,
              accessToken: response.accessToken,
              accessTokenExpiration: new Date().getTime() + 900000,
            }
            setUser(userData);

            if (response.refreshToken) {
              await storeSecureItem(SECURE_STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
            }
          } else {
            replace('Login', {});
            setUser(null);
            return;
          }
        }
      } else {
        // Si no hay token, lo redirigimos a la pantalla de login
        setUser(null);
        replace('Login', {});
      }
    } catch (error) {
      console.error('Error getting user information:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await getUserData();
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    })()
  }, []);

  /**
   * Función para actualizar el access token del usuario
   * y guaradar el nuevo refresh token
   */
  const refreshUser = async () => {
    try {
      const token = await getSecureItem(SECURE_STORAGE_KEYS.REFRESH_TOKEN);
      if (token) {
        const now = Date.now();
        const remainingTime = user ? user.accessTokenExpiration - now : 0;
  
        if (remainingTime > 60000) {
          return user;
        }
  
        const response = await callFirebaseFunction('refreshTokenAttempt', { refreshToken: token }, toast);
        if (response.success) {
          if (!user) {
            setUser(null);
            replace('Login', {});
            return null;
          }
          
          const userData = {
            ...user,
            accessToken: response.accessToken,
            accessTokenExpiration: Date.now() + 900000,
          };
          
          setUser(userData);
          
          if (response.refreshToken) {
            await storeSecureItem(SECURE_STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
          }
          
          return userData;
        } else {
          setUser(null);
          replace('Login', {});
          return null;
        }
      } else {
        setUser(null);
        replace('Login', {});
        return null;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  };
  /**
   * Función para actualizar los datos del usuario
   * @param userData - Objeto con los datos a actualizar
   */
  const updateUser = (userData) => {
    setUser(userData);
  };

  /**
   * Función para obtener los datos del usuario
   * @returns {object} - Objeto con los datos del usuario
   */
  const getUser = () => {
    return user;
  };

  return (
    <UserContext.Provider value={{ user, loading, refreshUser, updateUser, getUser }}>
      {children}
    </UserContext.Provider>
  );
};

/**
 * Hook para acceder al contexto del usuario
 * @returns {object} - Objeto con los datos del usuario
 */
export const useUser = () => useContext(UserContext);
