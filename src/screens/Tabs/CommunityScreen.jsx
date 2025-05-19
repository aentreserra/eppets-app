import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import LatoText from '../../components/Fonts/LatoText'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { formattedDateAndTime, getTimeStampInHours } from '../../utils/shared'
import AddCommunityModal from '../../components/Modals/AddCommunityModal'
import { tokenRefreshWrapper } from '../../services/tokenRefreshWrapper'
import { useToast } from 'react-native-toast-notifications'
import { useUser } from '../../context/UserContext'
import * as Location from 'expo-location';
import { calculateLevelFromXP } from '../../utils/levelManager'
import { useLevelUpModal } from '../../context/LevelUpModalContext'

const CommunityScreen = ({navigation}) => {

  const [isAddCommunityModalVisible, setIsAddCommunityModalVisible] = useState(false);

  const [isSecondTabFetched, setIsSecondTabFetched] = useState(false);
  const [isThirdTabFetched, setIsThirdTabFetched] = useState(false);

  const [communityData, setCommunityData] = useState([]);
  const [participingEvents, setParticipatingEvents] = useState([]);
  const [ownedEvents, setOwnedEvents] = useState([]);
  const [userLevel, setUserLevel] = useState();

  const [communityTab, setCommunityTab] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const toast = useToast();
  const {user, refreshUser, updateUser} = useUser();
  const {showLevelUpModal} = useLevelUpModal();

  useEffect(() => {
    if (isLoading) return;
    fetchCommunityData();
    getUserLevel();
  }, []);

  useEffect(() => {
    if (communityTab === 1 && !isSecondTabFetched) {
      setIsSecondTabFetched(true);
      fetchParticipatedEvents();
    } else if (communityTab === 2 && !isThirdTabFetched) {
      setIsThirdTabFetched(true);
      fetchOwnedEvents();
    }
  }, [communityTab]);

  /**
   * Función para obtener los datos de la comunidad
   */
  const fetchCommunityData = async () => {
    try {
      setIsLoading(true);

      const location = await requestLocationPermission();
      if (!location) {
        toast.show('No se pudo obtener la ubicación', {type: 'danger'});
        return;
      }

      const locationData = {
        latitude: location?.coords.latitude,
        longitude: location?.coords.longitude,
      };

      const response = await tokenRefreshWrapper('getCommunityEvents', locationData, toast, user, refreshUser, updateUser, showLevelUpModal);

      if (response) {
        setCommunityData(response.events);
      } else {
        toast.show('Error al cargar los datos de la comunidad', {type: 'danger'});
      }
    } catch (error) {
      console.log('Error al cargar los datos de la comunidad', error);
      toast.show('Error desconocido', {type: 'danger'});
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Función para obtener los eventos en los que el usuario está apuntado
   */
  const fetchParticipatedEvents = async () => {
    try {
      setIsLoading(true);

      const response = await tokenRefreshWrapper('getParticipingEvents', {}, toast, user, refreshUser, updateUser, showLevelUpModal);

      if (response.success) {
        setParticipatingEvents(response.events || []);
      } else {
        toast.show('Error al cargar tus eventos', {type: 'danger'});
      }
    } catch (error) {
      console.log('Error al cargar tus eventos', error);
      toast.show('Error desconocido', {type: 'danger'});
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Función para obtener los eventos que el usuario ha creado
   */
  const fetchOwnedEvents = async () => {
    try {
      setIsLoading(true);

      const response = await tokenRefreshWrapper('getOwnedCommunityEvents', {}, toast, user, refreshUser, updateUser, showLevelUpModal);

      if (response.success) {
        setOwnedEvents(response.events || []);
      } else {
        toast.show('Error al cargar tus eventos', {type: 'danger'});
      }
    } catch (error) {
      console.log('Error al cargar tus eventos', error);
      toast.show('Error desconocido', {type: 'danger'});
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Función para obtener el nivel del usuario
   */
  const getUserLevel = () => {
    if (!user) return;

    const {level} = calculateLevelFromXP(user.xp);
    console.log('User XP: ', level);

    setUserLevel(level);
  };

  /**
   * Función para solicitar permisos de ubicación
   * @returns {boolean || Object} - Devuelve la ubicación del usuario o false si no se puede obtener
   */
  const requestLocationPermission = async () => {
    setIsGettingLocation(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return false;
    }
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    console.log('Location: ', location);  
    if (!location || !location.coords) {
      toast.show('No se pudo obtener la ubicación', {type: 'danger'});
      setIsGettingLocation(false);
      return false;
    }
    setIsGettingLocation(false);
    return location;
  };

  /**
   * Función para abrir el modal de creación de eventos
   */
  const handleOpenCreateModal = () => {
    if (userLevel < 5) {
      toast.show("Necesitas nivel 5 para poder crear eventos", {type: 'danger'})
      return;
    }

    setIsAddCommunityModalVisible(true);
  };

  /**
   * Función para cargar los datos de los eventos una vez añadido
   */
  const handleCloseModal = async () => {
    await fetchCommunityData();
    await fetchOwnedEvents();
  };

  /**
   * Componente para mostrar los eventos de la comunidad
   */
  const Item = ({ id, icon, title, description, distance, timestamp }) => (
    <TouchableOpacity activeOpacity={0.8} style={styles.itemContainer} onPress={() => navigation.navigate('EventInfo', {eventId: id})}>
      <View style={styles.itemTopContainer}>
        <View style={styles.itemImageContainer}>
          <MaterialCommunityIcons name={icon} size={28} color="#EF9B93" />
        </View>
        <View style={styles.itemMiddleContainer}>
          <LatoText numberOfLines={2} style={styles.itemTitle}>{title}</LatoText>
          <LatoText numberOfLines={1} style={styles.itemMoreInfo}>{distance} km · {formattedDateAndTime(timestamp)}</LatoText>
        </View>
      </View>
      <LatoText numberOfLines={3} style={styles.itemDescription}>{description}</LatoText>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.page}>
      <AddCommunityModal isVisible={isAddCommunityModalVisible} setIsVisible={setIsAddCommunityModalVisible} onClose={handleCloseModal}/>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollView}>
        <View style={styles.headerContainer}>
          <LatoText style={styles.title}>Eventos Comunidad</LatoText>
          <TouchableOpacity activeOpacity={0.9} style={styles.roundedButton} onPress={handleOpenCreateModal}>
            <MaterialCommunityIcons name="plus-circle" size={30} color="#458AC3" />
          </TouchableOpacity>
        </View>
        <View style={styles.menu}>
            <TouchableOpacity activeOpacity={0.8} style={styles.menuItem} onPress={() => setCommunityTab(0)}>
              <LatoText style={[styles.menuItemText, {color: communityTab === 0 ? "#458AC3" : "#242222"}]}>Eventos</LatoText>
              {communityTab === 0 && <View style={styles.menuItemSelected} />}
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} style={styles.menuItem} onPress={() => setCommunityTab(1)}>
              <LatoText style={[styles.menuItemText, {color: communityTab === 1 ? "#458AC3" : "#242222"}]}>Apuntados</LatoText>
              {communityTab === 1 && <View style={styles.menuItemSelected} />}
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} style={styles.menuItem} onPress={() => setCommunityTab(2)}>
              <LatoText style={[styles.menuItemText, {color: communityTab === 2 ? "#458AC3" : "#242222"}]}>Tus Eventos</LatoText>
              {communityTab === 2 && <View style={styles.menuItemSelected} />}
            </TouchableOpacity>
          </View>
        <View style={styles.itemsContainer}>

          {/* TAB 0 - EVENTOS */}
          {(!isLoading && communityTab === 0 && communityData.length > 0) ? 
          (
            communityData.map((item, index) => (
              <Item 
                key={index}
                id={item.id}
                icon={item.icon_name}
                title={item.title}
                description={item.description}
                distance={item.distance}
                timestamp={item.event_datetime_utc}
              />
            ))
          ) : (!isLoading && communityTab === 0) && 
          (
            <View >
              <LatoText style={styles.noDataTitle}>No hay eventos en la comunidad</LatoText>
              <TouchableOpacity activeOpacity={0.8} onPress={handleOpenCreateModal}>
                <LatoText style={styles.noDataClickable}>¡Añade uno!</LatoText>
              </TouchableOpacity>
            </View>
          )}
          {(isLoading && communityTab === 0) && (
            <LatoText style={styles.noDataTitle}>{isGettingLocation ? "Obteniendo ubicación..." : "Cargando eventos..."}</LatoText>
          )}

          {/* TAB 1 - APUNTADOS */}
          {(!isLoading && communityTab === 1 && participingEvents.length > 0) ? 
          (
            participingEvents.map((item, index) => (
              <Item 
                key={index}
                id={item.id}
                icon={item.icon_name}
                title={item.title}
                description={item.description}
                distance={item.distance}
                timestamp={item.event_datetime_utc}
              />
            ))
          ) : (!isLoading && communityTab === 1) &&
          (
            <View >
              <LatoText style={styles.noDataTitle}>No te has apuntando a eventos por ahora</LatoText>
            </View>
          )}
          {(isLoading && communityTab === 1) && (
            <LatoText style={styles.noDataTitle}>Cargando eventos...</LatoText>
          )}

          {/* TAB 2 - TUS EVENTOS */}
          {(!isLoading && communityTab === 2 && ownedEvents.length > 0) ? 
          (
            ownedEvents.map((item, index) => (
              <Item 
                key={index}
                id={item.id}
                icon={item.icon_name}
                title={item.title}
                description={item.description}
                distance={item.distance}
                timestamp={item.event_datetime_utc}
              />
            ))
          ) : (!isLoading && communityTab === 2) && 
          (
            <View >
              <LatoText style={styles.noDataTitle}>No hay eventos en la comunidad</LatoText>
              <TouchableOpacity activeOpacity={0.8} onPress={handleOpenCreateModal}>
                <LatoText style={styles.noDataClickable}>¡Añade uno!</LatoText>
              </TouchableOpacity>
            </View>
          )}
          {(isLoading && communityTab === 2) && (
            <LatoText style={styles.noDataTitle}>{isGettingLocation ? "Obteniendo ubicación..." : "Cargando eventos..."}</LatoText>
          )}
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
    flexGrow: 1,
    paddingBottom: 55,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  roundedButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
    marginTop: -5,
    marginRight: 0,
  },
  menu: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuItemText: {
    fontSize: 16,
    color: '#242222',
  },
  menuItemSelected: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '100%',
    backgroundColor: '#458AC3',
  },
  title: {
    fontSize: 24,
    color: '#191717',
  },
  itemsContainer: {
    width: '100%',
    gap: 5,
  },
  itemContainer: {
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#00000070',
    shadowOffset: {
      width: 0,
      height: 2,
    },
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