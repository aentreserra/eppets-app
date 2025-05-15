import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LatoText from '../../components/Fonts/LatoText';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import BreedData from '../../lib/breedsData.json';
import WikiBreedDetailsModal from '../../components/Modals/WikiBreedDetailsModal';

const animalDisplayInfo = {
  dog: { title: 'Perros', icon: 'dog' },
  cat: { title: 'Gatos', icon: 'cat' },
  bird: { title: 'Aves', icon: 'bird' },
  fish: { title: 'Peces', icon: 'fish' },
  rabbit: { title: 'Conejos', icon: 'rabbit' },
  rodent: { title: 'Roedores', icon: 'rodent' },
  ferret: { title: 'Hurones', icon: 'paw' },
  reptile: { title: 'Reptiles', icon: 'snake' },
  amphibian: { title: 'Anfibios', icon: 'paw' },
};

const WikiInfoScreen = ({ route, navigation }) => {
  const { animal } = route.params;

  const [isWikiBreedDetailsVisible, setIsWikiBreedDetailsVisible] = useState(false);
  const [selectedBreed, setSelectedBreed] = useState(null);

  const animalInfo = animalDisplayInfo[animal] || { title: '', icon: 'paw' };
  const breedsForAnimal = BreedData[animal] || [];

  /**
   * Componente para renderizar cada elemento de la lista de razas
   */
  const BreedItem = ({ item }) => (
    <TouchableOpacity
      style={styles.breedItemContainer}
      activeOpacity={0.7}
      onPress={() => [setSelectedBreed(item), setIsWikiBreedDetailsVisible(true)]}
    >
      <View style={styles.breedItemContent}>
        <View style={styles.breedItemIconContainer}>
          <MaterialCommunityIcons
            name={animalInfo.icon}
            size={28}
            color='#FFF'
          />
        </View>
        <LatoText style={styles.breedNameText} numberOfLines={2}>{item.name}</LatoText>
      </View>
      <MaterialIcons name="chevron-right" size={28} color="#55515180" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.page}>
      <WikiBreedDetailsModal
        isVisible={isWikiBreedDetailsVisible}
        onClose={() => setIsWikiBreedDetailsVisible(false)}
        breedItem={selectedBreed}
        speciesKey={animal}
      />
      <View style={styles.headerContainer}>
        <MaterialIcons name="arrow-back-ios" size={24} color="#191717" onPress={() => navigation.goBack()} />
        <LatoText style={styles.title}>{animalInfo.title}</LatoText>
      </View>
      {breedsForAnimal.length > 0 ? (
        <FlatList
          data={breedsForAnimal}
          renderItem={BreedItem}
          keyExtractor={(item) => item.value || item.name}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContentContainer}
        />
      ) : (
        <View style={styles.noDataContainer}>
          <MaterialCommunityIcons name="file-question-outline" size={50} color="#757575" />
          <LatoText style={styles.noDataText}>
            No hay información disponible para esta categoría de animales.
          </LatoText>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#EEEAE8',
    padding: 13,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  title: {
    fontSize: 22,
    color: '#191717',
    textAlign: 'center',
    width: '100%',
    marginLeft: -40,
  },
  listContentContainer: {
    paddingBottom: 20,
    gap: 10,
  },
  breedItemContainer: {
    backgroundColor: '#F6F6F6',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#00000050',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  breedItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    flex: 1,
  },
  breedItemIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 99,
    backgroundColor: '#EF9B93',
    justifyContent: 'center',
    alignItems: 'center',
  },
  breedNameText: {
    fontSize: 17,
    color: '#242222',
    flexShrink: 1,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#555151',
    textAlign: 'center',
    marginTop: 15,
  },
});

export default WikiInfoScreen;