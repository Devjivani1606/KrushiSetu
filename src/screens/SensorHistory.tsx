import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MIcon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../theme/colors';

const { width } = Dimensions.get('window');

interface ChartDataPoint {
  time: string;
  value: number;
}

const SensorHistory = ({ navigation }: any) => {
  const [selectedSensor, setSelectedSensor] = useState('Moisture');
  const [selectedRange, setSelectedRange] = useState('7 Days');
  const [selectedDevice, setSelectedDevice] = useState('KS-GW-Alpha');

  const sensorTypes = ['Moisture', 'Temperature', 'Humidity', 'Soil pH'];
  const timeRanges = ['Today', '7 Days', '30 Days'];

  // Mock data for chart
  const chartData: ChartDataPoint[] = [
    { time: '00:00', value: 45 },
    { time: '04:00', value: 42 },
    { time: '08:00', value: 38 },
    { time: '12:00', value: 35 },
    { time: '16:00', value: 40 },
    { time: '20:00', value: 43 },
    { time: '24:00', value: 46 },
  ];

  const stats = {
    average: selectedSensor === 'Moisture' ? '41.2%' : '28.5°C',
    minimum: selectedSensor === 'Moisture' ? '35%' : '22°C',
    maximum: selectedSensor === 'Moisture' ? '46%' : '35°C',
  };

  // Simple line chart visualization
  const renderChart = () => {
    const maxValue = Math.max(...chartData.map(d => d.value));
    const minValue = Math.min(...chartData.map(d => d.value));
    const range = maxValue - minValue;
    const chartHeight = 200;
    const chartWidth = width - 80;
    const pointSpacing = chartWidth / (chartData.length - 1);

    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartWrapper}>
          {/* Y-axis labels */}
          <View style={styles.yAxis}>
            <Text style={styles.yAxisLabel}>{maxValue}</Text>
            <Text style={styles.yAxisLabel}>{Math.round((maxValue + minValue) / 2)}</Text>
            <Text style={styles.yAxisLabel}>{minValue}</Text>
          </View>

          {/* Chart area */}
          <View style={styles.chartArea}>
            {/* Grid lines */}
            <View style={styles.gridLine} />
            <View style={[styles.gridLine, { top: '50%' }]} />
            <View style={[styles.gridLine, { top: '100%' }]} />

            {/* Data points and line */}
            <View style={styles.chartPoints}>
              {chartData.map((point, index) => {
                const x = index * pointSpacing;
                const y = chartHeight - ((point.value - minValue) / range) * chartHeight;

                return (
                  <View key={index}>
                    {/* Connect line to previous point */}
                    {index > 0 && (
                      <View
                        style={{
                          position: 'absolute',
                          left: (index - 1) * pointSpacing,
                          top: chartHeight - ((chartData[index - 1].value - minValue) / range) * chartHeight,
                          width: pointSpacing,
                          height: 3,
                          backgroundColor: COLORS.primary,
                          transform: [
                            {
                              rotate: `${Math.atan2(
                                y - (chartHeight - ((chartData[index - 1].value - minValue) / range) * chartHeight),
                                pointSpacing
                              )}rad`,
                            },
                          ],
                        }}
                      />
                    )}

                    {/* Data point */}
                    <View
                      style={[
                        styles.dataPoint,
                        {
                          left: x - 6,
                          top: y - 6,
                        },
                      ]}
                    />

                    {/* Value label on hover point */}
                    {index % 2 === 0 && (
                      <View style={[styles.valueLabel, { left: x - 20, top: y - 35 }]}>
                        <Text style={styles.valueLabelText}>{point.value}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            {/* X-axis labels */}
            <View style={styles.xAxis}>
              {chartData.map((point, index) => (
                <Text key={index} style={[styles.xAxisLabel, { left: index * pointSpacing - 15 }]}>
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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MIcon name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sensor History</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Device Selector */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="devices" size={20} color={COLORS.textGray} />
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

        {/* Chart */}
        {renderChart()}

        {/* Summary Stats */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Summary</Text>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Icon name="chart-line" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.statLabel}>Average</Text>
            <Text style={styles.statValue}>{stats.average}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Icon name="arrow-down" size={24} color="#E74C3C" />
            </View>
            <Text style={styles.statLabel}>Minimum</Text>
            <Text style={styles.statValue}>{stats.minimum}</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Icon name="arrow-up" size={24} color="#2ECC71" />
            </View>
            <Text style={styles.statLabel}>Maximum</Text>
            <Text style={styles.statValue}>{stats.maximum}</Text>
          </View>
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
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textGray,
    marginLeft: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 12,
  },
  selectorText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  chipContainer: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textGray,
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
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeRangeActive: {
    backgroundColor: '#E8F8F5',
    borderColor: COLORS.primary,
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
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartWrapper: {
    flexDirection: 'row',
  },
  yAxis: {
    width: 40,
    justifyContent: 'space-between',
    height: 200,
  },
  yAxisLabel: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  chartArea: {
    flex: 1,
    height: 200,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.border,
    top: 0,
  },
  chartPoints: {
    position: 'relative',
    height: 200,
  },
  dataPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: COLORS.white,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  valueLabel: {
    position: 'absolute',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  valueLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  xAxis: {
    position: 'absolute',
    bottom: -25,
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
    marginTop: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
});

export default SensorHistory;
