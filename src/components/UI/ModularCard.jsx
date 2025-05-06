import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import LatoText from '../Fonts/LatoText';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ModularCard = ({title, icon, data, type, onClick, viewMoreClick}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          {icon}
          <LatoText style={styles.title}>{title}</LatoText>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity activeOpacity={0.8} onPress={viewMoreClick}>
            <LatoText style={styles.viewMoreText}>Ver todos <MaterialCommunityIcons name='arrow-right' /></LatoText>
          </TouchableOpacity>
        </View>
      </View>
      {
        type === 'reminders' ? (
          data.length > 0 && 
          data.map((item, index) => (
            <View key={index}>
              <View style={styles.reminderContainer}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons name={item.notiType === "pill" ? "pill" : item.notiType === "date" ? "calendar-heart" : "needle"} size={30} color="#EF9B93" />
                </View>
                <View>
                  <LatoText style={styles.reminderTitle}>{item.title}</LatoText>
                  <LatoText style={styles.reminderDesc}>{item.name} · {item.date}</LatoText>
                </View>
              </View>
              {index < data.length - 1 && (<View style={styles.devider}/>)}
            </View>
          ))
        ) : 
        type === 'picture' ? (
          <View style={styles.pictureContainer}>
            {
              data ? 
                <Image source={{ uri: data }} style={styles.pictureImage} resizeMode='cover' /> : 
              (
                <>
                  <LatoText style={styles.pictureText}>No has hecho la foto hoy :c</LatoText>
                  <TouchableOpacity activeOpacity={0.8} onPress={onClick}>
                    <LatoText style={styles.pictureTextCTR}>Hazla ahora</LatoText>
                  </TouchableOpacity>
                </>
            )
            }
          </View>
        ) : 
        type === 'news' ? (
          data.length > 0 && 
          data.map((item, index) => (
            <View key={index}>
              <View style={styles.notisContainer}>
                <View style={styles.notisIconContainer}>
                  <MaterialCommunityIcons name={item.icon} size={21} color="#EF9B93" />
                  {!item.userViewed && <View style={styles.notisWarning} />}
                </View>
                <View>
                  <LatoText numberOfLines={2} style={styles.notisTitle}>{item.title}</LatoText>
                </View>
              </View>
              {index < data.length - 1 && (<View style={styles.devider}/>)}
            </View>
          ))
        ) : (
          <>
            <LatoText style={styles.pictureText}>No hay datos disponibles</LatoText>
          </>
        )
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomColor: '#E8E8E8',
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  title: {
    fontSize: 16,
    color: '#191717',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewMoreText: {
    fontSize: 12,
    color: '#555151',
  },
  reminderContainer: {
    width: '100%',
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 99,
    backgroundColor: '#EDDFD0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reminderTitle: {
    fontSize: 17,
    color: '#191717',
  },
  reminderDesc: {
    fontSize: 14,
    color: '#242222',
    fontFamily: 'Lato-Light',
  },
  devider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E8E8E8',
    marginVertical: 10,
  },
  pictureContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#E8E8E8',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  pictureText: {
    fontSize: 13,
    color: '#242222',
  },
  pictureImage: {
    width: '100%',
    height: '100%',
  },
  pictureTextCTR: {
    fontSize: 14,
    color: '#458AC3',
  },
  notisIconContainer: {
    position: 'relative',
    width: 35,
    height: 35,
    borderRadius: 99,
    backgroundColor: '#EDDFD0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notisContainer: {
    width: '100%',
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notisTitle: {
    fontSize: 14,
    color: '#191717',
  },
  notisWarning: {
    width: 8,
    height: 8,
    backgroundColor: '#F8594B',
    borderRadius: 99,
    position: 'absolute',
    zIndex: 9,
    top: 0,
    right: 0,
  },
});

export default ModularCard;