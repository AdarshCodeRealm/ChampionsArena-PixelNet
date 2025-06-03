import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';

const SectionHeader = ({ title, showViewAll = false, onViewAllPress, viewAllText = 'View All' }) => {
  return (
    <View style={globalStyles.sectionHeader}>
      <Text style={globalStyles.sectionTitle}>{title}</Text>
      {showViewAll && (
        <TouchableOpacity onPress={onViewAllPress}>
          <Text style={globalStyles.viewAllText}>{viewAllText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SectionHeader; 