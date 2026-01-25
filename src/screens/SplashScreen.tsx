import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../theme/colors';

const SplashScreen = ({ navigation }: any) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Home');
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.iconBg}>
          <Icon name="leaf" size={60} color={COLORS.primary} />
        </View>
        <Text style={styles.appName}>KrushiSetu</Text>
        <Text style={styles.tagline}>Smart Soil Monitoring for Smart Farming</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.loaderContainer}>
          <View style={styles.line} />
          <Text style={styles.loadingText}>INITIALIZING SENSORS</Text>
          <View style={styles.line} />
        </View>
        <Text style={styles.poweredBy}>POWERED BY IOT CORE</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  iconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 24,
  },
  appName: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.textDark,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textGray,
    marginTop: 12,
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    width: '100%',
  },
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  line: {
    height: 1,
    width: 30,
    backgroundColor: COLORS.border,
    marginHorizontal: 10,
  },
  loadingText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textLight,
    letterSpacing: 2,
  },
  poweredBy: {
    fontSize: 10,
    color: COLORS.textLight,
    letterSpacing: 1.5,
    marginTop: 10,
  },
});

export default SplashScreen;