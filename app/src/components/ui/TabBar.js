import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';

const TabBar = ({ tabs, activeTab, onTabPress }) => {
  return (
    <View style={globalStyles.tabContainer}>
      {tabs.map(tab => (
        <TouchableOpacity 
          key={tab.id}
          style={[
            globalStyles.tabButton, 
            activeTab === tab.id && globalStyles.activeTabButton
          ]} 
          onPress={() => onTabPress(tab.id)}
        >
          <Text style={[
            globalStyles.tabText, 
            activeTab === tab.id && globalStyles.activeTabText
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default TabBar; 