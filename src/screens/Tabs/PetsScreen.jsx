import { View, StyleSheet, Image, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import LatoText from '../../components/Fonts/LatoText';

const PetsScreen = ({navigation}) => {

  const [pets, setPets] = useState([{id: 0, name: "Luna", type: "Perro", breed: "Labrador", age: 3, image: "https://dynamoprojects.com/wp-content/uploads/2022/12/no-image.jpg"}, {id: 1, name: "Milo", type: "Gato", breed: "Persa", age: 2, image: "https://dynamoprojects.com/wp-content/uploads/2022/12/no-image.jpg"}]);

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.headerContainer}>
        <LatoText style={styles.title}>Mascotas</LatoText>
      </View>
      {
        pets.length < 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <LatoText style={{ fontSize: 18, color: '#191717' }}>No tienes mascotas registradas</LatoText>
          </View>
        ) : (
          <>
          {pets.map((pet) => (
            <PetItem 
              key={pet.id}
              id={pet.id}
              name={pet.name}
              type={pet.type}
              breed={pet.breed}
              age={pet.age}
              image={pet.image}
              navigation={navigation}
            />
          ))}
          </>
        )
      }
      <TouchableOpacity activeOpacity={0.8} style={styles.addPetContainer} onPress={() => navigation.navigate('AddPet')}>
        <LatoText style={styles.addPetPlus}>+</LatoText>
      </TouchableOpacity>
    </SafeAreaView>
  )
};

const PetItem = ({ name, type, breed, age, image, id, navigation }) => (
  <TouchableOpacity activeOpacity={0.8} style={styles.petContainer} onPress={() => navigation.navigate('ManagePet', { petId: id })}>
    <View style={styles.imageContainer}>
      <Image source={{uri: image}} style={styles.image} />
    </View>
    <View>
      <LatoText style={{ fontSize: 18, fontWeight: 'bold', color: '#191717' }}>{name}</LatoText>
      <LatoText style={{ fontSize: 16, color: '#191717' }}>{type} - {breed}</LatoText>
      <LatoText style={{ fontSize: 16, color: '#191717' }}>Edad: {age} años</LatoText>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#EEEAE8',
    padding: 13,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: '#191717',
  },
  petContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#00000050',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 15,
    overflow: 'hidden',
    marginRight: 10,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  addPetContainer: {
    backgroundColor: '#E9E9E9',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    minHeight: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00000050',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 3.84,
    elevation: 5,
  },
  addPetTitle: {
    fontSize: 15,
    color: '#191717',
  },
  addPetPlus: {
    fontSize: 30,
    color: '#458AC3',
  },
});

export default PetsScreen;