import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import LatoText from '../Fonts/LatoText';
import { MaterialIcons } from '@expo/vector-icons';

const MapSelection = ({ initialLocation, close }) => {

  const [selectedLocation, setSelectedLocation] = useState(null);

  return (
    <View style={styles.container}>
      <View>
        <LatoText style={styles.title}>Seleccionar una ubicacón</LatoText>
        <LatoText style={styles.subtitle}>Toca en el mapa para seleccionar una ubicación</LatoText>
        <TouchableOpacity activeOpacity={0.8} style={styles.close} onPress={() => close()}>
          <MaterialIcons name="close" size={30} color="#EF9B93" />
        </TouchableOpacity>
      </View>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: initialLocation.latitude,
          longitude: initialLocation.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        onPress={(e) => [setSelectedLocation(e.nativeEvent.coordinate), close(e.nativeEvent.coordinate)]}
      >
        {
          selectedLocation && (
            <Marker
              title="Ubicación seleccionada"
              coordinate={selectedLocation}
            />
          )
        }
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
    backgroundColor: '#F6F6F6'
  },
  map: { flex: 1 },
  title: {
    fontSize: 22,
    color: '#191717',
    textAlign: 'center',
    marginTop: 17
  },
  subtitle: {
    fontSize: 13,
    color: '#191717',
    textAlign: 'center',
    marginBottom: 10,
  },
  close: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFF',
    borderRadius: 99,
    padding: 5,
    elevation: 5,
  },
});

export default MapSelection;
