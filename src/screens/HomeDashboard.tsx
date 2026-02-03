import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../theme/colors';

import SensorCard from '../components/SensorCard';
import InfoRow from '../components/InfoRow';
import DashboardActionCard from '../components/DashboardActionCard';
import { ICONS } from '../constants/icons';
import CropPredictionScreen from './CropPredictionScreen';

const HomeDashboard: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerIcon}>
            <MIcon name="grid-view" size={22} color={COLORS.textGray} />
          </TouchableOpacity>

          <Text style={styles.title}>KrushiSetu</Text>

          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => navigation.navigate('Settings')}
          >
            <MIcon name="settings" size={22} color={COLORS.textGray} />
          </TouchableOpacity>
        </View>

        {/* Connection Card */}
        <View style={styles.connectionCard}>
          <View style={styles.connIconBg}>
            <Icon name={ICONS.CONNECTION} size={20} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.connTitle}>Sensors Connected</Text>
            <Text style={styles.connSub}>Gateway: KS-GW-Alpha</Text>
          </View>
        </View>

        {/* Soil Parameters */}
        <Text style={styles.sectionTitle}>Soil Parameters</Text>
        <View style={styles.grid}>
          <SensorCard icon={ICONS.MOISTURE} label="Moisture" value="42%" />
          <SensorCard icon={ICONS.TEMPERATURE} label="Temperature" value="28.5°C" />
          <SensorCard icon={ICONS.HUMIDITY} label="Humidity" value="65%" />
          <SensorCard icon={ICONS.PH} label="Soil pH" value="6.8" />
        </View>

        {/* NPK */}
        <Text style={styles.sectionTitle}>NPK Values</Text>
        <View style={styles.grid}>
          <SensorCard icon={ICONS.NITROGEN} label="Nitrogen (N)" value="45 mg/kg" />
          <SensorCard icon={ICONS.PHOSPHORUS} label="Phosphorus (P)" value="23 mg/kg" />
          <SensorCard icon={ICONS.POTASSIUM} label="Potassium (K)" value="180 mg/kg" />
        </View>

        {/* Device Info */}
        <Text style={styles.sectionTitle}>Device Information</Text>
        <View style={styles.deviceCard}>
          <InfoRow icon={ICONS.SYNC} label="Last Synced" value="2 mins ago" />
          <InfoRow icon={ICONS.BATTERY} label="Battery" value="85%" />
          <InfoRow icon={ICONS.CPU} label="Device ID" value="KS-IOT-9921" />
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {/* Devices Manage */}
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('DeviceManagement')}
        >
          <MIcon name="device-hub" size={26} color={COLORS.primary} />
        </TouchableOpacity>
        
        {/* Sensor History */}
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('SensorHistory')}
        >
          <MIcon name="bar-chart" size={26} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Live Weather */}
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('LiveWeather')}
        >
          <MIcon name="wb-sunny" size={26} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Existing navigation items */}
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('CropPrediction')}
        >
          <MIcon name="eco" size={26} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MIcon name="person" size={26} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  connectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 3,
  },
  connIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F0F7F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  connSub: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 12,
    color: COLORS.textDark,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  deviceCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    elevation: 2,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 70,
    backgroundColor: '#fff',
    borderRadius: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  navItem: {
    padding: 10,
  },
});
