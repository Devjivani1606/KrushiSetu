import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HomeDashboard = ({ navigation }: any) => {
  // Dummy sensor data
  const sensorData = {
    moisture: 65,
    temperature: 24,
    humidity: 70,
    ph: 6.5,
    battery: 85,
    lastSync: '2023-10-01 14:30',
    deviceId: 'KS-001',
    status: 'Active', // or 'Offline'
  };

  const cards = [
    { label: 'Soil Moisture', value: `${sensorData.moisture}%`, icon: 'opacity' },
    { label: 'Temperature', value: `${sensorData.temperature}°C`, icon: 'thermostat' },
    { label: 'Humidity', value: `${sensorData.humidity}%`, icon: 'water-drop' },
    { label: 'Soil pH', value: sensorData.ph.toString(), icon: 'science' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>KrushiSetu</Text>
        <TouchableOpacity>
          <Icon name="settings" size={24} color="#2E7D32" />
        </TouchableOpacity>
      </View>

      {/* Sensor Status */}
      <View style={styles.statusContainer}>
        <Icon name={sensorData.status === 'Active' ? 'wifi' : 'wifi-off'} size={20} color={sensorData.status === 'Active' ? '#4CAF50' : '#F44336'} />
        <Text style={[styles.statusText, { color: sensorData.status === 'Active' ? '#4CAF50' : '#F44336' }]}>
          {sensorData.status}
        </Text>
      </View>

      {/* Grid Cards */}
      <ScrollView contentContainerStyle={styles.grid}>
        {cards.map((card, index) => (
          <TouchableOpacity key={index} style={styles.card} onPress={() => navigation.navigate('SensorDetails', { sensorData })}>
            <Icon name={card.icon} size={40} color="#4CAF50" />
            <Text style={styles.cardValue}>{card.value}</Text>
            <Text style={styles.cardLabel}>{card.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Device Info */}
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceTitle}>Device Information</Text>
        <View style={styles.deviceRow}>
          <Icon name="battery-full" size={20} color="#4CAF50" />
          <Text style={styles.deviceText}>Battery: {sensorData.battery}%</Text>
        </View>
        <View style={styles.deviceRow}>
          <Icon name="sync" size={20} color="#4CAF50" />
          <Text style={styles.deviceText}>Last Sync: {sensorData.lastSync}</Text>
        </View>
        <View style={styles.deviceRow}>
          <Icon name="device-hub" size={20} color="#4CAF50" />
          <Text style={styles.deviceText}>Device ID: {sensorData.deviceId}</Text>
        </View>
      </View>

      {/* Bottom Navigation Placeholder */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Icon name="home" size={24} color="#4CAF50" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('SensorDetails', { sensorData })}>
          <Icon name="analytics" size={24} color="#2E7D32" />
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  statusText: {
    fontSize: 16,
    marginLeft: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    margin: 10,
    width: '40%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 10,
  },
  cardLabel: {
    fontSize: 14,
    color: '#388E3C',
    marginTop: 5,
  },
  deviceInfo: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 10,
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  deviceText: {
    fontSize: 14,
    color: '#388E3C',
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

export default HomeDashboard;