import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Animated, RefreshControl, TextInput, ActivityIndicator } from 'react-native';
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
  signalStrength: number; // 1-5 bars
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
      signalStrength: 4,
    },
    {
      id: 'KS-IOT-9922',
      name: 'Farm A - Weather Station',
      gateway: 'KS-GW-Alpha',
      status: 'online',
      battery: 92,
      lastSync: '5 mins ago',
      location: 'Central Station',
      signalStrength: 5,
    },
    {
      id: 'KS-IOT-9923',
      name: 'Farm B - Soil Sensor',
      gateway: 'KS-GW-Beta',
      status: 'offline',
      battery: 12,
      lastSync: '2 hours ago',
      location: 'Plot A - Sector 2',
      signalStrength: 1,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filteredDevices, setFilteredDevices] = useState(devices);
  const batteryAnimations = useRef<{ [key: string]: Animated.Value }>({});

  // Initialize battery animations
  useEffect(() => {
    const anims: { [key: string]: Animated.Value } = {};
    devices.forEach(device => {
      anims[device.id] = new Animated.Value(0);
    });
    batteryAnimations.current = anims;
  }, []);

  // Animate battery progress
  useEffect(() => {
    Object.keys(batteryAnimations.current).forEach(deviceId => {
      const device = devices.find(d => d.id === deviceId);
      if (device && batteryAnimations.current[deviceId]) {
        Animated.timing(batteryAnimations.current[deviceId], {
          toValue: device.battery,
          duration: 1000,
          useNativeDriver: false,
        }).start();
      }
    });
  }, [devices]);

  // Filter devices based on search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDevices(devices);
    } else {
      const filtered = devices.filter(
        device =>
          device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          device.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          device.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDevices(filtered);
    }
  }, [searchQuery, devices]);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const getSignalBars = (strength: number) => {
    return Array.from({ length: 5 }, (_, i) => i < strength);
  };

  const getSyncStatusColor = (lastSync: string) => {
    if (lastSync.includes('min')) return '#2ECC71';
    if (lastSync.includes('hour')) return '#F39C12';
    return '#E74C3C';
  };

  const getSyncStatusIcon = (lastSync: string) => {
    if (lastSync.includes('min')) return 'clock-check';
    if (lastSync.includes('hour')) return 'clock-alert';
    return 'clock-remove';
  };

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
    const batteryWidth = batteryAnimations.current[device.id]?.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
    }) || '0%';

    return (
      <TouchableOpacity
        key={device.id}
        style={styles.deviceCard}
        onPress={() => navigation.navigate('DeviceDetail', { deviceId: device.id })}
        activeOpacity={0.8}
      >
        {/* Device Header */}
        <View style={styles.deviceHeader}>
          <View style={styles.deviceIconContainer}>
            <Icon name="wifi" size={24} color={isOnline ? COLORS.primary : COLORS.textLight} />
            {/* Signal Strength Indicator */}
            <View style={styles.signalContainer}>
              {getSignalBars(device.signalStrength).map((hasSignal, index) => (
                <View
                  key={index}
                  style={[
                    styles.signalBar,
                    {
                      height: 4 + index * 2,
                      backgroundColor: hasSignal ? COLORS.primary : COLORS.textLight,
                    },
                  ]}
                />
              ))}
            </View>
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
                <Animated.View
                  style={[
                    styles.batteryFill,
                    {
                      width: batteryWidth,
                      backgroundColor: batteryColor,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.detailValue, { color: batteryColor }]}>{device.battery}%</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name={getSyncStatusIcon(device.lastSync)} size={18} color={getSyncStatusColor(device.lastSync)} />
            <Text style={styles.detailLabel}>Last Sync</Text>
            <View style={styles.syncContainer}>
              <View style={[styles.syncDot, { backgroundColor: getSyncStatusColor(device.lastSync) }]} />
              <Text style={[styles.detailValue, { color: getSyncStatusColor(device.lastSync) }]}>
                {device.lastSync}
              </Text>
            </View>
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
      </TouchableOpacity>
    );
  };

  const renderLoadingSkeleton = () => (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonIcon} />
        <View style={styles.skeletonText}>
          <View style={[styles.skeletonLine, { width: '60%' }]} />
          <View style={[styles.skeletonLine, { width: '40%', marginTop: 4 }]} />
        </View>
        <View style={[styles.skeletonBadge, { width: 60, height: 24 }]} />
      </View>
      <View style={styles.skeletonDetails}>
        {[1, 2, 3, 4].map(i => (
          <View key={i} style={styles.skeletonRow}>
            <View style={[styles.skeletonLine, { width: 20, height: 18 }]} />
            <View style={[styles.skeletonLine, { flex: 1, marginLeft: 10 }]} />
            <View style={[styles.skeletonLine, { width: 80 }]} />
          </View>
        ))}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="devices-off" size={64} color={COLORS.textLight} />
      <Text style={styles.emptyStateTitle}>No Devices Found</Text>
      <Text style={styles.emptyStateSubtext}>
        {searchQuery.trim() !== ''
          ? 'Try adjusting your search terms'
          : 'Connect your first IoT device to get started'
        }
      </Text>
      {searchQuery.trim() === '' && (
        <TouchableOpacity style={styles.emptyStateButton}>
          <MIcon name="add" size={20} color={COLORS.white} />
          <Text style={styles.emptyStateButtonText}>Add Device</Text>
        </TouchableOpacity>
      )}
    </View>
  );

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

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={COLORS.textGray} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search devices by name, ID, or location..."
          placeholderTextColor={COLORS.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <MIcon name="clear" size={20} color={COLORS.textGray} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconBox}>
              <Icon name="wifi-check" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.summaryValue}>{devices.filter(d => d.status === 'online').length}</Text>
            <Text style={styles.summaryLabel}>Online</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIconBox, { backgroundColor: '#FADBD8' }]}>
              <Icon name="wifi-off" size={24} color="#E74C3C" />
            </View>
            <Text style={styles.summaryValue}>{devices.filter(d => d.status === 'offline').length}</Text>
            <Text style={styles.summaryLabel}>Offline</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.summaryIconBox, { backgroundColor: '#FEF5E7' }]}>
              <Icon name="battery-alert" size={24} color="#F39C12" />
            </View>
            <Text style={styles.summaryValue}>{devices.filter(d => d.battery < 20).length}</Text>
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
          <Text style={styles.sectionTitle}>
            All Devices {filteredDevices.length > 0 && `(${filteredDevices.length})`}
          </Text>
        </View>

        {isLoading ? (
          <>
            {renderLoadingSkeleton()}
            {renderLoadingSkeleton()}
            {renderLoadingSkeleton()}
          </>
        ) : filteredDevices.length > 0 ? (
          filteredDevices.map((device) => renderDeviceCard(device))
        ) : (
          renderEmptyState()
        )}

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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  addButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
    borderRadius: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  summaryIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F8F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textGray,
    marginLeft: 8,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  deviceCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  deviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F8F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    position: 'relative',
  },
  signalContainer: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: 20,
    height: 12,
  },
  signalBar: {
    width: 3,
    marginHorizontal: 0.5,
    borderRadius: 1,
  },
  deviceHeaderInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  deviceIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceId: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 6,
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusOnline: {
    backgroundColor: '#E7F5EF',
  },
  statusOffline: {
    backgroundColor: '#F8F9FA',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  deviceDetails: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 20,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textGray,
    marginLeft: 12,
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
    width: 80,
    height: 10,
    backgroundColor: '#E9ECEF',
    borderRadius: 5,
    marginRight: 12,
    overflow: 'hidden',
  },
  batteryFill: {
    height: '100%',
    borderRadius: 5,
  },
  syncContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
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
    paddingVertical: 14,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  actionButtonSecondary: {
    backgroundColor: COLORS.background,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 8,
  },
  actionTextSecondary: {
    color: COLORS.textGray,
  },
  addDeviceCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  addDeviceIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8F8F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  addDeviceText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  addDeviceSubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Loading Skeleton Styles
  skeletonCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  skeletonIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E9ECEF',
    marginRight: 16,
  },
  skeletonText: {
    flex: 1,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: '#E9ECEF',
    borderRadius: 6,
  },
  skeletonBadge: {
    backgroundColor: '#E9ECEF',
    borderRadius: 12,
  },
  skeletonDetails: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 20,
    marginBottom: 20,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  // Empty State Styles
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: 8,
  },
});

export default DeviceManagement;
