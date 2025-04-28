import { View, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import LatoText from '../../components/Fonts/LatoText';
import { MaterialIcons } from '@expo/vector-icons';
import BoxItem from '../../components/UI/BoxItem';

const ManagePetScreen = ({route, navigation}) => {

  const { petId } = route.params || {};

  const [petTab, setPetTab] = useState(0);

  useEffect(() => {
    fetchPetData();
  }, []);

  useEffect(() => {
    console.log('Pet Tab: ', petTab);
  }, [petTab]);

  const fetchPetData = async () => {

  };

  return (
    <SafeAreaView style={styles.page}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#191717" onPress={() => navigation.goBack()} />
            <View style={styles.headerRow}>
              <TouchableOpacity activeOpacity={0.8} style={styles.roundedItem} onPress={() => {}}>
                <MaterialIcons name="add" size={24} color="#EF9B93" onPress={() =>{}} />
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.8} style={styles.roundedItem} onPress={() => {}}>
                <MaterialIcons name="edit" size={24} color="#EF9B93" onPress={() =>{}} />
              </TouchableOpacity>
            </View>
        </View>
        <View style={styles.petData}>
          <View style={styles.petDataImageContainer}>
            <View style={styles.petDataWeigthBarMask}>
              <View style={[styles.petDataWeigthBar, {height: '80%', backgroundColor: '#E67777'}]} />
            </View>
            <View style={styles.petDataImage}>
              <Image source={{uri: 'https://dynamoprojects.com/wp-content/uploads/2022/12/no-image.jpg'}} style={styles.petImage} />
            </View>
            <View style={styles.petDataWeigthContainer}>
              <View style={styles.petDataWeigthBox}>
                <LatoText style={styles.petDataWeigthTitle}>4.5 KG</LatoText>
              </View>
            </View>
          </View>
          <LatoText style={styles.title}>Puchita</LatoText>
          <View style={styles.petDataDescContainer}>
            <LatoText style={styles.petDataDescMain}>Gato</LatoText>
            <LatoText style={styles.petDataDesc}>· Común Europeo</LatoText>
          </View>
          <LatoText style={styles.petDataAge}>12 años</LatoText>
        </View>
        <View style={styles.petMenu}>
          <TouchableOpacity activeOpacity={0.8} style={styles.petMenuItem} onPress={() => setPetTab(0)}>
            <LatoText style={[styles.petMenuItemText, {color: petTab === 0 ? "#458AC3" : "#242222"}]}>Historial</LatoText>
            {petTab === 0 && <View style={styles.petMenuItemSelected} />}
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} style={styles.petMenuItem} onPress={() => setPetTab(1)}>
            <LatoText style={[styles.petMenuItemText, {color: petTab === 1 ? "#458AC3" : "#242222"}]}>Recordatorios</LatoText>
            {petTab === 1 && <View style={styles.petMenuItemSelected} />}
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} style={styles.petMenuItem} onPress={() => setPetTab(2)}>
            <LatoText style={[styles.petMenuItemText, {color: petTab === 2 ? "#458AC3" : "#242222"}]}>Parámetros</LatoText>
            {petTab === 2 && <View style={styles.petMenuItemSelected} />}
          </TouchableOpacity>
        </View>
        <View style={styles.petDataItemsContainer}>
          {
            petTab === 0 ? (
              <>
                <BoxItem 
                  
                />
                <BoxItem />
                <BoxItem />
                <BoxItem />
                <BoxItem />
              </>
            ) : petTab === 1 ? (
              <LatoText style={{fontSize: 16, color: '#242222'}}>Recordatorios</LatoText>
            ) : (
              <LatoText style={{fontSize: 16, color: '#242222'}}>Parámetros</LatoText>
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
  scrollView: {
    width: '100%',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  roundedItem: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
  },
  petData: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  petDataImageContainer: {
    width: 152,
    height: 152,
    borderRadius: 99,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
  },
  petDataWeigthBarMask: {
    width: '100%',
    height: '100%',
    borderRadius: 99,
    overflow: 'hidden',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petDataWeigthBar: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  petImage: {
    width: 145,
    height: 145,
    borderRadius: 99,
  },
  petDataWeigthContainer: {
    position: 'absolute',
    bottom: -5,
    left: 0,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petDataWeigthBox: {
    backgroundColor: '#EF9B93',
    borderRadius: 5,
    padding: 5,
    paddingHorizontal: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  petDataWeigthTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#F6F6F6',
  },
  title: {
    marginTop: 5,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#191717',
  },
  petDataDescContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  petDataDescMain: {
    fontSize: 14,
    color: '#242222',
  },
  petDataDesc: {
    fontSize: 14,
    color: '#555151',
  },
  petDataAge: {
    fontSize: 24,
    color: '#EF9B93',
    fontWeight: 'bold',
  },
  petMenu: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  petMenuItemText: {
    fontSize: 16,
  },
  petMenuItemSelected: {
    width: '100%',
    height: 3,
    backgroundColor: '#458AC3',
    borderRadius: 99,
    position: 'absolute',
    bottom: -5,
  },
  petDataItemsContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 5,
  },
});

export default ManagePetScreen;