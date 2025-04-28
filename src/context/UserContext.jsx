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
   * @returns {Promise<void>}
   */
  const getUserData = async () => {
    try {
      const firstRun = await getItem(STORAGE_KEYS.FIRST_TIME_WELCOME);
      if (firstRun === null) return;
      
      const token = await getSecureItem(SECURE_STORAGE_KEYS.REFRESH_TOKEN);
      console.log("Token:", token);
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
          console.log("Stored user data:", storedUser);
          if (storedUser) {
            const storedData = JSON.parse(storedUser);
            const userData = {
              ...storedData,
              accessToken: response.accessToken,
              accessTokenExpiration: new Date().getTime() + 900000,
            }
            console.log("Setting user data...", userData);
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
   * Function to refresh user data from backend
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
  
        console.log("Refreshing user access token...");
  
        const response = await callFirebaseFunction('createAccessToken', { refreshToken: token }, toast);
        if (response.success) {
          if (!user) {
            setUser(null);
            replace('Login', {});
            return null;
          }
          
          const userData = {
            id: user.id,
            email: user.email,
            name: user.name,
            accessToken: response.accessToken,
            accessTokenExpiration: Date.now() + 900000,
          };
          
          setUser(userData);
          
          if (response.refreshToken) {
            await storeSecureItem(SECURE_STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
          }
          
          return userData
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
   * Updates user data after login, register or logout
   * @param userData - User data to update
   */
  const updateUser = (userData) => {
    setUser(userData);
  };

  /**
   * Get current user state (for synchronous access to latest user data)
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
 * Custom hook to use user data and refresh user data
 * @returns Object with user data and function to refresh user data
 */
export const useUser = () => useContext(UserContext);
