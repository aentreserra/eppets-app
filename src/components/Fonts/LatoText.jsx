import { Text } from 'react-native';
import React from 'react';

const LatoText = ({ children, style, numberOfLines, ...props }) => {
  return <Text style={[{fontFamily: 'Lato-Regular'}, style]} numberOfLines={numberOfLines} {...props}>{children}</Text>
}

export default LatoText;