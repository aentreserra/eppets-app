import { jwtDecode } from "jwt-decode";

/**
 * Función para verificar si un string es un correo electrónico válido
 * @param {string} email 
 * @returns 
 */
export const emailChecker = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Función para verificar si un token está expirado
 * @param token
 * @returns
 */
export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp ? decoded.exp < currentTime : true;
  } catch (error) {
    console.error('Error checking token expiration: ', error);
    return true;
  }
};

/**
 * Función que devuelve HH:mm a partir de un timestamp
 * @param {string} value 
 * @returns 
 */
export const getTimeStampInHours = (timestamp) => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const getDayName = (selectedDate) => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[selectedDate.getDay()];
};

export const getMonthName = (selectedDate) => {
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return months[selectedDate.getMonth()];
}