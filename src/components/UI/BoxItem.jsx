import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import LatoText from '../Fonts/LatoText'
import { MaterialCommunityIcons } from '@expo/vector-icons'

const BoxItem = ({iconName, title, desc}) => {
  return (
    <View style={styles.boxItemContainer}>
      <View style={styles.boxItemIconContainer}>
        <MaterialCommunityIcons name={iconName} size={25} color="#EF9B93" />
      </View>
      <View>
        <LatoText numberOfLines={1} style={styles.boxItemText}>{title}</LatoText>
        <LatoText numberOfLines={2} style={styles.boxItemDesc}>{desc}</LatoText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  boxItemContainer: {
    width: '100%',
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#00000070',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 3.84,
    elevation: 5,
  },
  boxItemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EDDFD0',
  },
  boxItemText: {
    fontSize: 16,
    color: '#191717'
  },
  boxItemDesc: {
    fontSize: 14,
    color: '#191717',
    opacity: 0.7
  }
});

export default BoxItem;