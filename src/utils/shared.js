import { jwtDecode } from "jwt-decode";
import BreedData from "../lib/breedsData.json";

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

/**
 * Función que devuelve el nombre del día de la semana en español a partir de una fecha
 * @param selectedDate - Fecha seleccionada 
 * @returns - Nombre del día de la semana en español
 */
export const getDayName = (selectedDate) => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[selectedDate.getDay()];
};

/**
 * Función que devuelve el nombre del mes en español a partir de una fecha
 * @param selectedDate - Fecha seleccionada 
 * @returns - Nombre del mes en español
 */
export const getMonthName = (selectedDate) => {
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return months[selectedDate.getMonth()];
}

/**
 * Función para formatear en texto legible la fecha pasada como parámetro
 * @param date - Fecha a formatear 
 * @returns - Fecha formateada en el formato "Día, Mes Año"
 */
export const formattedDateDayMonthYear = (date) => {
  if (!date) return null;
    const dateObject = new Date(date);
    const dateOutput = `${getDayName(dateObject)} ${dateObject.getDate()}, ${getMonthName(dateObject)} de ${dateObject.getFullYear()}`;
    return dateOutput;
};

export const formattedDateAndTime = (date) => {
  if (!date) return null;
  const dateObject = new Date(date);
  const hours = getTimeStampInHours(dateObject);

  return `${getDayName(dateObject)} ${dateObject.getDate()}, ${getMonthName(dateObject)} de ${dateObject.getFullYear()} a las ${hours}`;
};

/**
 * Función para calcular la edad a partir de una fecha de nacimiento
 * @param bornDate - Fecha de nacimiento
 * @returns 
 */
export const calculateAge = (bornDate) => {
  if (!bornDate) return 0;
  const bornDateObj = new Date(bornDate);
  const today = new Date();
  let age = today.getFullYear() - bornDateObj.getFullYear();

  const monthDiff = today.getMonth() - bornDateObj.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < bornDateObj.getDate())) {
    age--;
  }

  return age;
};

/**
 * Función para obtener el nombre de la raza a partir del valor de la raza
 * @param breed - Raza de la mascota 
 * @returns - Nombre de la raza o el valor original si no se encuentra
 */
export const getBreedName = (species, breed) => {
  let breedName = breed;

  // Obtener el nombre de la especie a partir del valor unico, si no lo encuentra, devuelve el valor original
  try {
    breedName = BreedData[species].filter(item => item.value === breed)[0]?.name || breed;
  } catch {
    return breed;
  }

  // Si el nombre de la raza contiene paréntesis, devuelve solo la parte antes del paréntesis
  const parenthesisIndex = breedName.indexOf('(');
  if (parenthesisIndex !== -1) {
    return breedName.slice(0, parenthesisIndex).trim();
  } else {
    return breedName;
  }
};

/**
 * Función para obtener la unidad de peso de la mascota a partir de la especie y raza
 * @param species - Especie de la mascota 
 * @param breed - Raza de la mascota 
 * @returns - Peso de la mascota o el valor original si no se encuentra
 */
export const getWeightUnit = (species, breed) => {
  try {
    return BreedData[species].filter(item => item.value === breed)[0]?.parameters.weight.unit || "kg";
  } catch {
    return "kg";
  }
};

/**
 * Variables de colores para el score de peso
 */
const COLOR_RED = "#E67777";
const COLOR_YELLOW = "#f7c34a";
const COLOR_GREEN = "#40c41b";

/**
 * Función para obtener el valor de peso de la mascota a partir de la especie y raza
 * @param species - Especie de la mascota 
 * @param breed - Raza de la mascota
 * @param weight - Peso de la mascota
 * @returns - Valor entre 0 y 100, siendo 0 peso mínimo y 100 peso máximo 
 */
export const getWeigthScore = (species, breed, weight) => {
  if (!species || !breed || !weight) return 0;
  const currentWeight = parseFloat(weight);
  if (isNaN(currentWeight) || currentWeight < 0) return 0;

  try {
    if (!BreedData[species]) return 0;

    const breedData = BreedData[species].filter(item => item.value === breed)[0];

    if (!breedData) return 0;

    const {ideal_min, ideal_max, min_acceptable, max_acceptable} = breedData.parameters.weight;
    let score = 0;

    if (currentWeight <= min_acceptable) {
      score = 0;
    } else if (currentWeight >= max_acceptable) {
        score = 100;
    } else if (currentWeight >= ideal_min && currentWeight <= ideal_max) {
        score = 50;
    } else if (currentWeight > min_acceptable && currentWeight < ideal_min) {
        // Bajo peso
        const range = ideal_min - min_acceptable;
        if (range <= 0) {
            score = 25;
        } else {
            const positionInRange = currentWeight - min_acceptable;
            score = (positionInRange / range) * 50;
        }
    } else if (currentWeight > ideal_max && currentWeight < max_acceptable) {
        // Sobrepeso
        const range = max_acceptable - ideal_max;
        if (range <= 0) {
            score = 75;
        } else {
            const positionInRange = currentWeight - ideal_max;
            score = 50 + (positionInRange / range) * 50;
        }
    } else {
        return {score: 0, color: COLOR_RED};
    }

    const roundedScore = Math.round(score);

    let color = null;
    if (roundedScore < 20) {
      color = COLOR_RED;
    } else if (roundedScore >= 20 && roundedScore < 40) {
      color = COLOR_YELLOW;
    } else if (roundedScore >= 40 && roundedScore <= 60) {
      color = COLOR_GREEN;
    } else if (roundedScore > 60 && roundedScore <= 90) {
      color = COLOR_YELLOW;
    } else if (roundedScore > 90) {
      color = COLOR_RED;
    }

    return {
      score: roundedScore,
      color,
    };
  } catch {
    return 0;
  }
};

/**
 * Función para verificar si una fecha es hoy
 * @param date - Fecha a verificar 
 * @returns - true si la fecha es hoy, false si no lo es
 */
export const isToday = (date) => {
  const today = new Date();
  const dateObj = new Date(date);
  return dateObj.getDate() === today.getDate() && dateObj.getMonth() === today.getMonth() && dateObj.getFullYear() === today.getFullYear();
}