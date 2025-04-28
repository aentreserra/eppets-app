import { View, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import LatoText from '../../components/Fonts/LatoText'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { getTimeStampInHours } from '../../utils/shared'
import AddCommunityModal from '../../components/Modals/AddCommunityModal'

const CommunityScreen = () => {

  const [isAddCommunityModalVisible, setIsAddCommunityModalVisible] = useState(false);

  const [communityData, setCommunityData] = useState([]);

  return (
    <SafeAreaView style={styles.page}>
      <AddCommunityModal isVisible={isAddCommunityModalVisible} setIsVisible={setIsAddCommunityModalVisible}/>
      <View style={styles.headerContainer}>
        <LatoText style={styles.title}>Comunidad</LatoText>
      </View>
      <View style={styles.itemsContainer}>
        {
          communityData.length < 1 ? (
            <View >
              <LatoText style={styles.noDataTitle}>No hay eventos en la comunidad</LatoText>
              <TouchableOpacity activeOpacity={0.8} onPress={() => setIsAddCommunityModalVisible(true)}>
                <LatoText style={styles.noDataClickable}>¡Añade uno!</LatoText>
              </TouchableOpacity>
            </View>
          ) : (
            communityData.map((item, index) => (
              <Item 
                key={index}
                title={item.title}
                location={item.location}
                timestamp={item.timestamp}
                description={item.description}
              />
            ))
          )
        }
      </View>
    </SafeAreaView>
  )
}

const Item = ({ title, location, timestamp, description }) => (
  <View style={styles.itemContainer}>
    <View style={styles.itemTopContainer}>
      <View style={styles.itemImageContainer}>
        <MaterialCommunityIcons name="dog" size={28} color="#EF9B93" />
      </View>
      <View style={styles.itemMiddleContainer}>
        <LatoText numberOfLines={2} style={styles.itemTitle}>{title}</LatoText>
        <LatoText numberOfLines={1} style={styles.itemMoreInfo}>{location} · {getTimeStampInHours(timestamp)}</LatoText>
      </View>
    </View>
    <LatoText numberOfLines={3} style={styles.itemDescription}>{description}</LatoText>
  </View>
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
  itemsContainer: {
    width: '100%',
    gap: 10,
  },
  itemContainer: {
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  itemTopContainer: {
    width: '100%',
    flexDirection: 'row',
  },
  itemImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EDDFD0',
  },
  itemMiddleContainer: {
    flex: 1,
    justifyContent: 'center',
    marginRight: 5,
  },
  seeMoreText: {
    fontSize: 12,
    color: '#555151',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#191717',
  },
  itemMoreInfo: {
    fontSize: 12,
    color: '#555151',
  },
  itemDescription: {
    fontSize: 14,
    color: '#555151',
    marginTop: 5,
  },
  noDataTitle: {
    fontSize: 18,
    color: '#191717',
    marginBottom: 10,
    textAlign: 'center',
  },
  noDataClickable: {
    fontSize: 15,
    color: '#458AC3',
    textAlign: 'center',
  },
});

export default CommunityScreen;