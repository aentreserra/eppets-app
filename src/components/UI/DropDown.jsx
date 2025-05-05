import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import React, { useState } from 'react'
import LatoText from '../Fonts/LatoText';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MAX_HEIGHT = 200;

const DropDown = ({
  options = [],
  selectedValue,
  onValueChange,
  placeholder = 'Selecciona...',
  leftIcon = null,
  disabled = false,
}) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const handleOptionSelect = (option) => {
    if (onValueChange) {
      onValueChange(option);
    }
    setIsDropdownVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.8} onPress={() => setIsDropdownVisible(!isDropdownVisible)} disabled={disabled}>
        <View style={[styles.dropdown, disabled && styles.disabled]}>
          {leftIcon && <MaterialCommunityIcons name={selectedValue ? selectedValue.icon : leftIcon} size={25} color="#242222" />}
          <LatoText style={styles.selectedText}>{selectedValue ? selectedValue.label : placeholder}</LatoText>
          <MaterialCommunityIcons name={isDropdownVisible ? 'chevron-up' : 'chevron-down'} size={25} color="#242222" style={styles.floatingRight}/>
        </View>
      </TouchableOpacity>
      {isDropdownVisible && (
        <View style={styles.dropdownList}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            style={styles.dropdownListScroll}
            contentContainerStyle={styles.dropdownListContent}
            bounces={false}
          >
            {options.map((option, index) => (
              <React.Fragment key={index}>
                <Item item={option} onPress={() => handleOptionSelect(option)} />
                {index < options.length - 1 && <View style={styles.devider} />}
              </React.Fragment>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  )
}

const Item = ({ item, onPress }) => {
  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      style={styles.item}
      onPress={onPress}
      disabled={item.disabled}
    >
      <MaterialCommunityIcons name={item.icon} size={25} color="#242222" />
      <LatoText style={styles.itemText}>{item.label}</LatoText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingRight: 50,
    height: 45,
    width: '100%',
    gap: 10,
  },
  floatingRight: {
    position: 'absolute',
    right: 10,
  },
  dropdownList: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    backgroundColor: '#F6F6F6',
    maxHeight: MAX_HEIGHT,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 50,
    width: '100%',
    zIndex: 1000,
  },
  dropdownListScroll: {
  },
  dropdownListContent: {
    paddingVertical: 5,
    paddingHorizontal: 7,
},
  item: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  itemText: {
    fontSize: 16,
    color: '#191717',
  },
  selectedText: {
    fontSize: 16,
    color: '#191717',
  },
  devider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E8E8E8',
    marginVertical: 10,
  },
  disabled: {
    backgroundColor: '#D9D9D9',
  },  
});

export default DropDown;