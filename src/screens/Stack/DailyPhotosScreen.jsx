import { View, StyleSheet, TouchableOpacity, FlatList, Image, InteractionManager } from 'react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { getItem } from '../../utils/storage';
import { STORAGE_KEYS } from '../../constants/storageKeys';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import LatoText from '../../components/Fonts/LatoText';
import PictureModal from '../../components/Modals/PictureModal';

const getDayFormatted = (date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based

  return `${day}/${month}`;
}

const DailyPhotosScreen = ({navigation}) => {
  const [allPhotos, setAllPhotos] = useState([]);
  const [calendarDays, setCalendarDays] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const flatListRef = useRef(null);

  const currentYear = new Date().getFullYear();
  const todayKey = new Date().toDateString();

  useEffect(() => {
    loadPhotos();
  }, []);

  const generateCalendarData = useCallback((photos) => {
    const photosMap = new Map();
    photos.forEach(photo => {
      const dateKey = new Date(photo.date).toDateString().split('T')[0];
      photosMap.set(dateKey, photo.uri);
    });

    const daysArray = [];
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);

    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateKey = currentDate.toDateString();
      const photoUri = photosMap.get(dateKey) || null;
      
      daysArray.push({
        id: dateKey,
        date: currentDate.toISOString().split('T')[0],
        type: photoUri ? 'photo' : 'empty',
        uri: photoUri || null,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    setCalendarDays(daysArray);

    return daysArray;
  }, [currentYear]);

  const loadPhotos = async () => {
    let generatedData = null;
    try {
      setIsLoading(true);
      const photosData = await getItem(STORAGE_KEYS.DAILY_PHOTOS);
        const parsedPhotos = JSON.parse(photosData) || [];

        setAllPhotos(parsedPhotos);
        generatedData = generateCalendarData(parsedPhotos);
    } catch (error) {
      console.error("Error loading photos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToToday = (days) => {
    if (!days || days.length === 0 || !flatListRef.current) {
        return;
    }

    const todayIndex = days.findIndex(day => day.id === todayKey);

    if (todayIndex !== -1) {
        flatListRef.current.scrollToIndex({
            index: todayIndex,
            animated: true,
            viewPosition: 0.5, // Center the item in the view
        });
    }
  };

  const renderGridItem = ({ item }) => {
    const isToday = item.id === todayKey;
  
    const containerStyle = [
        item.type === 'photo' ? styles.imageContainer : styles.placeholder,
        isToday && styles.todayHighlight
    ];
  
    return (
        <View style={containerStyle}>
            <LatoText style={styles.dateText}>{getDayFormatted(new Date(item.date))}</LatoText>
            {item.type === 'photo' && (
                <Image style={styles.image} source={{ uri: item.uri }} />
            )}
        </View>
    );
  };


  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.headerContainer}>
        <MaterialIcons name="arrow-back-ios" size={24} color="#191717" onPress={() => navigation.goBack()} />
        <View style={styles.headerRow}>
          <TouchableOpacity activeOpacity={0.8} style={styles.roundedItem} onPress={() => setIsModalVisible(true)}>
            <MaterialIcons name="camera-alt" size={24} color="#EF9B93" />
          </TouchableOpacity>
        </View>
      </View>
      <LatoText style={styles.title}>Fotos Diarias</LatoText>
      <View>
        {isLoading ? (
          <LatoText style={styles.loadingText}>Cargando fotos...</LatoText>
        ) : (
          <FlatList 
            ref={flatListRef}
            data={calendarDays}
            keyExtractor={(item) => item.id.toString()}
            numColumns={5}
            renderItem={renderGridItem}
            getItemLayout={(data, index) => (
              { length: 100, offset: 100 * index, index }
            )}
            contentContainerStyle={styles.listContainer}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10 * 5}
            maxToRenderPerBatch={5 * 5}
            windowSize={15}
          />
        )}
      </View>
      <PictureModal isVisible={isModalVisible} setIsVisible={setIsModalVisible} />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
    zIndex: 2,
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
    zIndex: 99,
  },
  title: {
    fontSize: 24,
    color: '#191717',
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#242222',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContainer: {
    width: '100%',
    gap: 7,
    paddingBottom: 50,
    marginTop: 10,
  },
  image: {
    width: '100%',
    height: '100%',
    marginBottom: 10,
    marginRight: 5,
  },
  placeholder: {
    width: '18%',
    aspectRatio: 3/4,
    borderRadius: 10,
    backgroundColor: '#555151',
  },
  imageContainer: {
    position: 'relative',
    width: '18%',
    aspectRatio: 3/4,
    overflow: 'hidden',
    borderRadius: 10,
  },
  todayHighlight: {
    borderWidth: 4,
    borderColor: '#458AC3',
    borderRadius: 10,
  },
  dateText: {
    position: 'absolute',
    top: 5,
    right: 5,
    color: '#FFF',
    fontSize: 12,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default DailyPhotosScreen;