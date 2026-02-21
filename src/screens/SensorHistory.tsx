import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../theme/colors';

const { width, height } = Dimensions.get('window');

interface ChartDataPoint {
  time: string;
  value: number;
}

interface SensorData {
  [key: string]: {
    [key: string]: ChartDataPoint[];
  };
}

const SensorHistory = ({ navigation }: any) => {
  const [selectedSensor, setSelectedSensor] = useState('Moisture');
  const [selectedRange, setSelectedRange] = useState('7 Days');
  const [selectedDevice, setSelectedDevice] = useState('KS-GW-Alpha');
  const [isLoading, setIsLoading] = useState(false);

  const sensorTypes = ['Moisture', 'Temperature', 'Humidity', 'Soil pH'];
  const timeRanges = ['Today', '7 Days', '30 Days'];

  // Mock sensor data for different sensors and time ranges
  const sensorData: SensorData = {
    'Moisture': {
      'Today': [
        { time: '00:00', value: 45 },
        { time: '04:00', value: 42 },
        { time: '08:00', value: 38 },
        { time: '12:00', value: 35 },
        { time: '16:00', value: 40 },
        { time: '20:00', value: 43 },
        { time: '24:00', value: 46 },
      ],
      '7 Days': [
        { time: 'Mon', value: 42 },
        { time: 'Tue', value: 45 },
        { time: 'Wed', value: 38 },
        { time: 'Thu', value: 41 },
        { time: 'Fri', value: 35 },
        { time: 'Sat', value: 43 },
        { time: 'Sun', value: 46 },
      ],
      '30 Days': [
        { time: 'Week 1', value: 40 },
        { time: 'Week 2', value: 43 },
        { time: 'Week 3', value: 38 },
        { time: 'Week 4', value: 45 },
      ],
    },
    'Temperature': {
      'Today': [
        { time: '00:00', value: 22 },
        { time: '04:00', value: 20 },
        { time: '08:00', value: 25 },
        { time: '12:00', value: 32 },
        { time: '16:00', value: 30 },
        { time: '20:00', value: 26 },
        { time: '24:00', value: 23 },
      ],
      '7 Days': [
        { time: 'Mon', value: 24 },
        { time: 'Tue', value: 26 },
        { time: 'Wed', value: 28 },
        { time: 'Thu', value: 25 },
        { time: 'Fri', value: 30 },
        { time: 'Sat', value: 27 },
        { time: 'Sun', value: 23 },
      ],
      '30 Days': [
        { time: 'Week 1', value: 25 },
        { time: 'Week 2', value: 27 },
        { time: 'Week 3', value: 29 },
        { time: 'Week 4', value: 26 },
      ],
    },
    'Humidity': {
      'Today': [
        { time: '00:00', value: 65 },
        { time: '04:00', value: 70 },
        { time: '08:00', value: 60 },
        { time: '12:00', value: 55 },
        { time: '16:00', value: 58 },
        { time: '20:00', value: 62 },
        { time: '24:00', value: 68 },
      ],
      '7 Days': [
        { time: 'Mon', value: 62 },
        { time: 'Tue', value: 65 },
        { time: 'Wed', value: 58 },
        { time: 'Thu', value: 60 },
        { time: 'Fri', value: 55 },
        { time: 'Sat', value: 63 },
        { time: 'Sun', value: 67 },
      ],
      '30 Days': [
        { time: 'Week 1', value: 60 },
        { time: 'Week 2', value: 63 },
        { time: 'Week 3', value: 58 },
        { time: 'Week 4', value: 65 },
      ],
    },
    'Soil pH': {
      'Today': [
        { time: '00:00', value: 6.5 },
        { time: '04:00', value: 6.4 },
        { time: '08:00', value: 6.6 },
        { time: '12:00', value: 6.7 },
        { time: '16:00', value: 6.5 },
        { time: '20:00', value: 6.4 },
        { time: '24:00', value: 6.6 },
      ],
      '7 Days': [
        { time: 'Mon', value: 6.5 },
        { time: 'Tue', value: 6.6 },
        { time: 'Wed', value: 6.4 },
        { time: 'Thu', value: 6.7 },
        { time: 'Fri', value: 6.5 },
        { time: 'Sat', value: 6.3 },
        { time: 'Sun', value: 6.6 },
      ],
      '30 Days': [
        { time: 'Week 1', value: 6.5 },
        { time: 'Week 2', value: 6.6 },
        { time: 'Week 3', value: 6.4 },
        { time: 'Week 4', value: 6.7 },
      ],
    },
  };

  // Get current chart data based on selected sensor and range
  const chartData = useMemo(() => {
    return sensorData[selectedSensor]?.[selectedRange] || [];
  }, [selectedSensor, selectedRange]);

  // Calculate statistics dynamically
  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return { average: 0, minimum: 0, maximum: 0, trend: 'stable' };
    }

    const values = chartData.map(d => d.value);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const minimum = Math.min(...values);
    const maximum = Math.max(...values);

    // Calculate trend
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    let trend = 'stable';
    if (secondAvg > firstAvg * 1.05) trend = 'increasing';
    else if (secondAvg < firstAvg * 0.95) trend = 'decreasing';

    return { average, minimum, maximum, trend };
  }, [chartData]);

  // Simulate loading when changing filters
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [selectedSensor, selectedRange]);

  // Format value based on sensor type
  const formatValue = (value: number) => {
    switch (selectedSensor) {
      case 'Moisture':
        return `${value.toFixed(1)}%`;
      case 'Temperature':
        return `${value.toFixed(1)}°C`;
      case 'Humidity':
        return `${value.toFixed(1)}%`;
      case 'Soil pH':
        return value.toFixed(1);
      default:
        return value.toFixed(1);
    }
  };

  // Advanced chart with smooth curves and proper scaling
  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="chart-line" size={48} color={COLORS.textLight} />
          <Text style={styles.emptyStateText}>No Data Available</Text>
          <Text style={styles.emptyStateSubtext}>Select a different time range or sensor</Text>
        </View>
      );
    }

    const maxValue = Math.max(...chartData.map(d => d.value));
    const minValue = Math.min(...chartData.map(d => d.value));
    const range = maxValue - minValue || 1; // Prevent division by zero

    const chartHeight = 180;
    const chartWidth = width - 120; // Reduced width to prevent overflow
    const pointSpacing = chartWidth / (chartData.length - 1);
    const padding = 8;

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
          <Text style={styles.chartTitle}>Sensor Readings</Text>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.legendText}>{selectedSensor}</Text>
            </View>
          </View>
        </View>

        <View style={styles.chartWrapper}>
          {/* Y-axis labels */}
          <View style={styles.yAxis}>
            <Text style={styles.yAxisLabel}>{formatValue(maxValue)}</Text>
            <Text style={styles.yAxisLabel}>
              {formatValue(minValue + (maxValue - minValue) / 2)}
            </Text>
            <Text style={styles.yAxisLabel}>{formatValue(minValue)}</Text>
          </View>

          {/* Chart area */}
          <View style={styles.chartArea}>
            {/* Grid lines */}
            <View style={[styles.gridLine, { top: 0 }]} />
            <View style={[styles.gridLine, { top: '50%' }]} />
            <View style={[styles.gridLine, { top: '100%' }]} />

            {/* Data visualization */}
            <View style={styles.chartPoints}>
              {/* Smooth curve line using multiple segments */}
              {chartData.length > 1 && chartData.map((point, index) => {
                if (index === 0) return null;

                const x = index * pointSpacing + padding;
                const y = chartHeight - ((point.value - minValue) / range) * chartHeight;
                const prevX = (index - 1) * pointSpacing + padding;
                const prevY = chartHeight - ((chartData[index - 1].value - minValue) / range) * chartHeight;

                // Create smooth curve with multiple segments
                const segments = 8;
                return Array.from({ length: segments }, (_, segIndex) => {
                  const t = segIndex / segments;
                  const smoothX = prevX + (x - prevX) * t;
                  const smoothY = prevY + (y - prevY) * t +
                    Math.sin(t * Math.PI) * Math.abs(y - prevY) * 0.1;

                  return (
                    <View
                      key={`${index}-${segIndex}`}
                      style={{
                        position: 'absolute',
                        left: smoothX - 0.5,
                        top: smoothY - 0.5,
                        width: 1,
                        height: 2,
                        backgroundColor: COLORS.primary,
                        transform: [
                          { rotate: `${Math.atan2(y - prevY, x - prevX)}rad` }
                        ],
                      }}
                    />
                  );
                });
              })}

              {/* Data points */}
              {chartData.map((point, index) => {
                const x = index * pointSpacing + padding;
                const y = chartHeight - ((point.value - minValue) / range) * chartHeight;

                return (
                  <View key={index}>
                    {/* Data point */}
                    <View
                      style={[
                        styles.dataPoint,
                        {
                          left: x - 8,
                          top: y - 8,
                        },
                      ]}
                    />

                    {/* Value labels */}
                    {index % Math.ceil(chartData.length / 4) === 0 && (
                      <View style={[styles.valueLabel, { left: x - 25, top: y - 40 }]}>
                        <Text style={styles.valueLabelText}>{formatValue(point.value)}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {/* X-axis labels */}
            <View style={styles.xAxis}>
              {chartData.map((point, index) => (
                <Text
                  key={index}
                  style={[
                    styles.xAxisLabel,
                    {
                      left: index * pointSpacing + padding - 20,
                      opacity: index % Math.ceil(chartData.length / 4) === 0 ? 1 : 0.3
                    }
                  ]}
                >
                  {point.time}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MIcon name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sensor History</Text>
        <TouchableOpacity style={styles.refreshButton}>
          <MIcon name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Device Selector */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="device-hub" size={20} color={COLORS.primary} />
            <Text style={styles.cardLabel}>Connected Gateway</Text>
          </View>
          <TouchableOpacity style={styles.selector}>
            <Text style={styles.selectorText}>{selectedDevice}</Text>
            <MIcon name="arrow-drop-down" size={24} color={COLORS.textGray} />
          </TouchableOpacity>
        </View>

        {/* Sensor Type Selector */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sensor Type</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipContainer}>
          {sensorTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.chip, selectedSensor === type && styles.chipActive]}
              onPress={() => setSelectedSensor(type)}
            >
              <Icon
                name={
                  type === 'Moisture' ? 'water' :
                    type === 'Temperature' ? 'thermometer' :
                      type === 'Humidity' ? 'water-percent' : 'test-tube'
                }
                size={16}
                color={selectedSensor === type ? COLORS.white : COLORS.textGray}
              />
              <Text style={[styles.chipText, selectedSensor === type && styles.chipTextActive]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Time Range Selector */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Time Range</Text>
        </View>
        <View style={styles.timeRangeContainer}>
          {timeRanges.map((range) => (
            <TouchableOpacity
              key={range}
              style={[styles.timeRangeButton, selectedRange === range && styles.timeRangeActive]}
              onPress={() => setSelectedRange(range)}
            >
              <Text style={[styles.timeRangeText, selectedRange === range && styles.timeRangeTextActive]}>
                {range}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Chart with Loading State */}
        <View style={styles.card}>
          {isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading sensor data...</Text>
            </View>
          ) : (
            renderChart()
          )}
        </View>

        {/* Summary Stats */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Summary Statistics</Text>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#E8F4FD' }]}>
              <Icon name="chart-line" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.statLabel}>Average</Text>
            <Text style={styles.statValue}>{formatValue(stats.average)}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#FDE8E8' }]}>
              <Icon name="arrow-down" size={24} color="#E74C3C" />
            </View>
            <Text style={styles.statLabel}>Minimum</Text>
            <Text style={styles.statValue}>{formatValue(stats.minimum)}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: '#E8F8F5' }]}>
              <Icon name="arrow-up" size={24} color="#2ECC71" />
            </View>
            <Text style={styles.statLabel}>Maximum</Text>
            <Text style={styles.statValue}>{formatValue(stats.maximum)}</Text>
          </View>
        </View>

        {/* Trend Indicator */}
        <View style={styles.trendCard}>
          <View style={styles.trendHeader}>
            <Icon name="trending-up" size={20} color={COLORS.primary} />
            <Text style={styles.trendTitle}>Trend Analysis</Text>
          </View>
          <View style={styles.trendContent}>
            <Icon
              name={
                stats.trend === 'increasing' ? 'trending-up' :
                  stats.trend === 'decreasing' ? 'trending-down' : 'trending-neutral'
              }
              size={32}
              color={
                stats.trend === 'increasing' ? '#2ECC71' :
                  stats.trend === 'decreasing' ? '#E74C3C' : COLORS.textGray
              }
            />
            <View style={styles.trendText}>
              <Text style={styles.trendValue}>
                {stats.trend === 'increasing' ? 'Increasing' :
                  stats.trend === 'decreasing' ? 'Decreasing' : 'Stable'}
              </Text>
              <Text style={styles.trendDescription}>
                {stats.trend === 'increasing' ? 'Values are trending upward' :
                  stats.trend === 'decreasing' ? 'Values are trending downward' :
                    'Values remain relatively stable'}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
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
    paddingTop: Platform.OS === 'android' ? 50 : 20,
    paddingBottom: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textGray,
    marginLeft: 12,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  sectionHeader: {
    marginTop: 28,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  chipContainer: {
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textGray,
    marginLeft: 8,
  },
  chipTextActive: {
    color: COLORS.white,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    marginHorizontal: 6,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  timeRangeActive: {
    backgroundColor: '#E8F8F5',
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textGray,
  },
  timeRangeTextActive: {
    color: COLORS.primary,
  },
  chartContainer: {
    flex: 1,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  chartLegend: {
    flexDirection: 'row',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.textGray,
    fontWeight: '500',
  },
  chartWrapper: {
    flexDirection: 'row',
  },
  yAxis: {
    width: 60,
    justifyContent: 'space-between',
    height: 180,
    paddingRight: 10,
  },
  yAxisLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
    textAlign: 'right',
  },
  chartArea: {
    flex: 1,
    height: 180,
    position: 'relative',
    marginLeft: 10,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.border,
  },
  chartPoints: {
    position: 'relative',
    height: 180,
  },
  dataPoint: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  valueLabel: {
    position: 'absolute',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  valueLabelText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  xAxis: {
    position: 'absolute',
    bottom: -30,
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  xAxisLabel: {
    position: 'absolute',
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 6,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  trendCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginLeft: 12,
  },
  trendContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    flex: 1,
    marginLeft: 16,
  },
  trendValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  trendDescription: {
    fontSize: 13,
    color: COLORS.textGray,
    lineHeight: 18,
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textGray,
    marginTop: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textGray,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default SensorHistory;
