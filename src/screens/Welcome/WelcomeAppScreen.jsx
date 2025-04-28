import { Pressable, StyleSheet, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import LatoText from '../../components/Fonts/LatoText'
import { storeItem } from '../../utils/storage'
import { STORAGE_KEYS } from '../../constants/storageKeys'

const WelcomeAppScreen = ({navigation}) => {
  const [step, setStep] = useState(0);

  const handleNext = async (skip) => {
    if (skip) {
      await storeItem(STORAGE_KEYS.FIRST_TIME_WELCOME, JSON.stringify(false));
      navigation.navigate('Register', {});
      return;
    }
    if (step < 3) {
      setStep(step + 1);
    } else {
      await storeItem(STORAGE_KEYS.FIRST_TIME_WELCOME, JSON.stringify(false));
      navigation.navigate('Register', {});
    }
  };

  return (
    <SafeAreaView style={styles.page}>
      {
        step === 0 ? (
          <Layout 
            title="Welcome to the App"
            desc="This is a short description of the app."
            image={<LatoText>Image 1</LatoText>}
            step={step}
            setStep={setStep}
            handleNext={handleNext}
          />
        ) : step === 1 ? (
          <Layout 
            title="Step 2"
            desc="This is a short description of the app."
            image={<LatoText>Image 2</LatoText>}
            step={step}
            setStep={setStep}
            handleNext={handleNext}
          />
        ) : step === 2 ? (
          <Layout 
            title="Step 3"
            desc="This is a short description of the app."
            image={<LatoText>Image 3</LatoText>}
            step={step}
            setStep={setStep}
            handleNext={handleNext}
          />
        ) : (
          <Layout 
            title="Step 4"
            desc="This is a short description of the app."
            image={<LatoText>Image 4</LatoText>}
            step={step}
            setStep={setStep}
            handleNext={handleNext}
          />
        )
      }
    </SafeAreaView>
  )
}

const Layout = ({title, desc, image, step, setStep, handleNext}) => (
  <>
    <View style={styles.fullWidth}>
      <LatoText style={styles.title}>{title}</LatoText>
      <LatoText style={styles.desc}>{desc}</LatoText>
    </View>
    <View style={styles.imageContainer}>
      {image}
    </View>
    <View style={styles.fullWidth}>
      <View style={styles.steps}>
        {step === 0 ? <View style={styles.activeStep}/> : <Pressable onPress={() => setStep(0)} style={styles.step}/>}
        {step === 1 ? <View style={styles.activeStep}/> : <Pressable onPress={() => setStep(1)} style={styles.step}/>}
        {step === 2 ? <View style={styles.activeStep}/> : <Pressable onPress={() => setStep(2)} style={styles.step}/>}
        {step === 3 ? <View style={styles.activeStep}/> : <Pressable onPress={() => setStep(3)} style={styles.step}/>}
      </View>
      <TouchableOpacity activeOpacity={0.8} onPress={() => handleNext(false)} style={styles.nextButton}>
        {step === 3 ? (
          <LatoText style={styles.nextButtonText}>Iniciar</LatoText>
        ) : (
          <LatoText style={styles.nextButtonText}>Siguiente</LatoText>
        )}
      </TouchableOpacity>
      <TouchableOpacity activeOpacity={0.8} onPress={() => {step > 0 ? setStep(step - 1) : handleNext(true)}} style={styles.prevButton}>
        {step === 0 ? 
        (
          <LatoText style={styles.prevButtonText}>Saltar</LatoText>
        ) :
        (
          <LatoText style={styles.prevButtonText}>Anterior</LatoText>
        )}
      </TouchableOpacity>
    </View>
  </>
);

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEEAE8',
  },
  fullWidth: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 24,
    color: '#191717',
  },
  desc: {
    fontSize: 14,
    color: '#242222',
  },
  imageContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 50,
  },
  steps: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5
  },
  step: {
    width: 12,
    height: 12,
    backgroundColor: '#555050',
    opacity: 0.2,
    borderRadius: 99,
  },
  activeStep: {
    width: 25,
    height: 12,
    backgroundColor: '#458AC3',
    borderRadius: 99,
  },
  nextButton: {
    width: '90%',
    alignItems: 'center',
    padding: 10,
    paddingVertical: 20,
    borderRadius: 99,
    marginTop: 10,
    backgroundColor: '#458AC3',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 20,
  },
  prevButton: {
    marginTop: 15,
  },
  prevButtonText: {
    color: '#555151',
    fontSize: 16,
  },
});

export default WelcomeAppScreen;