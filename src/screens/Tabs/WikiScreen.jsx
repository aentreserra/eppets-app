import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import LatoText from '../../components/Fonts/LatoText'
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import AddFoodModal from '../../components/Modals/AddFoodModal';
import dogImage from '../../images/Wiki/dog_image.jpg';
import catImage from '../../images/Wiki/cat_image.jpg';
import birdImage from '../../images/Wiki/bird_image.jpg';
import fishImage from '../../images/Wiki/fish_image.jpg';
import ferretImage from '../../images/Wiki/ferret_image.jpg';
import rodentImage from '../../images/Wiki/rodent_image.jpg';
import reptileImage from '../../images/Wiki/reptile_image.jpg';
import amphibianImage from '../../images/Wiki/amphibian_image.jpg';
import rabbitImage from '../../images/Wiki/rabbit_image.jpg';

import foodData from '../../lib/foodList.json';

const labels = {
  dog: 'Perros',
  cat: 'Gatos',
  bird: 'Aves',
  fish: 'Peces',
  rabbit: 'Conejos',
  rodent: 'Roedores',
  ferret: 'Hurones',
  reptile: 'Reptiles',
  amphibian: 'Anfibios',
};

const foodList = foodData;

const animalList = [
    { name: 'Perros', value: 'dog', image: dogImage },
    { name: 'Gatos', value: 'cat', image: catImage },
    { name: 'Aves', value: 'bird', image: birdImage },
    { name: 'Peces', value: 'fish', image: fishImage },
    { name: 'Conejos', value: 'rabbit', image: rabbitImage },
    { name: 'Roedores', value: 'rodent', image: rodentImage },
    { name: 'Hurones', value: 'ferret', image: ferretImage },
    { name: 'Reptiles', value: 'reptile', image: reptileImage },
    { name: 'Anfibios', value: 'amphibian', image: amphibianImage },
];

