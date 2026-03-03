import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../theme/colors';
import { cropOptions, stateOptions, mandiOptionsByState, type StateName } from '../config/mandi.config';

// Type assertion for mandiOptionsByState to match StateName keys
const mandiOptions = mandiOptionsByState as Record<StateName, string[]>;

const { width } = Dimensions.get('window');

interface PriceData {
  date: string;
  price: number;
}

const PriceHistory: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('1M');
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showMandiModal, setShowMandiModal] = useState(false);
  
  const [selectedCrop, setSelectedCrop] = useState('Rice');
  const [selectedState, setSelectedState] = useState<StateName>('Maharashtra');
  const [selectedMandi, setSelectedMandi] = useState('Nagpur');

  const timeRanges = ['7D', '1M', '6M', '1Y'];
  
  // Create mutable copies for modal functions
  const mutableCropOptions = [...cropOptions];
  const mutableStateOptions = [...stateOptions];
  
  // Wrapper functions to handle type conversion
  const handleCropSelect = (crop: string) => setSelectedCrop(crop);
  const handleStateSelect = (state: string) => setSelectedState(state as StateName);
  const handleMandiSelect = (mandi: string) => setSelectedMandi(mandi);
  
  const getCurrentMandiOptions = () => {
    return mandiOptions[selectedState] || ['Nagpur', 'Mumbai', 'Pune', 'Nashik'];
  };
  
  const mockPriceData: PriceData[] = [
    { date: '01 OCT', price: 4200 },
    { date: '10 OCT', price: 4350 },
    { date: '20 OCT', price: 4500 },
    { date: '30 OCT', price: 4680 },
  ];

  useEffect(() => {
    setTimeout(() => {
      setPriceData(mockPriceData);
      setLoading(false);
    }, 1000);
  }, [selectedTimeRange, selectedCrop, selectedState, selectedMandi]);

  const renderSimpleChart = () => {
    if (priceData.length === 0) return null;
    
    const maxPrice = Math.max(...priceData.map(d => d.price));
    const minPrice = Math.min(...priceData.map(d => d.price));
    const priceRange = maxPrice - minPrice || 1;
    const chartHeight = 160;
    const chartWidth = width - 64;
    const pointSpacing = chartWidth / (priceData.length - 1);
    
    return (
      <View style={styles.chartContainer}>
        {/* Grid lines */}
        {[0, 1, 2].map((index) => (
          <View
            key={index}
            style={[
              styles.gridLine,
              { bottom: (index * chartHeight) / 2 }
            ]}
          />
        ))}
        
        {/* Chart line and points */}
        <View style={styles.chartLineContainer}>
          {priceData.map((point, index) => {
            const x = index * pointSpacing;
            const y = chartHeight - ((point.price - minPrice) / priceRange) * chartHeight;
            const isHighlighted = index === priceData.length - 1;
            
            return (
              <React.Fragment key={index}>
                {/* Line to next point */}
                {index < priceData.length - 1 && (
                  <View
                    style={[
                      styles.chartLine,
                      {
                        left: x,
                        bottom: y,
                        width: pointSpacing,
                        height: 2,
                        backgroundColor: COLORS.primary,
                      }
                    ]}
                  />
                )}
                
                {/* Data point */}
                <View
                  style={[
                    styles.dataPoint,
                    {
                      left: x - 6,
                      bottom: y - 6,
                      backgroundColor: isHighlighted ? COLORS.primary : COLORS.white,
                      borderColor: COLORS.primary,
                    }
                  ]}
                />
                
                {/* X-axis label */}
                <Text
                  style={[
                    styles.xAxisLabel,
                    { left: x - 20 }
                  ]}
                >
                  {point.date}
                </Text>
              </React.Fragment>
            );
          })}
        </View>
      </View>
    );
  };

  const renderModal = (visible: boolean, onClose: () => void, title: string, options: string[], onSelect: (value: string) => void) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select {title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalList}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.modalOption}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
              >
                <Text style={styles.modalOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-left" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.pageTitle}>Price History</Text>
            <Text style={styles.subtitle}>{selectedCrop} - {selectedMandi} Mandi</Text>
          </View>
        </View>

        {/* Filter Chips */}
        <View style={styles.chipsContainer}>
          <TouchableOpacity 
            style={styles.chip}
            onPress={() => setShowCropModal(true)}
          >
            <Text style={styles.chipText}>Crop: {selectedCrop}</Text>
            <Icon name="chevron-down" size={12} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.chip}
            onPress={() => setShowStateModal(true)}
          >
            <Text style={styles.chipText}>State: {selectedState}</Text>
            <Icon name="chevron-down" size={12} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.chip}
            onPress={() => setShowMandiModal(true)}
          >
            <Text style={styles.chipText}>Mandi: {selectedMandi}</Text>
            <Icon name="chevron-down" size={12} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          {timeRanges.map((range) => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                selectedTimeRange === range && styles.selectedTimeRange,
              ]}
              onPress={() => setSelectedTimeRange(range)}
            >
              <Text
                style={[
                  styles.timeRangeText,
                  selectedTimeRange === range && styles.selectedTimeRangeText,
                ]}
              >
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Price Trend Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>PRICE TREND (₹/QUINTAL)</Text>
            <View style={styles.trendBadge}>
              <Text style={styles.trendText}>+4.2% this month</Text>
            </View>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            renderSimpleChart()
          )}
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Highest Price</Text>
            <Text style={styles.highestPrice}>₹4,850</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statTitle}>Lowest Price</Text>
            <Text style={styles.lowestPrice}>₹4,100</Text>
          </View>
        </View>

        {/* Market Insight */}
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Icon name="chart-pie" size={20} color={COLORS.primary} />
            <Text style={styles.insightTitle}>Market Insight</Text>
          </View>
          <Text style={styles.insightText}>
            Prices are trending upwards due to increased demand in neighboring states. 
            Expected to stay stable this week.
          </Text>
          <Icon name="information" size={60} color={COLORS.primary} style={styles.backgroundIcon} />
        </View>

        {/* Bottom CTA Button */}
        <TouchableOpacity style={styles.ctaButton}>
          <Icon name="bell-outline" size={20} color={COLORS.white} />
          <Text style={styles.ctaText}>Set Price Alert</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Modals */}
      {renderModal(showCropModal, () => setShowCropModal(false), 'Crop', mutableCropOptions, handleCropSelect)}
      {renderModal(showStateModal, () => setShowStateModal(false), 'State', mutableStateOptions, handleStateSelect)}
      {renderModal(showMandiModal, () => setShowMandiModal(false), 'Mandi', getCurrentMandiOptions(), handleMandiSelect)}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textGray,
    marginTop: 2,
  },
  chipsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 18,
    alignItems: 'center',
  },
  selectedTimeRange: {
    backgroundColor: COLORS.primary,
  },
  timeRangeText: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  selectedTimeRangeText: {
    color: COLORS.white,
  },
  chartCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textGray,
    letterSpacing: 0.5,
  },
  trendBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '500',
  },
  loadingContainer: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartContainer: {
    height: 160,
    position: 'relative',
    marginVertical: 8,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  chartLineContainer: {
    position: 'relative',
    height: 140,
  },
  chartLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: COLORS.primary,
    transformOrigin: 'left center',
  },
  dataPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  xAxisLabel: {
    position: 'absolute',
    bottom: -20,
    fontSize: 10,
    color: COLORS.textGray,
    width: 40,
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statTitle: {
    fontSize: 12,
    color: COLORS.textGray,
    marginBottom: 8,
  },
  highestPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  lowestPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F44336',
  },
  insightCard: {
    backgroundColor: '#F1F8E9',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DCEDC8',
    position: 'relative',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  insightText: {
    fontSize: 12,
    color: COLORS.textDark,
    lineHeight: 18,
  },
  backgroundIcon: {
    position: 'absolute',
    right: 16,
    bottom: 8,
    opacity: 0.1,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.white,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  modalList: {
    flex: 1,
    paddingHorizontal: 8,
  },
  modalOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    minHeight: 50,
  },
  modalOptionText: {
    fontSize: 16,
    color: COLORS.textDark,
  },
});

export default PriceHistory;
