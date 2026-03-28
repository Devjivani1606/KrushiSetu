// ============================================================
//  LiveWeatherDashboard.tsx
//  Displays real-time weather data fetched from our backend.
//  Features:
//   - Tap the city name / location icon to open city selector
//   - Multi-city selector modal with popular agri cities
//   - Live temperature, humidity, wind, rain chance
//   - 3-day forecast (today, tomorrow, day after)
//   - Agriculture advice based on live conditions
//   - Loading and error states
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
  FlatList,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../theme/colors';
import { API_CONFIG } from '../config/api.config';

// ── Types ──────────────────────────────────────────────────────────────────────

interface WeatherCurrent {
  temperature: string;
  feelsLike?: number;
  humidity: string;
  windSpeed: string;
  rainChance: string;
  condition?: string;
  description?: string;
}

interface WeatherForecast {
  tomorrowMax: number | null;
  tomorrowMin: number | null;
  dayAfterMax: number | null;
  dayAfterMin: number | null;
}

interface WeatherData {
  city: string;
  country?: string;
  current: WeatherCurrent;
  forecast: WeatherForecast;
}

interface City {
  name: string;        // Display name (city, state)
  query: string;       // API query string
  state: string;       // State abbreviation
}

// ── City List ──────────────────────────────────────────────────────────────────
// 20+ agriculture-relevant cities in Maharashtra & Gujarat

