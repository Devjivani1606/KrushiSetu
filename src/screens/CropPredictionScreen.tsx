import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../theme/colors';

// ✅ Put your laptop IP here (same as ifconfig inet)
const CONFIG = { API_BASE_URL: 'http://10.179.107.150:8000' };

type Top3Item = { crop: string; confidence: number | null };

const CropPredictionScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [isPredicting, setIsPredicting] = useState(false);

  const [inputN, setInputN] = useState('90');
  const [inputP, setInputP] = useState('42');
  const [inputK, setInputK] = useState('43');
  const [inputPH, setInputPH] = useState('6.5'); // ✅ ph
  const [inputTemperature, setInputTemperature] = useState('20.8');
  const [inputHumidity, setInputHumidity] = useState('82');

  const [resultText, setResultText] = useState<string | null>(null);
  const [top3, setTop3] = useState<Top3Item[] | null>(null);

  const API_URL = CONFIG.API_BASE_URL;

  const toNum = (v: string) => {
    const s = String(v).trim();
    if (s === '') return NaN;
    return Number(s);
  };

  const fillTestValuesRice = () => {
    setInputN('90');
    setInputP('42');
    setInputK('43');
    setInputPH('6.5');
    setInputTemperature('20.8');
    setInputHumidity('82');
  };

  const fillTestValuesCotton = () => {
    setInputN('120');
    setInputP('60');
    setInputK('55');
    setInputPH('6.8');
    setInputTemperature('30');
    setInputHumidity('60');
  };

  const handlePredictCrop = async () => {
    const N = toNum(inputN);
    const P = toNum(inputP);
    const K = toNum(inputK);
    const ph = toNum(inputPH);
    const temperature = toNum(inputTemperature);
    const humidity = toNum(inputHumidity);

    if ([N, P, K, ph, temperature, humidity].some((x) => Number.isNaN(x))) {
      Alert.alert('Invalid input', 'Please enter numeric values in all fields.');
      return;
    }

    setIsPredicting(true);
    setResultText(null);
    setTop3(null);

    // ✅ payload MUST match backend CropInput
    const payload = { N, P, K, ph, temperature, humidity };

    try {
      console.log('➡️ Sending payload:', payload);

      const res = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log('⬅️ Raw response:', text);

      if (!res.ok) {
        throw new Error(`API ${res.status}: ${text}`);
      }

      const data = JSON.parse(text);

      const crop = data?.recommended_crop;
      const confidence = data?.confidence;
      const top3Resp = data?.top3;

      if (!crop) throw new Error('No recommended_crop in response');

      if (typeof confidence === 'number') {
        setResultText(`${crop} (${(confidence * 100).toFixed(1)}%)`);
      } else {
        setResultText(`${crop}`);
      }

      if (Array.isArray(top3Resp)) {
        setTop3(top3Resp);
      }
    } catch (err: any) {
      const msg = err?.message || String(err);

      if (
        msg.includes('Network request failed') ||
        msg.includes('Failed to fetch') ||
        msg.includes('NetworkError')
      ) {
        Alert.alert(
          'Backend not reachable',
          `Backend not reachable.\n\n1) Check IP: ${API_URL}\n2) Ensure uvicorn is running\n3) Same WiFi/Hotspot`
        );
      } else {
        Alert.alert('Prediction error', msg);
      }
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crop Prediction</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SOIL & ENVIRONMENT (Inputs)</Text>

          <View style={styles.dataCard}>
            <Text style={styles.inputLabel}>Nitrogen (N)</Text>
            <TextInput style={styles.input} value={inputN} onChangeText={setInputN} keyboardType="numeric" />

            <Text style={styles.inputLabel}>Phosphorus (P)</Text>
            <TextInput style={styles.input} value={inputP} onChangeText={setInputP} keyboardType="numeric" />

            <Text style={styles.inputLabel}>Potassium (K)</Text>
            <TextInput style={styles.input} value={inputK} onChangeText={setInputK} keyboardType="numeric" />

            <Text style={styles.inputLabel}>pH (ph)</Text>
            <TextInput style={styles.input} value={inputPH} onChangeText={setInputPH} keyboardType="numeric" />

            <Text style={styles.inputLabel}>Temperature (°C)</Text>
            <TextInput style={styles.input} value={inputTemperature} onChangeText={setInputTemperature} keyboardType="numeric" />

            <Text style={styles.inputLabel}>Humidity (%)</Text>
            <TextInput style={styles.input} value={inputHumidity} onChangeText={setInputHumidity} keyboardType="numeric" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={[styles.smallBtn, { backgroundColor: '#6C757D' }]}
              onPress={fillTestValuesRice}
              disabled={isPredicting}
            >
              <Text style={styles.smallBtnText}>Rice Test</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.smallBtn, { backgroundColor: '#6C757D' }]}
              onPress={fillTestValuesCotton}
              disabled={isPredicting}
            >
              <Text style={styles.smallBtnText}>Cotton Test</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.predictButton, isPredicting && styles.predictButtonDisabled]}
          onPress={handlePredictCrop}
          disabled={isPredicting}
        >
          {isPredicting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="magic-staff" size={20} color="#fff" />
              <Text style={styles.predictButtonText}>Predict Best Crop</Text>
            </>
          )}
        </TouchableOpacity>

        {resultText && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PREDICTION</Text>
            <View style={styles.recommendationCard}>
              <Text style={[styles.cropName, { textAlign: 'center' }]}>{resultText}</Text>

              {top3 && top3.length > 0 && (
                <View style={{ marginTop: 12 }}>
                  <Text style={{ fontWeight: '700', marginBottom: 6, color: COLORS.textDark }}>
                    Top 3 Suggestions
                  </Text>

                  {top3.map((t, idx) => (
                    <Text key={idx} style={{ color: COLORS.textLight, marginBottom: 4 }}>
                      {idx + 1}. {t.crop}
                      {typeof t.confidence === 'number' ? ` (${(t.confidence * 100).toFixed(1)}%)` : ''}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textDark },

  content: { flex: 1, paddingHorizontal: 20 },

  section: { marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, marginBottom: 12 },

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

  inputLabel: { fontSize: 13, color: COLORS.textLight, marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    color: COLORS.textDark,
  },

  smallBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallBtnText: { color: '#fff', fontWeight: '700' },

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
  predictButtonDisabled: { backgroundColor: COLORS.textLight, shadowOpacity: 0 },

  predictButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },

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
  cropName: { fontSize: 20, fontWeight: '700', color: COLORS.textDark },
});

export default CropPredictionScreen;
