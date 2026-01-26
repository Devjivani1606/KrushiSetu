import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../theme/colors';

const SettingsScreen = ({ navigation }: any) => {
  const [alertNotifications, setAlertNotifications] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MIcon name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* ACCOUNT Section */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.iconContainer}>
              <Icon name="account" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Name</Text>
              <Text style={styles.settingSubtitle}>Rajesh Kumar</Text>
            </View>
            <MIcon name="chevron-right" size={24} color={COLORS.textLight} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.iconContainer}>
              <Icon name="email" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Email</Text>
              <Text style={styles.settingSubtitle}>rajesh@krushisetu.com</Text>
            </View>
            <MIcon name="chevron-right" size={24} color={COLORS.textLight} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.iconContainer}>
              <Icon name="logout" size={20} color="#E74C3C" />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: '#E74C3C' }]}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* APP PREFERENCES Section */}
        <Text style={styles.sectionLabel}>APP PREFERENCES</Text>
        
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.iconContainer}>
              <Icon name="refresh" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Refresh Interval</Text>
              <Text style={styles.settingSubtitle}>Sensor data sync timing</Text>
            </View>
            <View style={styles.valueBox}>
              <Text style={styles.valueText}>15 min</Text>
            </View>
            <MIcon name="chevron-right" size={24} color={COLORS.textLight} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.iconContainer}>
              <Icon name="bell" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Alert Notifications</Text>
              <Text style={styles.settingSubtitle}>Soil moisture & pH warnings</Text>
            </View>
            <Switch
              value={alertNotifications}
              onValueChange={setAlertNotifications}
              trackColor={{ false: '#D5D8DC', true: '#A9DFBF' }}
              thumbColor={alertNotifications ? COLORS.primary : '#BDC3C7'}
            />
          </View>
        </View>

        {/* ABOUT Section */}
        <Text style={styles.sectionLabel}>ABOUT</Text>
        
        <View style={styles.card}>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.iconContainer}>
              <Icon name="information" size={20} color={COLORS.textGray} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>App Version</Text>
            </View>
            <Text style={styles.versionText}>v1.0.4</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.iconContainer}>
              <Icon name="shield-check" size={20} color={COLORS.textGray} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Terms & Privacy</Text>
            </View>
            <Icon name="open-in-new" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Icon name="leaf-circle" size={40} color={COLORS.border} />
          <Text style={styles.footerText}>KRUSHISETU TECH</Text>
        </View>

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
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  settingSubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 48,
  },
  valueBox: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#E8F8F5',
    borderRadius: 8,
    marginRight: 8,
  },
  valueText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  versionText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textLight,
    letterSpacing: 1.5,
    marginTop: 8,
  },
});

export default SettingsScreen;
