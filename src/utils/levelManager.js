import { BASE_XP, XP_MULTIPLIER } from "../constants/globals";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { getItem, storeItem } from "./storage";

/**
 * Función para calcular el nivel y el progreso hacia el siguiente nivel de un usuario basado en su XP actual
 * @param xp - XP actual del usuario 
 * @returns - El nivel actual y el progreso hacia el siguiente nivel
 */
export const calculateLevelFromXP = (xp) => {
  if (xp < 0) xp = 0;

  let currentLevel = 0;
  let xpToNextLevel = BASE_XP;
  let accumulatedXp = 0;

  while (xp >= accumulatedXp + xpToNextLevel) {
    currentLevel++;
    accumulatedXp += xpToNextLevel;
    xpToNextLevel *= XP_MULTIPLIER;
    xpToNextLevel = Math.round(xpToNextLevel);
  }

  const totalXpForNextLevel = accumulatedXp + xpToNextLevel;

  const xpGainedInCurrentLevel = xp - accumulatedXp;

  const xpNeededToNextLevel = totalXpForNextLevel - xp;

  let progressBar = 0;
  if (xpToNextLevel > 0) {
    progressBar = (xpGainedInCurrentLevel / xpNeededToNextLevel) * 100;
  }

  return {
    level: currentLevel,
    progressBar: Math.min(100, Math.max(0, progressBar)),
  };
};

/**
 * Función para actualizar los datos del nivel en el cliente
 * @param user - Objeto de usuario
 * @param updateUser - Función para actualizar el usuario
 * @param xpToAdd - XP a añadir
 * @returns - Nuevo nivel
 */
export const giveLevel = async (user, updateUser, xpToAdd) => {
  if (!user, xpToAdd < 1) return false;

  const currentXp = user.xp;
  const newXp = currentXp + xpToAdd;

  const currentLevel = calculateLevelFromXP(currentXp).level;
  const newLevel = calculateLevelFromXP(newXp).level;

  console.log("Current level:", currentLevel);
  console.log("New level:", newLevel);

  await updateUser({...user, xp: newXp});

  console.log("New XP:", newXp);  

  const userPrifile = await getItem(STORAGE_KEYS.USER_PROFILE);

  if (userPrifile) {
    try {
      const parsedUserProfile = JSON.parse(userPrifile) || [];
      const newData = {
        ...parsedUserProfile,
        xp: newXp
      };

      await storeItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(newData));

      return {
        didLevelUp: currentLevel < newLevel,
        oldLevel: currentLevel,
        newLevel: newLevel,
      };
    } catch (error) {
      console.log(error);
      return false;
    }
  }
};