const WikiScreen = ({navigation}) => {

  const [wikiPage, setWikiPage] = useState(0);

  const [isVisible, setIsVisible] = useState(false);

  const [searchText, setSearchText] = useState('');


  const [animalListFiltered, setAnimalListFiltered] = useState([]);
  const [foodListFiltered, setFoodListFiltered] = useState([]);

  /**
   * Función para manejar el cambio de pestaña en la wiki
   * @param {number} index - 0 para animales, 1 para alimentos
   */
  const handleChangeTab = (index) => {
    setWikiPage(index);
    setSearchText('');
    setAnimalListFiltered([]);
    setFoodListFiltered([]);
  };

  /**
   * Función para manejar la búsqueda de animales o alimentos
   * @param {string} text - Texto de búsqueda
   */
  const handleSearch = (text) => {
    setSearchText(text);

    if (text.length < 3) return;

    if (wikiPage === 0) {
      // Perform search for animals
      const filteredAnimals = animalList.filter(item => item.name.normalize("NFD").toLowerCase().includes(text.normalize("NFD").toLowerCase()));
      setAnimalListFiltered(filteredAnimals);
    }
    else {
      let petName = "";
      for (const [key, value] of Object.entries(labels)) {
        if (value.normalize("NFD").toLowerCase().includes(text.normalize("NFD").toLowerCase())) {
          petName = key;
          break;
        }
      }

      const filteredFood = foodList.filter(item => item.name.normalize("NFD").toLowerCase().includes(text.normalize("NFD").toLowerCase()) || item[petName]);
      setFoodListFiltered(filteredFood);
    }
  }

  /**
   * Componente para mostrar un elemento de animal
   */
  const AnimalItem = ({ name, value, image }) => (
    <TouchableOpacity activeOpacity={0.8} style={styles.animalItemContainer} onPress={() => navigation.navigate('WikiInfo', {animal: value})}>
      <Image source={image} style={styles.animalImage} resizeMode="contain" />
      <LatoText style={styles.animalName}>{name}</LatoText>
    </TouchableOpacity>
  );

  /**
   * Componente para mostrar un elemento de alimento
   */
  const FoodItem = (item) => {
    const getFoodDesc = () => {  
      const safePets = [];
      for (const [key, value] of Object.entries(labels)) {
        const foodItem = foodList.find(food => food.name === item.name);
        if (foodItem[key]) {
          safePets.push(value);
        }
      }
    
      return safePets.length
        ? `Seguro para: ${safePets.join(', ')}`
        : 'No recomendado para mascotas';
    };
    return (
      <View style={styles.foodItemContainer}>
        <View style={styles.imageContainer}>
          <MaterialCommunityIcons name={item.image} size={30} color="#EF9B93"/>
        </View>
        <View style={styles.textContainer}>
          <LatoText style={styles.foodItemName}>{item.name}</LatoText>
          <LatoText style={styles.foodItemDesc}>{getFoodDesc(item.name)}</LatoText>
        </View>
      </View>
    )
  };

  return (
    <SafeAreaView style={styles.page}>
      <AddFoodModal searchTerm={searchText} isVisible={isVisible} setIsVisible={setIsVisible}/>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <LatoText style={styles.title}>Wiki</LatoText>
        </View>
        <View style={styles.wikiPickerContainer}>
          <TouchableOpacity 
            activeOpacity={0.9} 
            style={[styles.wikiPickerItem, {backgroundColor: wikiPage === 0 ? "#458AC3" : "#F6F6F6"}]}
            onPress={() => handleChangeTab(0)}
          >
            <LatoText style={[styles.wikiPickerText, {color: wikiPage === 0 ? "#FFF" : "#191717"}]}>Animales</LatoText>
          </TouchableOpacity>
          <TouchableOpacity 
            activeOpacity={0.9} 
            style={[styles.wikiPickerItem, {backgroundColor: wikiPage === 1 ? "#458AC3" : "#F6F6F6"}]}
            onPress={() => handleChangeTab(1)}
          >
            <LatoText style={[styles.wikiPickerText, {color: wikiPage === 1 ? "#FFF" : "#191717"}]}>Alimentos</LatoText>
          </TouchableOpacity>
        </View>
        <View style={styles.searchBarContainer}>
          <MaterialIcons name="search" size={27} color="#191717" />
          <TextInput 
            placeholder={wikiPage === 0 ? "Busca algún animal..." : "Busca algún alimento..."}
            placeholderTextColor="#55515190"
            onChangeText={(text) => handleSearch(text)}
            value={searchText}
            style={styles.searchBarInput}
          />
        </View>
        <View style={styles.wikiResultContainer}>
          {
            wikiPage === 0 ? (
              <View style={styles.wikiAnimalContainer}>
                {
                  searchText.length > 2 ? (
                    animalListFiltered.length > 0 ? (
                      animalListFiltered.map((item, index) => (
                        <AnimalItem key={index} name={item.name} value={item.value} image={item.image} />
                      ))
                    ) : (
                      <LatoText style={styles.notFound}>No se encontraron resultados</LatoText>
                    )
                  ) : (
                    animalList.map((item, index) => (
                      <AnimalItem key={index} name={item.name} value={item.value} image={item.image} />
                    ))
                  )
                }
              </View>
            ) : (
              <View style={styles.wikiFoodContainer}>
                {
                  searchText.length > 2 ? (
                    foodListFiltered.length > 0 ? (
                      foodListFiltered.map((item, index) => (
                        <FoodItem key={index} name={item.name} desc={item.desc} image={item.image} />
                      ))
                    ) : (
                      <>
                        <LatoText style={styles.notFound}>No se encontraron resultados</LatoText>
                        <TouchableOpacity activeOpacity={0.5} onPress={() => setIsVisible(true)} >
                          <LatoText style={styles.notFoundAdd}>¡Añade el alimento!</LatoText>
                        </TouchableOpacity>
                      </>
                    )
                    ) : (
                      foodList.map((item, index) => (
                        <FoodItem key={index} name={item.name} desc={item.desc} image={item.image} />
                      ))
                    )
                }
              </View>
            )
          }
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

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
  wikiPickerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 10,
    backgroundColor: '#F6F6F6',
    marginBottom: 20,
    overflow: 'hidden',
  },
  wikiPickerItem: {
    width: '50%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wikiPickerText: {
    fontSize: 16,
    color: '#191717',
  },
  searchBarContainer: {
    width: '100%',
    height: 50,
    backgroundColor: '#F6F6F6',
    borderRadius: 99,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    shadowColor: '#00000050',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchBarInput: {
    width: '100%',
    height: '100%',
    fontSize: 15,
    fontFamily: 'Lato-Regular',
  },
  wikiResultContainer: {
    width: '100%',
    height: '100%',
    marginTop: 20,
    marginBottom: 55,
  },
  wikiAnimalContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
  },
  wikiFoodContainer: {
    width: '100%',
    gap: 10,
    justifyContent: 'space-between',
  },
  animalItemContainer: {
    width: '48%',
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  animalImage: {
    width: '100%',
    height: 160,
    aspectRatio: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  animalName: {
    fontSize: 18,
    color: '#191717',
    marginTop: 5,
  },
  foodItemContainer: {
    width: '100%',
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: 45,
    height: 45,
    borderRadius: 6,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    flex: 1,
  },
  foodItemName: {
    fontSize: 20,
    color: '#191717',
  },
  foodItemDesc: {
    fontSize: 13,
    color: '#555151',
  },
  notFound: {
    fontSize: 18,
    color: '#191717',
    textAlign: 'center',
    marginTop: 20,
  },
  notFoundAdd: {
    fontSize: 15,
    color: '#458AC3',
    textAlign: 'center',
    marginTop: 15,
  },
});

export default WikiScreen;