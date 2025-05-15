import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { tokenRefreshWrapper } from '../../services/tokenRefreshWrapper';
import { useUser } from '../../context/UserContext';
import { useToast } from 'react-native-toast-notifications';
import { useLevelUpModal } from '../../context/LevelUpModalContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import LatoText from '../../components/Fonts/LatoText';
import { formattedDateAndTime } from '../../utils/shared';
import Markdown, {MarkdownIt} from 'react-native-markdown-display';
import { markdownStyles } from '../../constants/globals';
import { getItem, storeItem } from '../../utils/storage';
import { STORAGE_KEYS } from '../../constants/storageKeys';

const EventInfoScreen = ({route, navigation}) => {
  const { eventId } = route.params; 

  const [eventData, setEventData] = useState({});
  const [isOwner, setIsOwner] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingParticipating, setLoadingParticipating] = useState(false);

  const {user, refreshUser, updateUser} = useUser();
  const {showLevelUpModal} = useLevelUpModal();
  const toast = useToast();

  useEffect(() => {
    fetchEventData();
  }, [eventId]);

  /**
   * Función para obtener los detalles del evento
   */
  const fetchEventData = async () => {
    try {
      setIsLoading(true);
      const response = await tokenRefreshWrapper('getEventDetails', {eventId}, toast, user, refreshUser, updateUser, showLevelUpModal);

      if (response.success) {
        const formattedBody = response.eventDetails.body?.replace(/\\n/g, '\n').replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\') || '';
        setEventData({...response.eventDetails, body: formattedBody});
        fetchLocalData(response.eventDetails);
        setIsOwner(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Función para obtener los datos locales de un evento
   * @param {object} _eventData - Los datos del evento
   */
  const fetchLocalData = async (_eventData) => {
    try {
      const localEvents = await getItem(STORAGE_KEYS.LOCAL_EVENTS);

      let parsedLocalEvents = [];
      if (localEvents) {
        parsedLocalEvents = JSON.parse(localEvents) || [];
      }

      const event = parsedLocalEvents.find(event => event.id === _eventData.id);
      if (event) {
        setEventData({..._eventData, is_participating: event.is_participating});
      }
    } catch (error) {
      console.error("Error fetching local events:", error);
    }
  };

  /**
   * Función para manejar la participación en el evento
   */
  const handleParticipate = async () => {
    try {
      setLoadingParticipating(true);
      const response = await tokenRefreshWrapper('participateInEvent', {eventId}, toast, user, refreshUser, updateUser, showLevelUpModal);

      if (response.success) {
        const tempData = {...eventData, participants: eventData.participants + 1, is_participating: true}; 

        setEventData(tempData);

        const localEvents = await getItem(STORAGE_KEYS.LOCAL_EVENTS);

        let parsedLocalEvents = [];
        if (localEvents) {
          parsedLocalEvents = JSON.parse(localEvents) || [];
        }

        parsedLocalEvents.push(tempData);
        
        await storeItem(STORAGE_KEYS.LOCAL_EVENTS, JSON.stringify(parsedLocalEvents));

        toast.show("Te has inscrito al evento", {type: 'success'});
      }
    } finally {
      setLoadingParticipating(false);
    }
  };

  /**
   * Función para manejar la desinscripción del evento
   */
  const handleUnparticipate = async () => {
    try {
      setLoadingParticipating(true);
      const response = await tokenRefreshWrapper('leaveEvent', {eventId}, toast, user, refreshUser, updateUser, showLevelUpModal);

      if (response.success) {
        const tempData = {...eventData, participants: eventData.participants - 1, is_participating: false};

        setEventData(tempData);

        const localEvents = await getItem(STORAGE_KEYS.LOCAL_EVENTS);

        let parsedLocalEvents = [];
        if (localEvents) {
          parsedLocalEvents = JSON.parse(localEvents) || [];
        }

        const updatedLocalEvents = parsedLocalEvents.filter(event => event.id !== eventId);
        
        await storeItem(STORAGE_KEYS.LOCAL_EVENTS, JSON.stringify(updatedLocalEvents));

        toast.show("Te has desinscrito del evento", {type: 'success'});
      }
    } finally {
      setLoadingParticipating(false);
    }
  };


  return (
    <SafeAreaView style={styles.page}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#191717" onPress={() => navigation.canGoBack ? navigation.goBack() : navigation.navigate("MainTabs")} />
            {isOwner && 
              <View style={styles.headerRow}>
                <TouchableOpacity activeOpacity={0.8} style={styles.roundedItem} onPress={() => {}}>
                  <MaterialIcons name="edit" size={24} color="#EF9B93" />
                </TouchableOpacity>
              </View>
            }
        </View>
        {isLoading ? (
          <LatoText style={styles.loadingText}>Cargando...</LatoText>
        ) : (
          <>
            <View style={styles.headerTitleContainer}>
              <View style={styles.iconBox}>
                <MaterialCommunityIcons name={eventData.icon_name} size={30} color="#FFF" />
              </View>
              <View>
                <LatoText numberOfLines={1} style={styles.eventTitle}>{eventData.title}</LatoText>
                <LatoText numberOfLines={2} style={styles.eventDescription}>{eventData.description}</LatoText>
              </View>
            </View>
            <LatoText style={styles.eventParticipants}>{eventData.participants || 0}</LatoText>
            <LatoText style={styles.middleText}>PARTICIPANTES</LatoText>
            <View style={styles.eventDataContainer}>
              <View style={styles.rowText}>
                <LatoText style={styles.eventDataLabel}>Fecha y hora:</LatoText>
                <LatoText style={styles.eventDataValue}>{formattedDateAndTime(eventData.event_datetime_utc)}</LatoText>
              </View>
              <View style={styles.rowText}>
                <LatoText style={styles.eventDataLabel}>Ubicación:</LatoText>
                <LatoText style={styles.eventDataValue}>{eventData.address}</LatoText>
              </View>
              {
                eventData.max_attendees !== null && (
                  <View style={styles.rowText}>
                    <LatoText style={styles.eventDataLabel}>Máximo de asistentes:</LatoText>
                    <LatoText style={styles.eventDataValue}>{eventData.max_attendees}</LatoText>
                  </View>
                )
              }
            </View>
            <TouchableOpacity activeOpacity={0.8} style={styles.eventButton} onPress={() => !loadingParticipating && eventData.is_participating ? handleUnparticipate() : handleParticipate()}>
              {!loadingParticipating && <LatoText style={styles.eventButtonText}>{eventData.is_participating ? "Asistiendo" : "Asistir"}</LatoText>}
              {loadingParticipating && <LatoText style={styles.eventButtonText}>Cargando...</LatoText>}
            </TouchableOpacity>
            <View style={styles.bodyContainer}>
              <Markdown 
                style={markdownStyles}
                markdownit={
                  MarkdownIt({typographer: true, breaks: true}).disable([ 'link', 'image' ])
                }
              >
                {eventData.body ? eventData.body : "No hay información adicional disponible."}
              </Markdown>
            </View>
          </>
        )}
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
  loadingText: {
    fontSize: 16,
    color: '#191717',
    textAlign: 'center',
    marginTop: 20,
  },
  modalContainer: {
    backgroundColor: '#EEEAE8',
    borderRadius: 10,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
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
    position: 'relative',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
  },
  headerTitleContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },
  iconBox: {
    width: 55,
    height: 55,
    borderRadius: 99,
    backgroundColor: '#EF9B93',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventTitle: {
    fontSize: 19,
    color: '#191717',
  },
  eventDescription: {
    fontSize: 14,
    color: '#555151',
  },
  eventParticipants: {
    fontSize: 30,
    color: '#191717',
    textAlign: 'center',
    marginTop: 5,
  },
  middleText: {
    fontSize: 13,
    color: '#555151',
    textAlign: 'center',
    marginBottom: 5,
    marginTop: 2,
  },
  eventDataContainer: {
    width: '100%',
    marginTop: 10,
    gap: 5,
  },
  rowText: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  eventDataLabel: {
    fontSize: 16,
    color: '#191717',
  },
  eventDataValue: {
    fontSize: 14,
    color: '#555151',
    marginTop: 5,
  },
  eventButton: {
    width: '100%',
    paddingVertical: 10,
    backgroundColor: '#EF9B93',
    borderRadius: 99,
    alignItems: 'center',
    marginTop: 20,
  },
  eventButtonText: {
    fontSize: 16,
    color: '#FFF',
  },
  bodyContainer: {
    width: '100%',
    marginTop: 20,
  },
});

export default EventInfoScreen;