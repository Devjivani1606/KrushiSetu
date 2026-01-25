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
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Icon name={icon} size={24} color={COLORS.primary} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

export default SensorCard;

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F3F5',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F0F7F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: -0.5,
  },
  label: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