const CITY_LIST: City[] = [
  { name: 'Anand', query: 'Anand,IN', state: 'GJ' },
  { name: 'Ahmednagar', query: 'Ahmednagar,IN', state: 'MH' },
  { name: 'Ahmedabad', query: 'Ahmedabad,IN', state: 'GJ' },
  { name: 'Aurangabad', query: 'Aurangabad,IN', state: 'MH' },
  { name: 'Vadodara', query: 'Vadodara,IN', state: 'GJ' },
  { name: 'Pune', query: 'Pune,IN', state: 'MH' },
  { name: 'Nashik', query: 'Nashik,IN', state: 'MH' },
  { name: 'Kolhapur', query: 'Kolhapur,IN', state: 'MH' },
  { name: 'Solapur', query: 'Solapur,IN', state: 'MH' },
  { name: 'Satara', query: 'Satara,IN', state: 'MH' },
  { name: 'Amravati', query: 'Amravati,IN', state: 'MH' },
  { name: 'Nagpur', query: 'Nagpur,IN', state: 'MH' },
  { name: 'Latur', query: 'Latur,IN', state: 'MH' },
  { name: 'Jalgaon', query: 'Jalgaon,IN', state: 'MH' },
  { name: 'Osmanabad', query: 'Osmanabad,IN', state: 'MH' },
  { name: 'Nanded', query: 'Nanded,IN', state: 'MH' },
  { name: 'Surat', query: 'Surat,IN', state: 'GJ' },
  { name: 'Rajkot', query: 'Rajkot,IN', state: 'GJ' },
  { name: 'Junagadh', query: 'Junagadh,IN', state: 'GJ' },
  { name: 'Gandhidham', query: 'Gandhinagar,IN', state: 'GJ' },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Extracts numeric value from string with unit (e.g., "35°C" -> 35, "16%" -> 16)
 */
const extractNumber = (value: string): number => {
  const match = value.match(/-?\d+\.?\d*/);
  return match ? parseFloat(match[0]) : 0;
};

/**
 * Maps an OpenWeatherMap condition string to a MaterialCommunityIcon name.
 */
const getWeatherIcon = (condition?: string): string => {
  if (!condition) return 'weather-partly-cloudy';
  const c = condition.toLowerCase();
  if (c.includes('clear') || c.includes('sunny')) return 'weather-sunny';
  if (c.includes('cloud')) return 'weather-cloudy';
  if (c.includes('rain') || c.includes('drizzle')) return 'weather-rainy';
  if (c.includes('thunder') || c.includes('storm')) return 'weather-lightning-rainy';
  if (c.includes('snow')) return 'weather-snowy';
  if (c.includes('mist') || c.includes('fog')) return 'weather-fog';
  return 'weather-partly-cloudy';
};

/**
 * Generates basic agri advice based on current weather values.
 */
const generateAgriAdvice = (current: WeatherCurrent) => {
  const advice: { title: string; message: string; icon: string }[] = [];
  
  const humidity = extractNumber(current.humidity);
  const temperature = extractNumber(current.temperature);
  const windSpeed = extractNumber(current.windSpeed);
  const rainChance = extractNumber(current.rainChance);

  // Irrigation advice based on humidity + temperature
  if (humidity < 50 && temperature > 30) {
    advice.push({
      title: 'Irrigation Advice',
      message: 'Hot & dry conditions. Schedule evening irrigation to reduce evaporation.',
      icon: 'water',
    });
  } else if (humidity > 80) {
    advice.push({
      title: 'Irrigation Advice',
      message: 'High humidity. Skip irrigation today to avoid waterlogging.',
      icon: 'water-off',
    });
  } else {
    advice.push({
      title: 'Irrigation Advice',
      message: `Good time for evening irrigation. Low evaporation expected.`,
      icon: 'water',
    });
  }

  // Spray warning based on wind speed
  if (windSpeed > 15) {
    advice.push({
      title: 'Spray Warning',
      message: `High wind speed (${windSpeed} km/h). Avoid pesticide / fertilizer spraying.`,
      icon: 'spray',
    });
  } else if (rainChance > 60) {
    advice.push({
      title: 'Spray Warning',
      message: `High rain probability (${rainChance}%). Delay pesticide spraying.`,
      icon: 'weather-rainy',
    });
  }

  return advice;
};

// ── Component ─────────────────────────────────────────────────────────────────

const LiveWeatherDashboard: React.FC<{ navigation: any }> = ({ navigation }) => {

  // ── State ─────────────────────────────────────────────────────────────
  const [selectedCity, setSelectedCity] = useState<City>(CITY_LIST[0]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [cityModalVisible, setCityModalVisible] = useState<boolean>(false);
  const [citySearch, setCitySearch] = useState<string>('');

  // ── Filtered city list based on search input ───────────────────────────
  const filteredCities = citySearch.trim()
    ? CITY_LIST.filter((c) =>
      c.name.toLowerCase().includes(citySearch.toLowerCase())
    )
    : CITY_LIST;

  // ── API fetch ──────────────────────────────────────────────────────────

  /**
   * Fetches weather data from our backend for the selected city.
   * Uses the API_CONFIG.BASE_URL so you only need to update one place.
   */
  const fetchWeather = useCallback(async (cityQuery: string) => {
    try {
      setError(null);

      // Call: GET /api/weather?city=Anand,IN
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/weather?city=${encodeURIComponent(cityQuery)}`
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch weather data');
      }

      setWeatherData(data.data as WeatherData);

      // Format last updated time
      const now = new Date();
      setLastUpdated(
        now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      );
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch on mount and whenever the selected city changes
  useEffect(() => {
    setLoading(true);
    fetchWeather(selectedCity.query);
  }, [selectedCity, fetchWeather]);

  // Pull-to-refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    fetchWeather(selectedCity.query);
  };

  // ── City Selection ─────────────────────────────────────────────────────

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setCityModalVisible(false);
    setCitySearch('');
    setLoading(true); // Show loader while new city loads
  };

  // ── Render: Loading State ──────────────────────────────────────────────
  if (loading && !weatherData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Fetching weather for {selectedCity.name}…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Render: Error State ────────────────────────────────────────────────
  if (error && !weatherData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.errorContainer}>
          <Icon name="weather-cloudy-alert" size={64} color="#FF5722" />
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => { setLoading(true); fetchWeather(selectedCity.query); }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.changeCityBtn}
            onPress={() => setCityModalVisible(true)}
          >
            <Text style={styles.changeCityText}>Try a Different City</Text>
          </TouchableOpacity>
        </View>

        {/* City Selector Modal shown even on error */}
        <CityModal
          visible={cityModalVisible}
          onClose={() => setCityModalVisible(false)}
          cities={filteredCities}
          onSelect={handleCitySelect}
          selectedCity={selectedCity}
          searchValue={citySearch}
          onSearchChange={setCitySearch}
        />
      </SafeAreaView>
    );
  }

  // ── Render: Weather Dashboard ──────────────────────────────────────────
  const w = weatherData!;
  const agriAdvice = generateAgriAdvice(w.current);

  // Build forecast cards array
  const forecastCards = [
    {
      day: 'Today',
      icon: getWeatherIcon(w.current.condition),
      maxTemp: w.current.temperature,
      minTemp: w.current.feelsLike ? `${w.current.feelsLike}°` : w.current.temperature,
      isToday: true,
    },
    {
      day: 'Tomorrow',
      icon: extractNumber(w.current.rainChance) > 50 ? 'weather-rainy' : 'weather-partly-cloudy',
      maxTemp: w.forecast.tomorrowMax ?? '--',
      minTemp: w.forecast.tomorrowMin ?? '--',
    },
    {
      day: 'Day 3',
      icon: (w.forecast.dayAfterMax ?? 0) < 28 ? 'weather-rainy' : 'weather-cloudy',
      maxTemp: w.forecast.dayAfterMax ?? '--',
      minTemp: w.forecast.dayAfterMin ?? '--',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── Header ──────────────────────────────────────────────────── */}
      <View style={styles.header}>
        {/* City name — tappable to open city selector */}
        <TouchableOpacity
          style={styles.locationContainer}
          onPress={() => setCityModalVisible(true)}
          activeOpacity={0.7}
        >
          <MIcon name="location-on" size={20} color={COLORS.primary} />
          <View>
            <View style={styles.cityRow}>
              <Text style={styles.location}>
                {w.city}{w.country ? `, ${w.country}` : ''}
              </Text>
              {/* Dropdown chevron to hint the user it's tappable */}
              <MIcon name="keyboard-arrow-down" size={16} color={COLORS.primary} />
            </View>
            <Text style={styles.updatedTime}>Updated {lastUpdated}</Text>
          </View>
        </TouchableOpacity>

        {/* Refresh button */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={onRefresh}
          disabled={refreshing}
        >
          {refreshing
            ? <ActivityIndicator size="small" color={COLORS.primary} />
            : <MIcon name="refresh" size={24} color={COLORS.textGray} />
          }
        </TouchableOpacity>
      </View>

      {/* Show inline error banner if data is stale and a new fetch failed */}
      {error && weatherData && (
        <View style={styles.errorBanner}>
          <Icon name="alert-circle-outline" size={16} color="#E65100" />
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* ── Main Weather Card ──────────────────────────────────────── */}
        <View style={styles.mainWeatherCard}>
          <View style={styles.weatherHeader}>
            <View style={styles.temperatureContainer}>
              <Text style={styles.temperature}>{w.current.temperature}</Text>
              <Text style={styles.condition}>{w.current.condition || 'Clear'}</Text>
              <Text style={styles.description}>{w.current.description || 'Clear skies'}</Text>
            </View>
            <View style={styles.weatherIconContainer}>
              <Icon
                name={getWeatherIcon(w.current.condition)}
                size={80}
                color="#FFA726"
              />
            </View>
          </View>

          {/* ── Weather Stats Row ─────────────────────────────────────── */}
          <View style={styles.weatherStats}>
            <View style={styles.statItem}>
              <Icon name="water-percent" size={20} color="#2196F3" />
              <Text style={styles.statLabel}>Humidity</Text>
              <Text style={styles.statValue}>{w.current.humidity}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="weather-windy" size={20} color="#4CAF50" />
              <Text style={styles.statLabel}>Wind</Text>
              <Text style={styles.statValue}>{w.current.windSpeed}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="weather-rainy" size={20} color="#9C27B0" />
              <Text style={styles.statLabel}>Rain</Text>
              <Text style={styles.statValue}>{w.current.rainChance}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="thermometer" size={20} color="#FF5722" />
              <Text style={styles.statLabel}>Feels Like</Text>
              <Text style={styles.statValue}>{w.current.feelsLike ? `${w.current.feelsLike}°C` : 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* ── Weather Alert (shows when rain chance > 60%) ───────────── */}
        {extractNumber(w.current.rainChance) > 60 && (
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <Icon name="alert" size={24} color="#FF9800" />
              <Text style={styles.alertTitle}>Weather Alert</Text>
            </View>
            <Text style={styles.alertMessage}>
              High rain probability ({w.current.rainChance}) today. Consider covering crops
              and avoiding field operations.
            </Text>
          </View>
        )}

        {/* ── High Temperature Alert ─────────────────────────────────── */}
        {(w.forecast.tomorrowMax ?? 0) > 37 && (
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <Icon name="thermometer-high" size={24} color="#FF9800" />
              <Text style={styles.alertTitle}>Heat Alert</Text>
            </View>
            <Text style={styles.alertMessage}>
              High temperature warning: Expected to reach {w.forecast.tomorrowMax}°C tomorrow.
              Ensure adequate crop irrigation.
            </Text>
          </View>
        )}

        {/* ── Weekly Forecast ────────────────────────────────────────── */}
        <View style={styles.forecastSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weekly Forecast</Text>
            <TouchableOpacity style={styles.viewMonthlyButton}>
              <Text style={styles.viewMonthlyText}>View Monthly</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.forecastContainer}>
            {forecastCards.map((day, index) => (
              <View
                key={index}
                style={[styles.forecastCard, day.isToday && styles.todayCard]}
              >
                <Text style={[styles.dayName, day.isToday && styles.todayText]}>
                  {day.day}
                </Text>
                <Icon
                  name={day.icon}
                  size={32}
                  color={day.isToday ? '#fff' : COLORS.textGray}
                />
                <View style={styles.temperatureRange}>
                  <Text style={[styles.maxTemp, day.isToday && styles.todayText]}>
                    {day.maxTemp}°
                  </Text>
                  <Text style={styles.minTemp}>{day.minTemp}°</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ── Agri Advice ────────────────────────────────────────────── */}
        <View style={styles.agriAdviceSection}>
          <View style={styles.sectionHeader}>
            <Icon name="leaf" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Agri Advice</Text>
          </View>

          {agriAdvice.map((advice, index) => (
            <View key={index} style={styles.adviceCard}>
              <View style={styles.adviceHeader}>
                <Icon name={advice.icon} size={20} color={COLORS.primary} />
                <Text style={styles.adviceTitle}>{advice.title}</Text>
              </View>
              <Text style={styles.adviceMessage}>{advice.message}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── City Selector Modal ────────────────────────────────────────── */}
      <CityModal
        visible={cityModalVisible}
        onClose={() => { setCityModalVisible(false); setCitySearch(''); }}
        cities={filteredCities}
        onSelect={handleCitySelect}
        selectedCity={selectedCity}
        searchValue={citySearch}
        onSearchChange={setCitySearch}
      />
    </SafeAreaView>
  );
};

// ── City Selector Modal Component ─────────────────────────────────────────────

interface CityModalProps {
  visible: boolean;
  onClose: () => void;
  cities: City[];
  onSelect: (city: City) => void;
  selectedCity: City;
  searchValue: string;
  onSearchChange: (text: string) => void;
}

const CityModal: React.FC<CityModalProps> = ({
  visible, onClose, cities, onSelect, selectedCity, searchValue, onSearchChange,
}) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent={true}
    onRequestClose={onClose}
  >
    <View style={modalStyles.overlay}>
      <View style={modalStyles.container}>

        {/* Modal Header */}
        <View style={modalStyles.header}>
          <Text style={modalStyles.title}>Select City</Text>
          <TouchableOpacity onPress={onClose} style={modalStyles.closeBtn}>
            <MIcon name="close" size={24} color={COLORS.textGray} />
          </TouchableOpacity>
        </View>

        {/* Search input */}
        <View style={modalStyles.searchRow}>
          <MIcon name="search" size={20} color={COLORS.textGray} style={modalStyles.searchIcon} />
          <TextInput
            style={modalStyles.searchInput}
            placeholder="Search city…"
            placeholderTextColor={COLORS.textGray}
            value={searchValue}
            onChangeText={onSearchChange}
            autoCorrect={false}
          />
          {searchValue.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange('')}>
              <MIcon name="close" size={18} color={COLORS.textGray} />
            </TouchableOpacity>
          )}
        </View>

        {/* City list */}
        <FlatList
          data={cities}
          keyExtractor={(item) => item.query}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSelected = item.query === selectedCity.query;
            return (
              <TouchableOpacity
                style={[modalStyles.cityItem, isSelected && modalStyles.cityItemSelected]}
                onPress={() => onSelect(item)}
                activeOpacity={0.7}
              >
                <View style={modalStyles.cityInfo}>
                  <MIcon
                    name="location-on"
                    size={18}
                    color={isSelected ? COLORS.primary : COLORS.textGray}
                  />
                  <Text
                    style={[
                      modalStyles.cityName,
                      isSelected && modalStyles.cityNameSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                </View>
                <View
                  style={[
                    modalStyles.stateBadge,
                    isSelected && modalStyles.stateBadgeSelected,
                  ]}
                >
                  <Text
                    style={[
                      modalStyles.stateText,
                      isSelected && modalStyles.stateTextSelected,
                    ]}
                  >
                    {item.state}
                  </Text>
                </View>
                {isSelected && (
                  <MIcon name="check-circle" size={18} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={modalStyles.separator} />}
          ListEmptyComponent={() => (
            <Text style={modalStyles.emptyText}>No cities found for "{searchValue}"</Text>
          )}
        />
      </View>
    </View>
  </Modal>
);

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    color: COLORS.textGray,
    marginTop: 12,
  },

  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 12,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  changeCityBtn: {
    paddingVertical: 10,
  },
  changeCityText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },

  // Error banner (inline)
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  errorBannerText: {
    fontSize: 12,
    color: '#E65100',
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    marginLeft: 8,
  },
  updatedTime: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
    marginLeft: 8,
  },
  settingsButton: {
    padding: 8,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Main weather card
  mainWeatherCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  temperatureContainer: {
    flex: 1,
  },
  temperature: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1565C0',
  },
  condition: {
    fontSize: 18,
    color: '#1976D2',
    fontWeight: '500',
    marginTop: 4,
  },
  description: {
    fontSize: 13,
    color: '#1976D2',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  weatherIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textGray,
    fontWeight: '500',
    marginTop: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 2,
  },

  // Alert card
  alertCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E65100',
    marginLeft: 8,
  },
  alertMessage: {
    fontSize: 14,
    color: COLORS.textDark,
    lineHeight: 20,
  },

  // Forecast section
  forecastSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginLeft: 4,
  },
  viewMonthlyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
  },
  viewMonthlyText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  forecastContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  forecastCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  todayCard: {
    backgroundColor: COLORS.primary,
  },
  dayName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  todayText: {
    color: '#fff',
  },
  temperatureRange: {
    alignItems: 'center',
    marginTop: 8,
  },
  maxTemp: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  minTemp: {
    fontSize: 14,
    color: COLORS.textGray,
  },

  // Agri advice section
  agriAdviceSection: {
    marginBottom: 16,
  },
  adviceCard: {
    backgroundColor: '#E8F5E8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  adviceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  adviceMessage: {
    fontSize: 14,
    color: COLORS.textDark,
    lineHeight: 20,
  },
});

// ── Modal Styles ──────────────────────────────────────────────────────────────

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  closeBtn: {
    padding: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    padding: 0,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  cityItemSelected: {
    backgroundColor: '#F0F7ED',
  },
  cityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cityName: {
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
    fontWeight: '500',
  },
  cityNameSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  stateBadge: {
    backgroundColor: '#EFEFEF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 10,
  },
  stateBadgeSelected: {
    backgroundColor: '#D4EAC8',
  },
  stateText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textGray,
  },
  stateTextSelected: {
    color: COLORS.primary,
  },
  separator: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginLeft: 48,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textGray,
    fontSize: 14,
    paddingVertical: 24,
  },
});

export default LiveWeatherDashboard;
