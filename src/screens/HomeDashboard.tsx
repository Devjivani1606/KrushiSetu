import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SensorCard from '../components/SensorCard';
import InfoRow from '../components/InfoRow';
import DashboardActionCard from '../components/DashboardActionCard';
import ProfileSetupForm from '../components/ProfileSetupForm';
import ProfileDisplay from '../components/ProfileDisplay';
import { ICONS } from '../constants/icons';
import CropPredictionScreen from './CropPredictionScreen';
import { fetchCurrentSoilData, SoilData } from '../services/api';

interface ProfileData {
  name: string;
  email: string;
  state: string;
  city: string;
}

const HomeDashboard: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const user = route.params?.user;
  const [soilData, setSoilData] = useState<SoilData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string>('');
  
  // Profile states
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showProfileDisplay, setShowProfileDisplay] = useState(false);
  const [userProfile, setUserProfile] = useState<ProfileData | null>(null);

  // Check if user profile exists on component mount
  useEffect(() => {
    checkUserProfile();
  }, []);

  const checkUserProfile = async () => {
    try {
      const profileData = await AsyncStorage.getItem('userProfile');
      const hasSeenProfileSetup = await AsyncStorage.getItem('hasSeenProfileSetup');
      
      if (profileData && hasSeenProfileSetup === 'true') {
        // User has completed profile setup
        setUserProfile(JSON.parse(profileData));
      } else {
        // First time user OR hasn't completed profile setup
        setShowProfileSetup(true);
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
      setShowProfileSetup(true);
    }
  };

  const handleSaveProfile = async (profileData: ProfileData) => {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(profileData));
      await AsyncStorage.setItem('hasSeenProfileSetup', 'true');
      setUserProfile(profileData);
      console.log('Profile saved successfully:', profileData);
      Alert.alert('Success', 'Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    }
  };

  const handleEditProfile = () => {
    setShowProfileSetup(true);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchCurrentSoilData();
      setSoilData(response.data);
      setLastSync(new Date().toLocaleTimeString());
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
            onPress={() => navigation.navigate('Settings', { user })}
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
          <TouchableOpacity onPress={loadData} style={styles.refreshBtn}>
            <Icon name="refresh" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {loading && !soilData ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: 20 }} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        {/* Soil Parameters */}
        {soilData && (
          <>
            <Text style={styles.sectionTitle}>Soil Parameters</Text>
            <View style={styles.grid}>
              <SensorCard icon={ICONS.MOISTURE} label="Moisture" value={`${soilData.humidity}%`} />
              <SensorCard icon={ICONS.TEMPERATURE} label="Temperature" value={`${soilData.temperature}°C`} />
              <SensorCard icon={ICONS.HUMIDITY} label="Humidity" value={`${soilData.humidity}%`} />
              <SensorCard icon={ICONS.PH} label="Soil pH" value={soilData.ph.toString()} />
            </View>
          </>
        )}

        {/* NPK */}
        {soilData && (
          <>
            <Text style={styles.sectionTitle}>NPK Values</Text>
            <View style={styles.grid}>
              <SensorCard icon={ICONS.NITROGEN} label="Nitrogen (N)" value={`${soilData.nitrogen} mg/kg`} />
              <SensorCard icon={ICONS.PHOSPHORUS} label="Phosphorus (P)" value={`${soilData.phosphorus} mg/kg`} />
              <SensorCard icon={ICONS.POTASSIUM} label="Potassium (K)" value={`${soilData.potassium} mg/kg`} />
            </View>
          </>
        )}

        {/* Device Info */}
        <Text style={styles.sectionTitle}>Device Information</Text>
        <View style={styles.deviceCard}>
          <InfoRow icon={ICONS.SYNC} label="Last Synced" value={lastSync || 'Loading...'} />
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
        
        {/* Price History */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('PriceHistory')}
        >
          <MIcon name="trending-up" size={26} color={COLORS.primary} />
        </TouchableOpacity>
        
        {/* Profile */}
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => {
            console.log('Profile icon clicked, userProfile:', userProfile);
            console.log('showProfileDisplay should be:', !userProfile);
            
            if (userProfile) {
              setShowProfileDisplay(true);
            } else {
              setShowProfileSetup(true);
            }
          }}
        >
          <MIcon name="person" size={26} color={userProfile ? COLORS.primary : COLORS.textLight} />
        </TouchableOpacity>
      </View>

      {/* Profile Setup Modal */}
      <ProfileSetupForm
        visible={showProfileSetup}
        onClose={() => setShowProfileSetup(false)}
        onSave={handleSaveProfile}
        initialEmail={user?.email || ''}
      />

      {/* Profile Display Modal */}
      <ProfileDisplay
        visible={showProfileDisplay}
        onClose={() => setShowProfileDisplay(false)}
        profile={userProfile}
        onEdit={handleEditProfile}
      />
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
  refreshBtn: {
    padding: 8,
    backgroundColor: '#F0F7F4',
    borderRadius: 12,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
});
