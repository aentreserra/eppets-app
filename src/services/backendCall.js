import functions from '@react-native-firebase/functions';
import { giveLevel } from '../utils/levelManager';

export const callFirebaseFunction = async (functionName, data, toast, user, updateUser, showLevelUpModal) => {
  try {
    const result = await functions().httpsCallable(functionName)(data);
    const response = result.data;

    if (response.xp && user && updateUser) {
      const levelUp = await giveLevel(user, updateUser, response.xp);
      if (levelUp.didLevelUp) {
        showLevelUpModal({
          oldLevel: levelUp.oldLevel,
          newLevel: levelUp.newLevel,
        });
      }
    }
    return response;
  } catch (error) {
    console.error('Error:', error);
    toast.show('Error inesperado', {type: 'danger'});
    return {success: false, message: 'Error calling function'};
  }
};