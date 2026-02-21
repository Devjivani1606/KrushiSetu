import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SensorCard from '../components/SensorCard';
import { COLORS } from '../theme/colors';
import { fetchCurrentSoilData, SoilData } from '../services/api';

const DashboardScreen: React.FC = () => {
  const [soilData, setSoilData] = useState<SoilData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string>('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchCurrentSoilData();
      setSoilData(response.data);
      setLastSync(new Date().toLocaleString());
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>KrushiSetu 🌱</Text>
        <TouchableOpacity onPress={loadData} style={styles.refreshBtn}>
          <Icon name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <Text style={styles.status}>● Active</Text>

      {loading && !soilData ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 20 }} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : soilData ? (
        <>
          <View style={styles.grid}>
            <SensorCard icon="water-percent" label="Soil Moisture %" value={soilData.humidity.toString()} />
            <SensorCard icon="thermometer" label="Temperature °C" value={soilData.temperature.toString()} />
            <SensorCard icon="weather-humidity" label="Humidity %" value={soilData.humidity.toString()} />
            <SensorCard icon="flask-outline" label="Soil pH" value={soilData.ph.toString()} />
          </View>

          <View style={styles.deviceCard}>
            <Text style={styles.deviceTitle}>Device Information</Text>
            <Text style={styles.deviceText}>🔋 Battery: 85%</Text>
            <Text style={styles.deviceText}>🔄 Last Sync: {lastSync}</Text>
            <Text style={styles.deviceText}>📟 Device ID: KS-001</Text>
          </View>
        </>
      ) : null}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refreshBtn: {
    padding: 8,
    backgroundColor: '#F0F7F4',
    borderRadius: 12,
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
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
});
