import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { newsStyles } from '../../styles/globalStyles';

const NewsCard = ({ news, onPress }) => {
  return (
    <TouchableOpacity 
      style={newsStyles.newsCard}
      onPress={() => onPress(news)}
    >
      <Image source={{ uri: news.image }} style={newsStyles.newsImage} />
      <View style={newsStyles.newsContent}>
        <Text style={newsStyles.newsTitle}>{news.title}</Text>
        <Text style={newsStyles.newsSummary}>{news.summary}</Text>
        <Text style={newsStyles.newsDate}>{news.date}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default NewsCard; 