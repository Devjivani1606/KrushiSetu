import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const SensorDetails = ({ route, navigation }: any) => {
  const { sensorData } = route.params;
  const [data, setData] = useState(sensorData);

  const refreshData = () => {
    // Simulate refreshing data
    setData({
      ...data,
      moisture: Math.floor(Math.random() * 100),
      temperature: Math.floor(Math.random() * 40) + 10,
      humidity: Math.floor(Math.random() * 100),
      ph: (Math.random() * 4 + 4).toFixed(1),
      battery: Math.max(0, data.battery - Math.floor(Math.random() * 10)),
      lastSync: new Date().toLocaleString(),
    });
  };

  const details = [
    { label: 'Soil Moisture', value: `${data.moisture}%`, icon: 'opacity' },
    { label: 'Temperature', value: `${data.temperature}°C`, icon: 'thermostat' },
    { label: 'Humidity', value: `${data.humidity}%`, icon: 'water-drop' },
    { label: 'Soil pH', value: data.ph, icon: 'science' },
    { label: 'Battery Level', value: `${data.battery}%`, icon: 'battery-full' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#2E7D32" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sensor Details</Text>
        <View />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {details.map((item, index) => (
          <View key={index} style={styles.detailCard}>
            <Icon name={item.icon} size={40} color="#4CAF50" />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>{item.label}</Text>
              <Text style={styles.detailValue}>{item.value}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.refreshButton} onPress={refreshData}>
          <Icon name="refresh" size={24} color="#FFFFFF" />
          <Text style={styles.refreshText}>Refresh Data</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Home')}>
          <Icon name="home" size={24} color="#2E7D32" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="analytics" size={24} color="#4CAF50" />
          <Text style={styles.navText}>Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F8E9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#E8F5E8',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  content: {
    padding: 20,
  },
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailText: {
    marginLeft: 20,
    flex: 1,
  },
  detailLabel: {
    fontSize: 16,
    color: '#388E3C',
  },
  detailValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 5,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
  },
  refreshText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 10,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#E8F5E8',
    paddingVertical: 10,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#2E7D32',
  },
});

export default SensorDetails;