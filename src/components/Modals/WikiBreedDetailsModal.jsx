import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import LatoText from '../Fonts/LatoText';

const screenHeight = Dimensions.get('window').height;

const formatKeyToTitle = (keyString) => {
  if (!keyString) return '';
  const result = keyString.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return result;
};

const renderComplexParameter = (title, dataObject, iconName, styles, unitOverride = null) => {
  if (!dataObject || typeof dataObject !== 'object') return null;
  const unit = unitOverride || dataObject.unit || '';
  const entries = Object.entries(dataObject);

  if (entries.length <= 4 && dataObject.min !== undefined && dataObject.max !== undefined) {
      return (
        <View style={styles.paramItemContainer}>
          <View style={styles.paramIconContainer}>
            <MaterialCommunityIcons name={iconName} size={20} color="#EF9B93" />
          </View>
          <View style={styles.paramTextContainer}>
            <LatoText style={styles.paramTitle}>{title}</LatoText>
            <LatoText style={styles.paramData}>
              {dataObject.min} - {dataObject.max} {unit}
            </LatoText>
            {dataObject.notes && <LatoText style={styles.paramNote}>Nota: {dataObject.notes}</LatoText>}
          </View>
        </View>
      );
  }

  return (
    <View style={styles.paramSection}>
      <View style={styles.paramItemContainer}>
        <View style={styles.paramIconContainer}>
          <MaterialCommunityIcons name={iconName} size={20} color="#EF9B93" />
        </View>
        <View style={styles.paramTextContainer}>
          <LatoText style={styles.paramTitle}>{title} {dataObject.unit && !unitOverride ? `(${dataObject.unit})` : ''}</LatoText>
          {entries.map(([key, value]) => {
            if (key === 'unit' || key === 'notes') return null;
            let displayValue = '';
            if (typeof value === 'object' && value !== null && value.min !== undefined && value.max !== undefined) {
              displayValue = `${value.min} - ${value.max} ${value.unit || unit}`;
            } else if (typeof value === 'object' && value !== null) {
              let subValues = [];
              if (value.ideal_min !== undefined && value.ideal_max !== undefined) subValues.push(`Ideal: ${value.ideal_min}-${value.ideal_max}`);
              else if (value.min_acceptable !== undefined && value.max_acceptable !== undefined) subValues.push(`Aceptable: ${value.min_acceptable}-${value.max_acceptable}`);
              else if (value.min !== undefined && value.max !== undefined) subValues.push(`${value.min}-${value.max}`);
              
              if (value.approx !== undefined) subValues.push(`Aprox: ${value.approx}`);

              displayValue = subValues.join(', ') + (subValues.length > 0 ? ` ${value.unit || unit}` : '');
              if (!displayValue && typeof value === 'object') displayValue = JSON.stringify(value);
            } else {
              displayValue = `${value}${key.toLowerCase().includes('min') || key.toLowerCase().includes('max') || key.toLowerCase().includes('volume') || key.toLowerCase().includes('length') ? ` ${unit}` : ''}`;
            }
            return (
              <View key={key} style={{ marginLeft: 5, marginTop: 3 }}>
                <LatoText style={styles.paramDataNestedTitle}>{formatKeyToTitle(key)}:</LatoText>
                <LatoText style={styles.paramDataNestedValue}>{displayValue || 'N/A'}</LatoText>
              </View>
            );
          })}
          {dataObject.notes && <LatoText style={styles.paramNote}>Nota: {dataObject.notes}</LatoText>}
        </View>
      </View>
    </View>
  );
};

