import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import SensorCard from '../components/SensorCard';
import { COLORS } from '../theme/colors';
const DashboardScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>KrushiSetu 🌱</Text>
      <Text style={styles.status}>● Active</Text>

      <View style={styles.grid}>
        <SensorCard icon="water-percent" label="Soil Moisture %" value="65" />
        <SensorCard icon="thermometer" label="Temperature °C" value="24" />
        <SensorCard icon="weather-humidity" label="Humidity %" value="70" />
        <SensorCard icon="flask-outline" label="Soil pH" value="6.5" />
      </View>

      <View style={styles.deviceCard}>
        <Text style={styles.deviceTitle}>Device Information</Text>
        <Text style={styles.deviceText}>🔋 Battery: 85%</Text>
        <Text style={styles.deviceText}>🔄 Last Sync: 01 Oct 2023, 14:30</Text>
        <Text style={styles.deviceText}>📟 Device ID: KS-001</Text>
      </View>
    </ScrollView>
  );
};

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.darkGreen,
  },
  status: {
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  deviceCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    marginTop: 20,
    elevation: 3,
  },
  deviceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.darkGreen,
    marginBottom: 8,
  },
  deviceText: {
    fontSize: 14,
    color: '#555',
    marginVertical: 2,
  },
});
