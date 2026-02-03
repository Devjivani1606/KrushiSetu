import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../theme/colors';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  rainProbability: number;
  feelsLike: number;
  location: string;
  lastUpdated: string;
}

interface ForecastDay {
  day: string;
  icon: string;
  maxTemp: number;
  minTemp: number;
  isToday?: boolean;
}

interface WeatherAlert {
  type: 'warning' | 'alert';
  message: string;
  icon: string;
}

const LiveWeatherDashboard: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [weatherData] = useState<WeatherData>({
    temperature: 32,
    condition: 'Sunny',
    humidity: 65,
    windSpeed: 12,
    rainProbability: 10,
    feelsLike: 35,
    location: 'Ahmednagar, MH',
    lastUpdated: '2 mins ago',
  });

  const [forecast] = useState<ForecastDay[]>([
    { day: 'Today', icon: 'weather-sunny', maxTemp: 35, minTemp: 24, isToday: true },
    { day: 'Tomorrow', icon: 'weather-partly-cloudy', maxTemp: 33, minTemp: 22 },
    { day: 'Day 3', icon: 'weather-rainy', maxTemp: 28, minTemp: 20 },
  ]);

  const [alerts] = useState<WeatherAlert[]>([
    {
      type: 'warning',
      message: 'High temperature warning: Expected to reach 38°C tomorrow',
      icon: 'alert',
    },
  ]);

  const [agriAdvice] = useState([
    {
      title: 'Irrigation Advice',
      message: 'Good time for evening irrigation. Low evaporation expected.',
      icon: 'water',
    },
    {
      title: 'Spray Warning',
      message: 'Avoid pesticide spraying today. High wind speed (12 km/h).',
      icon: 'spray',
    },
  ]);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return 'weather-sunny';
      case 'cloudy':
        return 'weather-cloudy';
      case 'rainy':
        return 'weather-rainy';
      case 'partly-cloudy':
        return 'weather-partly-cloudy';
      default:
        return 'weather-sunny';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <MIcon name="location-on" size={20} color={COLORS.primary} />
          <View>
            <Text style={styles.location}>{weatherData.location}</Text>
            <Text style={styles.updatedTime}>Updated {weatherData.lastUpdated}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.settingsButton}>
          <MIcon name="settings" size={24} color={COLORS.textGray} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Weather Card */}
        <View style={styles.mainWeatherCard}>
          <View style={styles.weatherHeader}>
            <View style={styles.temperatureContainer}>
              <Text style={styles.temperature}>{weatherData.temperature}°C</Text>
              <Text style={styles.condition}>{weatherData.condition}</Text>
            </View>
            <View style={styles.weatherIconContainer}>
              <Icon 
                name={getWeatherIcon(weatherData.condition)} 
                size={80} 
                color="#FFA726" 
              />
            </View>
          </View>

          {/* Weather Stats */}
          <View style={styles.weatherStats}>
            <View style={styles.statItem}>
              <Icon name="water-percent" size={20} color="#2196F3" />
              <Text style={styles.statLabel}>Humidity</Text>
              <Text style={styles.statValue}>{weatherData.humidity}%</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="weather-windy" size={20} color="#4CAF50" />
              <Text style={styles.statLabel}>Wind</Text>
              <Text style={styles.statValue}>{weatherData.windSpeed} km/h</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="weather-rainy" size={20} color="#9C27B0" />
              <Text style={styles.statLabel}>Rain</Text>
              <Text style={styles.statValue}>{weatherData.rainProbability}%</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="thermometer" size={20} color="#FF5722" />
              <Text style={styles.statLabel}>Feels Like</Text>
              <Text style={styles.statValue}>{weatherData.feelsLike}°C</Text>
            </View>
          </View>
        </View>

        {/* Weather Alert Card */}
        {alerts.length > 0 && (
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <Icon name={alerts[0].icon} size={24} color="#FF9800" />
              <Text style={styles.alertTitle}>Weather Alert</Text>
            </View>
            <Text style={styles.alertMessage}>{alerts[0].message}</Text>
          </View>
        )}

        {/* Weekly Forecast */}
        <View style={styles.forecastSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Weekly Forecast</Text>
            <TouchableOpacity style={styles.viewMonthlyButton}>
              <Text style={styles.viewMonthlyText}>View Monthly</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.forecastContainer}>
            {forecast.map((day, index) => (
              <View 
                key={index} 
                style={[
                  styles.forecastCard,
                  day.isToday && styles.todayCard
                ]}
              >
                <Text style={[
                  styles.dayName,
                  day.isToday && styles.todayText
                ]}>
                  {day.day}
                </Text>
                <Icon 
                  name={day.icon} 
                  size={32} 
                  color={day.isToday ? COLORS.primary : COLORS.textGray} 
                />
                <View style={styles.temperatureRange}>
                  <Text style={styles.maxTemp}>{day.maxTemp}°</Text>
                  <Text style={styles.minTemp}>{day.minTemp}°</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Agriculture Weather Advice */}
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
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

export default LiveWeatherDashboard;
