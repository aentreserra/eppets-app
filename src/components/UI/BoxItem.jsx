import { View, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import LatoText from '../Fonts/LatoText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getMonthName } from '../../utils/shared';

const BoxItem = ({ item, onPress }) => {
  if (!item) return null;

  const {
    visit_date,
    vet_name,
    diagnosis,
    treatment,
    notes,
    document_url,
  } = item;

  const displayDate = new Date(visit_date);

  return (
    <TouchableOpacity style={styles.boxItemContainer} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.dateSection}>
        <LatoText style={styles.dateDay}>{String(displayDate.getDate()).padStart(2, '0')}</LatoText>
        <LatoText style={styles.dateMonth}>
          {getMonthName(displayDate).slice(0, 5).toUpperCase()}
        </LatoText>
        <LatoText style={styles.dateYear}>{displayDate.getFullYear()}</LatoText>
      </View>
      <View style={styles.contentSection}>
        <View style={styles.headerRow}>
          <LatoText style={styles.diagnosisText} numberOfLines={2}>
            {diagnosis || "Visita registrada"}
          </LatoText>
          {document_url && (
            <MaterialCommunityIcons name="paperclip" size={20} color="#458AC3" />
          )}
        </View>

        {vet_name && (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="doctor" size={16} color="#55515180" />
            <LatoText style={styles.detailText} numberOfLines={1}>
              {vet_name}
            </LatoText>
          </View>
        )}

        {treatment && (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="medical-bag" size={16} color="#55515180" />
            <LatoText style={styles.detailText} numberOfLines={1}>
              {treatment}
            </LatoText>
          </View>
        )}

        {notes && (
          <LatoText style={styles.notesPreviewText} numberOfLines={1}>
            Notas disponibles...
          </LatoText>
        )}

        {!vet_name && !treatment && !notes && !document_url && (
             <LatoText style={styles.noExtraInfoText}>Toca para ver detalles.</LatoText>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  boxItemContainer: {
    width: '100%',
    backgroundColor: '#F6F6F6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    flexDirection: 'row',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#00000070',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2.0,
  },
  dateSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    paddingHorizontal: 8,
    minWidth: 55,
  },
  dateDay: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#EF9B93',
  },
  dateMonth: {
    fontSize: 13,
    color: '#555151',
  },
  dateYear: {
    fontSize: 13,
    color: '#555151',
    fontWeight: '200',
  },
  contentSection: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  diagnosisText: {
    width: '85%',
    fontSize: 16,
    color: '#191717',
    marginRight: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#555151',
    flex: 1,
  },
  notesPreviewText: {
    fontSize: 13,
    color: '#555151',
    marginTop: 4,
  },
  noExtraInfoText: {
    fontSize: 13,
    color: '#555151',
    marginTop: 4,
  }
});

export default BoxItem;