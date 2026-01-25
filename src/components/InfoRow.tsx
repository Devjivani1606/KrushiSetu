import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../theme/colors';

interface Props {
  icon: string;
  label: string;
  value: string;
}

const InfoRow: React.FC<Props> = ({ icon, label, value }) => (
  <View style={styles.row}>
    <View style={styles.iconBox}>
      <Icon name={icon} size={18} color={COLORS.textLight} />
    </View>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

export default InfoRow;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textGray,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
});
