import React, {useState, useEffect, useMemo} from 'react';
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
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {LineChart} from 'react-native-chart-kit';
import {COLORS} from '../theme/colors';
import {
  cropOptions,
  stateOptions,
  mandiOptionsByState,
  type StateName,
} from '../config/mandi.config';
import {fetchMandiHistory} from '../services/mandi';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

interface PriceData {
  date: string;
  price: number;
}

type FetchState = 'idle' | 'loading' | 'success' | 'empty' | 'error';

const PriceHistory: React.FC<{navigation: any}> = ({navigation}) => {
  // Selection state
  const [selectedCrop, setSelectedCrop] = useState('Rice');
  const [selectedState, setSelectedState] = useState<StateName>('Maharashtra');
  const [selectedMandi, setSelectedMandi] = useState('Nagpur');
  const [selectedTimeRange, setSelectedTimeRange] = useState('1M');

  // Data state
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [trendPercent, setTrendPercent] = useState('+0%');

  // Modal state
  const [showCropModal, setShowCropModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showMandiModal, setShowMandiModal] = useState(false);

  const timeRanges = ['7D', '1M', '6M', '1Y'];

  // Get mandi options for selected state
  const currentMandiOptions = useMemo(() => {
    const options = (mandiOptionsByState as Record<string, string[]>)[
      selectedState
    ];
    return options || ['Nagpur', 'Mumbai', 'Pune', 'Nashik'];
  }, [selectedState]);

  // When state changes, reset mandi to first option of new state
  useEffect(() => {
    const options = (mandiOptionsByState as Record<string, string[]>)[
      selectedState
    ];
    if (options && options.length > 0) {
      setSelectedMandi(options[0]);
    }
  }, [selectedState]);

  // Fetch data when selection changes
  useEffect(() => {
    let cancelled = false;

    const fetchPriceData = async () => {
      try {
        setFetchState('loading');
        setErrorMessage('');

        const result = await fetchMandiHistory({
          crop: selectedCrop,
          state: selectedState,
          mandi: selectedMandi,
          range: selectedTimeRange as any,
        });

        if (cancelled) return;

        if (result.kind === 'ok') {
          const formattedData = result.payload.history.map(item => ({
            date: new Date(item.date)
              .toLocaleDateString('en-IN', {day: '2-digit', month: 'short'})
              .toUpperCase(),
            price: item.modal_price,
          }));

          if (formattedData.length === 0) {
            setFetchState('empty');
            setPriceData([]);
          } else {
            setPriceData(formattedData);
            setTrendPercent(result.payload.trend || '+0%');
            setFetchState('success');
          }
        } else {
          // kind === 'empty'
          setFetchState('empty');
          setPriceData([]);
        }
      } catch (error: any) {
        if (cancelled) return;
        console.error('Error fetching price data:', error);
        setFetchState('error');
        setErrorMessage(
          error?.message || 'Failed to load data. Please try again.',
        );
      }
    };

    fetchPriceData();

    return () => {
      cancelled = true;
    };
  }, [selectedTimeRange, selectedCrop, selectedState, selectedMandi]);

  // Derived statistics
  const {highestPrice, lowestPrice, avgPrice} = useMemo(() => {
    if (priceData.length === 0) {
      return {highestPrice: 0, lowestPrice: 0, avgPrice: 0};
    }
    const prices = priceData.map(d => d.price);
    const highest = Math.max(...prices);
    const lowest = Math.min(...prices);
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    return {highestPrice: highest, lowestPrice: lowest, avgPrice: avg};
  }, [priceData]);

  // Dynamic market insight
  const marketInsight = useMemo(() => {
    if (priceData.length < 2) {
      return 'Select a crop and state to see market insights.';
    }

    const first = priceData[0].price;
    const last = priceData[priceData.length - 1].price;
    const change = ((last - first) / first) * 100;

    if (change > 5) {
      return `${selectedCrop} prices are trending upwards in ${selectedState} with a ${change.toFixed(1)}% increase. Strong demand is driving prices higher. Consider selling if you have stock.`;
    } else if (change > 0) {
      return `${selectedCrop} prices in ${selectedState} are showing a slight upward trend (+${change.toFixed(1)}%). Market is relatively stable with moderate demand.`;
    } else if (change > -5) {
      return `${selectedCrop} prices in ${selectedState} are showing a slight decline (${change.toFixed(1)}%). Supply is outpacing demand currently. Prices may stabilize soon.`;
    } else {
      return `${selectedCrop} prices in ${selectedState} are showing a significant decline (${change.toFixed(1)}%). High supply is driving prices down. Consider holding stock if possible.`;
    }
  }, [priceData, selectedCrop, selectedState]);

  // Trend direction for badge color
  const isTrendPositive = useMemo(() => {
    return trendPercent.startsWith('+');
  }, [trendPercent]);

  // Chart rendering with react-native-chart-kit (horizontally scrollable)
  const renderChart = () => {
    if (priceData.length === 0) return null;

    const dataCount = priceData.length;

    // Each data point gets at least 65px of horizontal space
    const PX_PER_POINT = 65;
    const cardInnerWidth = SCREEN_WIDTH - 48 - 32; // card margin + padding
    // Chart is either full card width or wider if many data points
    const chartWidth = Math.max(cardInnerWidth, dataCount * PX_PER_POINT);
    const isScrollable = chartWidth > cardInnerWidth;

    // Show all labels — horizontal scroll provides enough room
    // Format labels shorter if there are many points
    const labels = priceData.map(d => {
      // Shorten label: "22 MAR" → "22 Mar"
      const parts = d.date.split(' ');
      if (parts.length === 2) {
        return `${parts[0]} ${parts[1].charAt(0)}${parts[1].slice(1).toLowerCase()}`;
      }
      return d.date;
    });

    const chartComponent = (
      <LineChart
        data={{
          labels: labels,
          datasets: [
            {
              data: priceData.map(d => d.price),
              strokeWidth: 2.5,
            },
          ],
        }}
        width={chartWidth}
        height={220}
        yAxisLabel="₹"
        yAxisSuffix=""
        yAxisInterval={1}
        withInnerLines={true}
        withOuterLines={false}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        withDots={true}
        withShadow={false}
        fromZero={false}
        segments={4}
        chartConfig={{
          backgroundColor: '#FFFFFF',
          backgroundGradientFrom: '#FFFFFF',
          backgroundGradientTo: '#FFFFFF',
          color: (opacity = 1) => `rgba(45, 106, 79, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(82, 96, 102, ${opacity})`,
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: '#2D6A4F',
            fill: '#FFFFFF',
          },
          propsForBackgroundLines: {
            strokeDasharray: '5 5',
            stroke: 'rgba(0,0,0,0.06)',
            strokeWidth: 1,
          },
          propsForLabels: {
            fontSize: 9,
            fontWeight: '500',
          },
          fillShadowGradient: '#2D6A4F',
          fillShadowGradientOpacity: 0.12,
          fillShadowGradientFrom: '#2D6A4F',
          fillShadowGradientTo: '#FFFFFF',
        }}
        bezier
        style={styles.chartStyle}
      />
    );

    if (isScrollable) {
      return (
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={styles.chartScrollContent}
            style={styles.chartScrollView}>
            {chartComponent}
          </ScrollView>
          <View style={styles.scrollHint}>
            <Icon name="gesture-swipe-horizontal" size={14} color={COLORS.textLight} />
            <Text style={styles.scrollHintText}>Swipe to see more</Text>
          </View>
        </View>
      );
    }

    return <View style={styles.chartWrapper}>{chartComponent}</View>;
  };

  // Bottom sheet modal for selections
  const renderSelectionModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    options: readonly string[] | string[],
    selectedValue: string,
    onSelect: (value: string) => void,
  ) => {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onClose}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select {title}</Text>
              <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
                <Icon name="close" size={22} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.modalList}
              showsVerticalScrollIndicator={false}>
              {[...options].map(option => {
                const isSelected = option === selectedValue;
                return (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.modalOption,
                      isSelected && styles.modalOptionSelected,
                    ]}
                    onPress={() => {
                      onSelect(option);
                      onClose();
                    }}>
                    <Text
                      style={[
                        styles.modalOptionText,
                        isSelected && styles.modalOptionTextSelected,
                      ]}>
                      {option}
                    </Text>
                    {isSelected && (
                      <Icon
                        name="check-circle"
                        size={20}
                        color={COLORS.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
              <View style={{height: 30}} />
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  // Loading state
  const renderLoading = () => (
    <View style={styles.stateContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.stateText}>Loading price data...</Text>
    </View>
  );

  // Empty state
  const renderEmpty = () => (
    <View style={styles.stateContainer}>
      <Icon name="chart-line" size={48} color={COLORS.textLight} />
      <Text style={styles.stateTitle}>No Data Available</Text>
      <Text style={styles.stateText}>
        No market data available for {selectedCrop} in {selectedMandi},{' '}
        {selectedState}.
      </Text>
      <Text style={styles.stateHint}>
        Try selecting a different crop, state, or mandi.
      </Text>
    </View>
  );

  // Error state
  const renderError = () => (
    <View style={styles.stateContainer}>
      <Icon name="alert-circle-outline" size={48} color="#F44336" />
      <Text style={styles.stateTitle}>Something went wrong</Text>
      <Text style={styles.stateText}>{errorMessage}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => {
          // Force re-fetch by toggling a dummy state
          setFetchState('idle');
          setSelectedTimeRange(prev => prev);
        }}>
        <Icon name="refresh" size={18} color={COLORS.white} />
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Icon name="chevron-left" size={28} color={COLORS.textDark} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.pageTitle}>Price History</Text>
            <Text style={styles.subtitle}>
              {selectedCrop} - {selectedMandi} Mandi
            </Text>
          </View>
          <View style={{width: 28}} />
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContainer}>
          <TouchableOpacity
            style={styles.chip}
            activeOpacity={0.7}
            onPress={() => setShowCropModal(true)}>
            <Icon
              name="sprout"
              size={14}
              color={COLORS.primary}
              style={styles.chipIcon}
            />
            <Text style={styles.chipText}>Crop: {selectedCrop}</Text>
            <Icon name="chevron-down" size={16} color={COLORS.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.chip}
            activeOpacity={0.7}
            onPress={() => setShowStateModal(true)}>
            <Icon
              name="map-marker"
              size={14}
              color={COLORS.primary}
              style={styles.chipIcon}
            />
            <Text style={styles.chipText}>State: {selectedState}</Text>
            <Icon name="chevron-down" size={16} color={COLORS.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.chip}
            activeOpacity={0.7}
            onPress={() => setShowMandiModal(true)}>
            <Icon
              name="store"
              size={14}
              color={COLORS.primary}
              style={styles.chipIcon}
            />
            <Text style={styles.chipText}>Mandi: {selectedMandi}</Text>
            <Icon name="chevron-down" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </ScrollView>

        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          {timeRanges.map(range => (
            <TouchableOpacity
              key={range}
              style={[
                styles.timeRangeButton,
                selectedTimeRange === range && styles.selectedTimeRange,
              ]}
              onPress={() => setSelectedTimeRange(range)}>
              <Text
                style={[
                  styles.timeRangeText,
                  selectedTimeRange === range && styles.selectedTimeRangeText,
                ]}>
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Price Trend Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>PRICE TREND (₹/QUINTAL)</Text>
            {fetchState === 'success' && (
              <View
                style={[
                  styles.trendBadge,
                  !isTrendPositive && styles.trendBadgeNegative,
                ]}>
                <Icon
                  name={isTrendPositive ? 'trending-up' : 'trending-down'}
                  size={12}
                  color={isTrendPositive ? COLORS.success : '#F44336'}
                  style={{marginRight: 4}}
                />
                <Text
                  style={[
                    styles.trendText,
                    !isTrendPositive && styles.trendTextNegative,
                  ]}>
                  {trendPercent} this period
                </Text>
              </View>
            )}
          </View>

          {fetchState === 'loading' && renderLoading()}
          {fetchState === 'error' && renderError()}
          {fetchState === 'empty' && renderEmpty()}
          {fetchState === 'success' && renderChart()}
        </View>

        {/* Statistics Cards */}
        {fetchState === 'success' && (
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, styles.statCardHigh]}>
              <View style={styles.statIconRow}>
                <Icon name="arrow-up-bold" size={18} color={COLORS.success} />
                <Text style={styles.statTitle}>Highest Price</Text>
              </View>
              <Text style={styles.highestPrice}>
                ₹{highestPrice.toLocaleString('en-IN')}
              </Text>
              <Text style={styles.statUnit}>/quintal</Text>
            </View>
            <View style={[styles.statCard, styles.statCardLow]}>
              <View style={styles.statIconRow}>
                <Icon name="arrow-down-bold" size={18} color="#F44336" />
                <Text style={styles.statTitle}>Lowest Price</Text>
              </View>
              <Text style={styles.lowestPrice}>
                ₹{lowestPrice.toLocaleString('en-IN')}
              </Text>
              <Text style={styles.statUnit}>/quintal</Text>
            </View>
          </View>
        )}

        {/* Average Price Card */}
        {fetchState === 'success' && (
          <View style={styles.avgCard}>
            <View style={styles.avgRow}>
              <Icon name="chart-bar" size={18} color={COLORS.primary} />
              <Text style={styles.avgLabel}>Average Price</Text>
            </View>
            <Text style={styles.avgPrice}>
              ₹{avgPrice.toLocaleString('en-IN')}/quintal
            </Text>
          </View>
        )}

        {/* Market Insight */}
        {fetchState === 'success' && (
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <Icon name="lightbulb-on" size={20} color={COLORS.primary} />
              <Text style={styles.insightTitle}>Market Insight</Text>
            </View>
            <Text style={styles.insightText}>{marketInsight}</Text>
            <Icon
              name="chart-areaspline"
              size={60}
              color={COLORS.primary}
              style={styles.backgroundIcon}
            />
          </View>
        )}


      </ScrollView>

      {/* Selection Modals — rendered OUTSIDE useCallback so they always get fresh state */}
      {renderSelectionModal(
        showCropModal,
        () => setShowCropModal(false),
        'Crop',
        cropOptions,
        selectedCrop,
        value => setSelectedCrop(value),
      )}
      {renderSelectionModal(
        showStateModal,
        () => setShowStateModal(false),
        'State',
        stateOptions,
        selectedState,
        value => setSelectedState(value as StateName),
      )}
      {renderSelectionModal(
        showMandiModal,
        () => setShowMandiModal(false),
        'Mandi',
        currentMandiOptions,
        selectedMandi,
        value => setSelectedMandi(value),
      )}
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
  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    fontSize: 19,
    fontWeight: '700',
    color: COLORS.textDark,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textGray,
    marginTop: 2,
  },
  // ── Filter Chips ──
  chipsScroll: {
    flexGrow: 0,
  },
  chipsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 5,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  chipIcon: {
    marginRight: 2,
  },
  chipText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  // ── Time Range ──
  timeRangeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    alignItems: 'center',
  },
  selectedTimeRange: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  timeRangeText: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  selectedTimeRangeText: {
    color: COLORS.white,
  },
  // ── Chart Card ──
  chartCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textGray,
    letterSpacing: 1,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  trendBadgeNegative: {
    backgroundColor: '#FFEBEE',
  },
  trendText: {
    fontSize: 11,
    color: COLORS.success,
    fontWeight: '600',
  },
  trendTextNegative: {
    color: '#F44336',
  },
  // ── Chart ──
  chartWrapper: {
    alignItems: 'center',
    marginTop: 8,
    overflow: 'visible' as const,
  },
  chartScrollView: {
    marginTop: 8,
  },
  chartScrollContent: {
    paddingRight: 16,
  },
  chartStyle: {
    borderRadius: 12,
    marginLeft: -8,
  },
  scrollHint: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 4,
    paddingTop: 6,
    paddingBottom: 2,
  },
  scrollHintText: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '400' as const,
  },
  // ── Loading / Empty / Error ──
  stateContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  stateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    marginTop: 12,
  },
  stateText: {
    fontSize: 13,
    color: COLORS.textGray,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  stateHint: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 6,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 16,
    gap: 6,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
  // ── Stats ──
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statCardHigh: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.success,
  },
  statCardLow: {
    borderLeftWidth: 3,
    borderLeftColor: '#F44336',
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    color: COLORS.textGray,
    fontWeight: '500',
  },
  highestPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  lowestPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F44336',
  },
  statUnit: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
  // ── Average Card ──
  avgCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  avgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avgLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textGray,
  },
  avgPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  // ── Insight ──
  insightCard: {
    backgroundColor: '#F1F8E9',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DCEDC8',
    position: 'relative',
    overflow: 'hidden',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  insightText: {
    fontSize: 13,
    color: COLORS.textDark,
    lineHeight: 20,
    paddingRight: 40,
  },
  backgroundIcon: {
    position: 'absolute',
    right: 10,
    bottom: 6,
    opacity: 0.07,
  },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalList: {
    paddingHorizontal: 12,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    borderRadius: 8,
    minHeight: 50,
  },
  modalOptionSelected: {
    backgroundColor: '#E8F5E9',
    borderBottomColor: '#E8F5E9',
  },
  modalOptionText: {
    fontSize: 15,
    color: COLORS.textDark,
    fontWeight: '400',
  },
  modalOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default PriceHistory;
