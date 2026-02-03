import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../theme/colors';

interface Props {
  icon: string;
  label: string;
  onPress?: () => void;
}

const DashboardActionCard: React.FC<Props> = ({ icon, label, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Icon name={icon} size={34} color={COLORS.primary} />
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
};

export default DashboardActionCard;

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    marginBottom: 12,
  },
  text: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
});
