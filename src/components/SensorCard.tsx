import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../theme/colors';

interface Props {
  icon: string;
  label: string;
  value: string;
}

const SensorCard: React.FC<Props> = ({ icon, label, value }) => {
  // Different color themes based on sensor type
  const getColorTheme = () => {
    switch (label.toLowerCase()) {
      case 'moisture':
        return {
          borderColor: '#1976D2',
          iconBg: '#E3F2FD',
          iconColor: '#1976D2',
          valueColor: '#0D47A1',
          labelColor: '#1565C0'
        };
      case 'temperature':
        return {
          borderColor: '#F57C00',
          iconBg: '#FFF3E0',
          iconColor: '#F57C00',
          valueColor: '#E65100',
          labelColor: '#EF6C00'
        };
      case 'humidity':
        return {
          borderColor: '#00796B',
          iconBg: '#E0F2F1',
          iconColor: '#00796B',
          valueColor: '#004D40',
          labelColor: '#00695C'
        };
      case 'soil ph':
        return {
          borderColor: '#7B1FA2',
          iconBg: '#F3E5F5',
          iconColor: '#7B1FA2',
          valueColor: '#4A148C',
          labelColor: '#6A1B9A'
        };
      case 'nitrogen (n)':
        return {
          borderColor: '#388E3C',
          iconBg: '#E8F5E8',
          iconColor: '#388E3C',
          valueColor: '#1B5E20',
          labelColor: '#2E7D32'
        };
      case 'phosphorus (p)':
        return {
          borderColor: '#D32F2F',
          iconBg: '#FFEBEE',
          iconColor: '#D32F2F',
          valueColor: '#B71C1C',
          labelColor: '#C62828'
        };
      case 'potassium (k)':
        return {
          borderColor: '#FBC02D',
          iconBg: '#FFFDE7',
          iconColor: '#F9A825',
          valueColor: '#F57F17',
          labelColor: '#F57F17'
        };
      default:
        return {
          borderColor: COLORS.primary,
          iconBg: '#F0F7F4',
          iconColor: COLORS.primary,
          valueColor: COLORS.textDark,
          labelColor: COLORS.textGray
        };
    }
  };

  const theme = getColorTheme();

  return (
    <View style={[styles.card, { borderColor: theme.borderColor }]}>
      {/* ICON */}
      <View style={[styles.iconBg, { backgroundColor: theme.iconBg }]}>
        <Icon name={icon} size={26} color={theme.iconColor} />
      </View>

      {/* LABEL */}
      <Text style={[styles.label, { color: theme.labelColor }]}>{label}</Text>

      {/* VALUE */}
      <Text style={[styles.value, { color: theme.valueColor }]}>{value}</Text>
    </View>
  );
};

export default SensorCard;

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },

  iconBg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
  },

  value: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
});
