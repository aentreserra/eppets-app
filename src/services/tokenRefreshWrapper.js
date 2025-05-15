import { callFirebaseFunction } from "./backendCall";

const THRESHOLD = 60000; // 1 minuto de margen para refrescar el token antes de que expire

let refreshPromise = null; // Variable para almacenar la promesa de refresco del token

/**
 * Función para verificar el accessToken, en caso de que esté a punto de expirar, refrescarlo.
 * @param user - El usuario actual con el token de acceso y su tiempo de expiración 
 * @param refreshUser - Función para refrescar el token de acceso 
 * @returns - El usuario actualizado con el nuevo token de acceso o null si no se puede refrescar
 */
const ensureValidToken = async (
  user,
  refreshUser
) => {
  if (!user) {
    return null;
  }

  // Verificar si el token de acceso está presente y no ha expirado
  const reamingTime = user.accessTokenExpiresIn - Date.now();

  if (reamingTime > THRESHOLD) {
    return user;
  }

  // Si el token está a punto de expirar, refrescarlo
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const newUser = await refreshUser();
        return newUser;
      } finally {
        refreshPromise = null; // Reiniciar la promesa de refresco
      }
    })();
  }

  return refreshPromise;
};

/**
 * Functión para envolver la llamada a la función de Firebase y manejar el refresco del token de acceso.
 * @param functionName - Nombre de la función de Firebase a llamar
 * @param data - Datos a enviar a la función de Firebase
 * @param toast - Función para mostrar mensajes de error
 * @param user - El usuario actual
 * @param refreshUser - Función para refrescar el token de acceso
 * @returns 
 */
export const tokenRefreshWrapper = async (
  functionName,
  data,
  toast,
  user,
  refreshUser,
  updateUser,
  showLevelUpModal
) => {
  const validUser = await ensureValidToken(user, refreshUser);

  if (!validUser) {
    return null; // Si no hay usuario válido, no se puede hacer la llamada
  }

  // Añadir el accessToken a la llamada
  const requestData = {
    ...data,
    accessToken: validUser.accessToken,
  }

  try {
    return await callFirebaseFunction(functionName, requestData, toast, user, updateUser, showLevelUpModal);
  } catch (error) {
    // Varificamos si el error es de token
    if (error.message.includes("Invalid token")) {
      const newUser = await refreshUser();
  
      if (!newUser) {
        return null;
      }
  
      requestData.accessToken = newUser.accessToken;
      return await callFirebaseFunction(functionName, requestData, toast);
    }
    throw error;
  }
};