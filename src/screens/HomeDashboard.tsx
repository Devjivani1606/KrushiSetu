import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../theme/colors';
import SensorCard from '../components/SensorCard';
import InfoRow from '../components/InfoRow';

const HomeDashboard: React.FC = () => {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerIcon}>
            <MIcon name="grid-view" size={22} color={COLORS.textGray} />
          </TouchableOpacity>
          <Text style={styles.title}>KrushiSetu</Text>
          <TouchableOpacity style={styles.headerIcon}>
            <MIcon name="settings" size={22} color={COLORS.textGray} />
          </TouchableOpacity>
        </View>

        {/* Connection Card */}
        <View style={styles.connectionCard}>
          <View style={styles.connIconBg}>
            <MIcon name="rss-feed" size={20} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.connTitle}>Sensors Connected</Text>
            <Text style={styles.connSub}>Gateway: KS-GW-Alpha</Text>
          </View>
          <View style={styles.activeBadge}>
            <View style={styles.dot} />
            <Text style={styles.activeText}>Active</Text>
          </View>
        </View>

        {/* Soil Parameters */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Soil Parameters</Text>
          <Text style={styles.updateText}>Updated 1m ago</Text>
        </View>

        <View style={styles.grid}>
          <SensorCard icon="water-percent" label="Moisture" value="42%" />
          <SensorCard icon="thermometer" label="Temperature" value="28.5°C" />
          <SensorCard icon="water-outline" label="Humidity" value="65%" />
          <SensorCard icon="flask-outline" label="Soil pH" value="6.8" />
        </View>

        {/* NPK Values */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>NPK Values</Text>
          <Text style={styles.updateText}>Updated 5m ago</Text>
        </View>

        <View style={styles.grid}>
          <SensorCard icon="nitrogen" label="Nitrogen (N)" value="45 mg/kg" />
          <SensorCard icon="flask" label="Phosphorus (P)" value="23 mg/kg" />
          <SensorCard icon="leaf" label="Potassium (K)" value="180 mg/kg" />
        </View>

        {/* Device Info */}
        <Text style={styles.sectionTitle}>Device Information</Text>
        <View style={styles.deviceCard}>
          <InfoRow icon="sync" label="Last Synced" value="2 mins ago" />
          <InfoRow icon="battery-80" label="Battery" value="85%" />
          <InfoRow icon="cpu-64-bit" label="Device ID" value="KS-IOT-9921" />
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <MIcon name="home" size={26} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MIcon name="bar-chart" size={26} color={COLORS.textLight} />
        </TouchableOpacity>
        
        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.fab}>
            <MIcon name="add" size={30} color="#fff" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.navItem}>
          <MIcon name="notifications" size={26} color={COLORS.textLight} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MIcon name="person" size={26} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ...existing code...
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  headerIcon: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: 0.5,
  },
  connectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
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
    marginTop: 2,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F5EF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
    marginRight: 6,
  },
  activeText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  updateText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
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
    padding: 8,
    paddingHorizontal: 16,
    marginTop: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
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
  fabContainer: {
    top: -30,
    elevation: 11,
  },
  fab: {
    backgroundColor: COLORS.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});