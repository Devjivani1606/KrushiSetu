import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../theme/colors';

interface SoilData {
  location: string;
  temperature: string;
  rainfall: string;
  soilPh: string;
}

interface CropRecommendation {
  name: string;
  match: number;
  expectedYield: string;
  marketDemand: string;
  note: string;
}

const CropPredictionScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selectedSeason, setSelectedSeason] = useState('Kharif (June - October)');
  const [isPredicting, setIsPredicting] = useState(false);

  const soilData: SoilData = {
    location: 'Punjab, India',
    temperature: '28°C',
    rainfall: '650mm',
    soilPh: '6.8',
  };

  const [recommendedCrop, setRecommendedCrop] = useState<CropRecommendation | null>(null);

  const seasons = [
    'Kharif (June - October)',
    'Rabi (October - March)',
    'Zaid (March - June)',
  ];

  const handlePredictCrop = () => {
    setIsPredicting(true);

    setTimeout(() => {
      setRecommendedCrop({
        name: 'Basmati Rice',
        match: 94,
        expectedYield: '4.5 tons/hectare',
        marketDemand: 'High',
        note: 'Soil nitrogen levels are optimal for rice cultivation',
      });
      setIsPredicting(false);
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crop Prediction</Text>
        <TouchableOpacity>
          <Icon name="information-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SOIL & ENVIRONMENT</Text>
          <View style={styles.dataCard}>
            <View style={styles.dataRow}>
              <View style={styles.dataItem}>
                <Icon name="map-marker" size={20} color={COLORS.primary} />
                <Text style={styles.dataLabel}>Location</Text>
                <Text style={styles.dataValue}>{soilData.location}</Text>
              </View>
              <View style={styles.dataItem}>
                <Icon name="thermometer" size={20} color={COLORS.primary} />
                <Text style={styles.dataLabel}>Temperature</Text>
                <Text style={styles.dataValue}>{soilData.temperature}</Text>
              </View>
            </View>
            <View style={styles.dataRow}>
              <View style={styles.dataItem}>
                <Icon name="water" size={20} color={COLORS.primary} />
                <Text style={styles.dataLabel}>Rainfall</Text>
                <Text style={styles.dataValue}>{soilData.rainfall}</Text>
              </View>
              <View style={styles.dataItem}>
                <Icon name="flask" size={20} color={COLORS.primary} />
                <Text style={styles.dataLabel}>Soil pH</Text>
                <Text style={styles.dataValue}>{soilData.soilPh}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SELECT SEASON</Text>
          <TouchableOpacity style={styles.dropdown}>
            <Text style={styles.dropdownValue}>{selectedSeason}</Text>
            <Icon name="chevron-down" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.predictButton, isPredicting && styles.predictButtonDisabled]}
          onPress={handlePredictCrop}
          disabled={isPredicting}
        >
          {isPredicting ? (
            <Text style={styles.predictButtonText}>Predicting...</Text>
          ) : (
            <>
              <Icon name="magic-staff" size={20} color="#fff" />
              <Text style={styles.predictButtonText}>Predict Best Crop</Text>
            </>
          )}
        </TouchableOpacity>

        {recommendedCrop && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>RECOMMENDED CROP</Text>
            <View style={styles.recommendationCard}>
              <View style={styles.cropHeader}>
                <View>
                  <Text style={styles.cropName}>{recommendedCrop.name}</Text>
                  <View style={styles.matchBadge}>
                    <Icon name="check-circle" size={16} color={COLORS.success} />
                    <Text style={styles.matchText}>{recommendedCrop.match}% Match</Text>
                  </View>
                </View>
                <View style={styles.cropIconContainer}>
                  <Icon name="grass" size={40} color={COLORS.primary} />
                </View>
              </View>

              <View style={styles.cropDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Expected Yield</Text>
                  <Text style={styles.detailValue}>{recommendedCrop.expectedYield}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Market Demand</Text>
                  <Text style={[styles.detailValue, styles.highDemand]}>High</Text>
                </View>
              </View>

              <View style={styles.noteContainer}>
                <Icon name="lightbulb-outline" size={16} color={COLORS.primary} />
                <Text style={styles.noteText}>{recommendedCrop.note}</Text>
              </View>
            </View>
          </View>
        )}

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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  dataCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dataItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  dataLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
    marginBottom: 2,
  },
  dataValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  dropdownValue: {
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  predictButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
    marginBottom: 20,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  predictButtonDisabled: {
    backgroundColor: COLORS.textLight,
    shadowOpacity: 0,
  },
  predictButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  recommendationCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  cropHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cropName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7F5EF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  matchText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.success,
    marginLeft: 4,
  },
  cropIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F7F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cropDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  highDemand: {
    color: COLORS.success,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  noteText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
});

export default CropPredictionScreen;
