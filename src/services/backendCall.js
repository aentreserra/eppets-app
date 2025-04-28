import functions from '@react-native-firebase/functions';

export const callFirebaseFunction = async (functionName, data, toast) => {
  try {
    const result = await functions().httpsCallable(functionName)(data);
    const response = result.data;
    return response;
  } catch (error) {
    console.error('Error calling Firebase function:', error);
    toast.show('Error inesperado', {type: 'danger'});
    return null;
  }
};