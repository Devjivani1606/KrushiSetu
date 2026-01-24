import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SplashScreen = ({ navigation }: any) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 3000); // Navigate to Home after 3 seconds
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Icon name="grass" size={100} color="#4CAF50" />
      <Text style={styles.appName}>KrushiSetu</Text>
      <Text style={styles.tagline}>Smart Soil Monitoring for Smart Farming</Text>
      <Text style={styles.loadingText}>Initializing Sensors...</Text>
      <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 20,
  },
  tagline: {
    fontSize: 16,
    color: '#388E3C',
    marginTop: 10,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 20,
  },
  loader: {
    marginTop: 20,
  },
});

export default SplashScreen;