const WikiBreedDetailsModal = ({ isVisible, onClose, breedItem }) => {
  if (!breedItem) return null;

  console.log('BreedItem:', breedItem);

  const parameters = breedItem?.parameters || {};

  console.log('Parameters:', parameters);

  const renderContent = () => {
    return (
      <View style={styles.paramsContainer}>
        {parameters.lifespan && (
            <View style={styles.paramItemContainer}>
            <View style={styles.paramIconContainer}><MaterialCommunityIcons name="heart-pulse" size={20} color="#EF9B93" /></View>
            <View style={styles.paramTextContainer}>
                <LatoText style={styles.paramTitle}>Esperanza de vida</LatoText>
                <LatoText style={styles.paramData}>{parameters.lifespan.min} - {parameters.lifespan.max} {parameters.lifespan.unit || 'años'}</LatoText>
            </View>
            </View>
        )}
        {parameters.weight && renderComplexParameter('Peso Referencial', parameters.weight, 'scale-bathroom', styles)}
        {(parameters.size_category || parameters.adult_length) && (
            <View style={styles.paramItemContainer}>
            <View style={styles.paramIconContainer}><MaterialCommunityIcons name="ruler-square" size={20} color="#EF9B93" /></View>
            <View style={styles.paramTextContainer}>
                <LatoText style={styles.paramTitle}>{parameters.adult_length ? 'Longitud/Altura Adulta' : 'Categoría de Tamaño'}</LatoText>
                {parameters.adult_length ? (
                <LatoText style={styles.paramData}>
                    {typeof parameters.adult_length === 'object' ? 
                    `${parameters.adult_length.approx || (parameters.adult_length.min +'-'+ parameters.adult_length.max)} ${parameters.adult_length.unit}` : 
                    parameters.adult_length}
                    {parameters.adult_length.notes && ` (${parameters.adult_length.notes})`}
                </LatoText>
                ) : (<LatoText style={styles.paramData}>{parameters.size_category}</LatoText>)}
            </View>
            </View>
        )}
        {parameters.temperament && (
            <View style={styles.paramItemContainer}>
            <View style={styles.paramIconContainer}><MaterialCommunityIcons name="paw" size={20} color="#EF9B93" /></View>
            <View style={styles.paramTextContainer}>
                <LatoText style={styles.paramTitle}>Temperamento</LatoText>
                {Array.isArray(parameters.temperament) ? (
                parameters.temperament.map((item, index) => <LatoText key={index} style={styles.paramListItem}>• {item}</LatoText>)
                ) : <LatoText style={styles.paramData}>{parameters.temperament}</LatoText>}
            </View>
            </View>
        )}
        {(parameters.primary_diet_type || parameters.diet_type) && (
            <View style={styles.paramItemContainer}>
            <View style={styles.paramIconContainer}><MaterialCommunityIcons name="food-apple-outline" size={20} color="#EF9B93" /></View>
            <View style={styles.paramTextContainer}>
                <LatoText style={styles.paramTitle}>Tipo de Dieta</LatoText>
                <LatoText style={styles.paramData}>{parameters.primary_diet_type || parameters.diet_type}</LatoText>
            </View>
            </View>
        )}
        {parameters.social_needs && (
            <View style={styles.paramItemContainer}>
                <View style={styles.paramIconContainer}><MaterialCommunityIcons name="account-group-outline" size={20} color="#EF9B93" /></View>
                <View style={styles.paramTextContainer}>
                <LatoText style={styles.paramTitle}>Necesidades Sociales</LatoText>
                {Array.isArray(parameters.social_needs) ? 
                    parameters.social_needs.map((item, index) => <LatoText key={index} style={styles.paramListItem}>• {item}</LatoText>) :
                    <LatoText style={styles.paramData}>{parameters.social_needs}</LatoText>
                }
                </View>
            </View>
        )}
        {(parameters.housing_notes || parameters.enclosure_min_size) && (
            <View style={styles.paramItemContainer}>
                <View style={styles.paramIconContainer}><MaterialCommunityIcons name="home-city-outline" size={20} color="#EF9B93" /></View>
                <View style={styles.paramTextContainer}>
                <LatoText style={styles.paramTitle}>{parameters.housing_notes ? 'Notas de Alojamiento' : 'Tamaño Mín. Recinto'}</LatoText>
                {parameters.housing_notes && Array.isArray(parameters.housing_notes) &&
                    parameters.housing_notes.map((item, index) => <LatoText key={index} style={styles.paramListItem}>• {item}</LatoText>)
                }
                {parameters.enclosure_min_size && <LatoText style={styles.paramData}>{parameters.enclosure_min_size}</LatoText>}
                </View>
            </View>
        )}
        {parameters.temperature && renderComplexParameter('Temperatura', parameters.temperature, 'thermometer', styles)}
        {parameters.humidity && renderComplexParameter('Humedad', parameters.humidity, 'water-percent', styles)}
        {parameters.lighting && (
            <View style={styles.paramItemContainer}>
                <View style={styles.paramIconContainer}><MaterialCommunityIcons name="lightbulb-on-outline" size={20} color="#EF9B93" /></View>
                <View style={styles.paramTextContainer}>
                <LatoText style={styles.paramTitle}>Iluminación</LatoText>
                {Array.isArray(parameters.lighting) ? 
                    parameters.lighting.map((item, index) => <LatoText key={index} style={styles.paramListItem}>• {item}</LatoText>) :
                    <LatoText style={styles.paramData}>{parameters.lighting}</LatoText>
                }
                </View>
            </View>
        )}
        {parameters.min_tank_size && renderComplexParameter('Tamaño Mín. Acuario', parameters.min_tank_size, 'barrel', styles, parameters.min_tank_size.unit)}
        {parameters.ph && renderComplexParameter('Rango de pH', parameters.ph, 'ph', styles)}
        {parameters.salinity && renderComplexParameter('Salinidad', parameters.salinity, 'water-opacity', styles)}
        {parameters.substrate && (
            <View style={styles.paramItemContainer}>
                <View style={styles.paramIconContainer}><MaterialCommunityIcons name="shovel" size={20} color="#EF9B93" /></View>
                <View style={styles.paramTextContainer}>
                <LatoText style={styles.paramTitle}>Sustrato Recomendado</LatoText>
                {Array.isArray(parameters.substrate) ? 
                    parameters.substrate.map((item, index) => <LatoText key={index} style={styles.paramListItem}>• {item}</LatoText>) :
                    <LatoText style={styles.paramData}>{parameters.substrate}</LatoText>
                }
                </View>
            </View>
        )}
        {parameters.water_needs && (
            <View style={styles.paramItemContainer}>
                <View style={styles.paramIconContainer}><MaterialCommunityIcons name="water-well-outline" size={20} color="#EF9B93" /></View>
                <View style={styles.paramTextContainer}>
                <LatoText style={styles.paramTitle}>Necesidades de Agua</LatoText>
                {Array.isArray(parameters.water_needs) ? 
                    parameters.water_needs.map((item, index) => <LatoText key={index} style={styles.paramListItem}>• {item}</LatoText>) :
                    <LatoText style={styles.paramData}>{parameters.water_needs}</LatoText>
                }
                </View>
            </View>
        )}
        {parameters.health_notes && (
            <View style={styles.paramItemContainer}>
                <View style={styles.paramIconContainer}><MaterialCommunityIcons name="hospital-box-outline" size={20} color="#EF9B93" /></View>
                <View style={styles.paramTextContainer}>
                <LatoText style={styles.paramTitle}>Notas de Salud</LatoText>
                {Array.isArray(parameters.health_notes) &&
                    parameters.health_notes.map((item, index) => <LatoText key={index} style={styles.paramListItem}>• {item}</LatoText>)
                }
                </View>
            </View>
        )}
        {/* Fallback para otros parámetros no cubiertos explícitamente */}
        {Object.entries(parameters)
            .filter(([key]) => ![
            'lifespan', 'weight', 'size_category', 'adult_length', 'temperament', 'primary_diet_type', 'diet_type', 'name',
            'social_needs', 'housing_notes', 'enclosure_min_size', 'temperature', 'humidity', 'lighting',
            'min_tank_size', 'ph', 'salinity', 'substrate', 'water_needs', 'health_notes',
            'add_pet_alert', 'ethical_considerations', 'legal_status_warning', 'safety_risk', 'recommendation', 'care_complexity'
            ].includes(key))
            .map(([key, value]) => (
            <View key={key} style={styles.paramItemContainer}>
                <View style={styles.paramIconContainer}><MaterialCommunityIcons name="information-outline" size={20} color="#EF9B93" /></View>
                <View style={styles.paramTextContainer}>
                <LatoText style={styles.paramTitle}>{formatKeyToTitle(key)}</LatoText>
                {typeof value === 'object' && value !== null ? (
                    <LatoText style={styles.paramData}>{JSON.stringify(value)}</LatoText>
                ) : Array.isArray(value) ? (
                    value.map((item, idx) => <LatoText key={idx} style={styles.paramListItem}>• {item}</LatoText>)
                ) : (
                    <LatoText style={styles.paramData}>{String(value)}</LatoText>
                )}
                </View>
            </View>
        ))}
      </View>
    );
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropTransitionOutTiming={0}
      useNativeDriverForBackdrop
      deviceHeight={screenHeight}
    >
      <View style={styles.viewModal}>
        <View style={styles.headerModal}>
          <LatoText style={styles.modalTitle} numberOfLines={1}>{breedItem.name}</LatoText>
          <TouchableOpacity onPress={onClose} style={styles.roundedItem}>
            <MaterialIcons name="close" size={28} color="#EF9B93" />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContentModal}>
          {Object.keys(parameters).length > 0 ? (
            renderContent()
          ) : (
            <View style={styles.noParamsContainer}>
              <MaterialCommunityIcons name="alert-circle-outline" size={40} color="#757575" />
              <LatoText style={styles.noParamsText}>
                No hay parámetros detallados disponibles para esta selección.
              </LatoText>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  viewModal: {
    backgroundColor: '#EEEAE8',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.85,
  },
  headerModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 5,
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
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Lato-Bold',
    color: '#191717',
    flex: 1,
    marginRight: 10,
  },
  closeButton: {
    padding: 5,
  },
  scrollContentModal: {
    padding: 10,
    paddingBottom: 30,
  },
  paramsContainer: {
    backgroundColor: '#FDFDFD',
    padding: 15,
    borderRadius: 15,
  },
  paramSection: {
    marginBottom: 15,
    gap: 8,
  },
  paramItemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  paramIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EF9B9320',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  paramTextContainer: {
    flex: 1,
    gap: 4,
  },
  paramTitle: {
    fontSize: 16,
    fontFamily: 'Lato-Bold',
    color: '#191717',
  },
  paramData: {
    fontSize: 15,
    fontFamily: 'Lato-Regular',
    color: '#333333',
    lineHeight: 20,
  },
  paramDataNestedTitle: {
    fontSize: 14,
    fontFamily: 'Lato-Bold',
    color: '#458AC3',
    marginTop: 3,
  },
  paramDataNestedValue: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    color: '#555151',
    lineHeight: 18,
    marginLeft: 8,
  },
  paramListItem: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    color: '#555151',
    marginLeft: 5,
    lineHeight: 19,
    marginBottom: 2,
  },
  paramNote: {
    fontSize: 13,
    fontFamily: 'Lato-Italic',
    color: '#777777',
    marginTop: 3,
    lineHeight: 17,
  },
  noParamsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noParamsText: {
    fontSize: 16,
    fontFamily: 'Lato-Regular',
    color: '#555151',
    textAlign: 'center',
    marginTop: 15,
  },
  primateWarningContainer: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FFB74D',
    borderWidth: 1,
    padding: 15,
    borderRadius: 10,
  },
  primateWarningIconContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  primateWarningTitle: {
    fontSize: 17,
    fontFamily: 'Lato-Bold',
    color: '#E65100',
    textAlign: 'center',
    marginTop: 5,
  },
  primateSectionTitle: {
    fontSize: 15,
    fontFamily: 'Lato-Bold',
    color: '#BF360C',
    marginTop: 8,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#FFCC80',
    paddingBottom: 2,
  },
  primateWarningText: {
    fontSize: 14,
    fontFamily: 'Lato-Regular',
    color: '#4E342E',
    lineHeight: 19,
    marginBottom: 3,
  },
});

export default WikiBreedDetailsModal;