import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../theme/colors';

interface Device {
  id: string;
  name: string;
  gateway: string;
  status: 'online' | 'offline';
  battery: number;
  lastSync: string;
  location: string;
}

const DeviceManagement = ({ navigation }: any) => {
  const [devices, setDevices] = useState<Device[]>([
    {
      id: 'KS-IOT-9921',
      name: 'Farm A - Soil Sensor',
      gateway: 'KS-GW-Alpha',
      status: 'online',
      battery: 85,
      lastSync: '2 mins ago',
      location: 'Plot B - Sector 4',
    },
    {
      id: 'KS-IOT-9922',
      name: 'Farm A - Weather Station',
      gateway: 'KS-GW-Alpha',
      status: 'online',
      battery: 92,
      lastSync: '5 mins ago',
      location: 'Central Station',
    },
    {
      id: 'KS-IOT-9923',
      name: 'Farm B - Soil Sensor',
      gateway: 'KS-GW-Beta',
      status: 'offline',
      battery: 12,
      lastSync: '2 hours ago',
      location: 'Plot A - Sector 2',
    },
  ]);

  const renderDeviceCard = (device: Device) => {
    const isOnline = device.status === 'online';
    const batteryIcon =
      device.battery > 80
        ? 'battery-high'
        : device.battery > 50
        ? 'battery-medium'
        : device.battery > 20
        ? 'battery-low'
        : 'battery-alert';
    const batteryColor = device.battery > 50 ? COLORS.primary : device.battery > 20 ? '#F39C12' : '#E74C3C';

    return (
      <View key={device.id} style={styles.deviceCard}>
        {/* Device Header */}
        <View style={styles.deviceHeader}>
          <View style={styles.deviceIconContainer}>
            <Icon name="wifi" size={24} color={isOnline ? COLORS.primary : COLORS.textLight} />
          </View>
          <View style={styles.deviceHeaderInfo}>
            <Text style={styles.deviceName}>{device.name}</Text>
            <View style={styles.deviceIdRow}>
              <Icon name="identifier" size={14} color={COLORS.textLight} />
              <Text style={styles.deviceId}>{device.id}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, isOnline ? styles.statusOnline : styles.statusOffline]}>
            <View style={[styles.statusDot, { backgroundColor: isOnline ? COLORS.success : '#95A5A6' }]} />
            <Text style={[styles.statusText, { color: isOnline ? COLORS.success : '#95A5A6' }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        {/* Device Details */}
        <View style={styles.deviceDetails}>
          <View style={styles.detailRow}>
            <Icon name="router-wireless" size={18} color={COLORS.textGray} />
            <Text style={styles.detailLabel}>Gateway</Text>
            <Text style={styles.detailValue}>{device.gateway}</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="map-marker" size={18} color={COLORS.textGray} />
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>{device.location}</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name={batteryIcon} size={18} color={batteryColor} />
            <Text style={styles.detailLabel}>Battery</Text>
            <View style={styles.batteryContainer}>
              <View style={styles.batteryBar}>
                <View style={[styles.batteryFill, { width: `${device.battery}%`, backgroundColor: batteryColor }]} />
              </View>
              <Text style={[styles.detailValue, { color: batteryColor }]}>{device.battery}%</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="sync" size={18} color={COLORS.textGray} />
            <Text style={styles.detailLabel}>Last Sync</Text>
            <Text style={styles.detailValue}>{device.lastSync}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.deviceActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="chart-line" size={18} color={COLORS.primary} />
            <Text style={styles.actionText}>View Data</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.actionButtonSecondary]}>
            <Icon name="cog" size={18} color={COLORS.textGray} />
            <Text style={[styles.actionText, styles.actionTextSecondary]}>Configure</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.actionButtonSecondary]}>
            <Icon name="restart" size={18} color={COLORS.textGray} />
            <Text style={[styles.actionText, styles.actionTextSecondary]}>Restart</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MIcon name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Device Management</Text>
        <TouchableOpacity style={styles.addButton}>
          <MIcon name="add" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconBox}>
              <Icon name="wifi-check" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.summaryValue}>2</Text>
            <Text style={styles.summaryLabel}>Online</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIconBox, { backgroundColor: '#FADBD8' }]}>
              <Icon name="wifi-off" size={24} color="#E74C3C" />
            </View>
            <Text style={styles.summaryValue}>1</Text>
            <Text style={styles.summaryLabel}>Offline</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIconBox, { backgroundColor: '#FEF5E7' }]}>
              <Icon name="battery-alert" size={24} color="#F39C12" />
            </View>
            <Text style={styles.summaryValue}>1</Text>
            <Text style={styles.summaryLabel}>Low Battery</Text>
          </View>
        </View>

        {/* Filter/Sort */}
        <View style={styles.filterContainer}>
          <TouchableOpacity style={styles.filterButton}>
            <Icon name="filter-variant" size={18} color={COLORS.textGray} />
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterButton}>
            <Icon name="sort" size={18} color={COLORS.textGray} />
            <Text style={styles.filterText}>Sort by Status</Text>
          </TouchableOpacity>
        </View>

        {/* Devices List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Devices ({devices.length})</Text>
        </View>

        {devices.map((device) => renderDeviceCard(device))}

        {/* Add Device Card */}
        <TouchableOpacity style={styles.addDeviceCard}>
          <View style={styles.addDeviceIconBox}>
            <MIcon name="add" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.addDeviceText}>Add New Device</Text>
          <Text style={styles.addDeviceSubtext}>Connect a new IoT sensor to your gateway</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  addButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F8F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textGray,
    marginLeft: 6,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  deviceCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  deviceIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F8F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deviceHeaderInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  deviceIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceId: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 4,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusOnline: {
    backgroundColor: '#E7F5EF',
  },
  statusOffline: {
    backgroundColor: '#F8F9FA',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  deviceDetails: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textGray,
    marginLeft: 10,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryBar: {
    width: 60,
    height: 8,
    backgroundColor: '#E9ECEF',
    borderRadius: 4,
    marginRight: 8,
    overflow: 'hidden',
  },
  batteryFill: {
    height: '100%',
    borderRadius: 4,
  },
  deviceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F8F5',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  actionButtonSecondary: {
    backgroundColor: COLORS.background,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 6,
  },
  actionTextSecondary: {
    color: COLORS.textGray,
  },
  addDeviceCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  addDeviceIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F8F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  addDeviceText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  addDeviceSubtext: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});

export default DeviceManagement;
