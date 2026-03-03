export const cropOptions = [
  'Rice',
  'Wheat',
  'Onion',
  'Cotton',
  'Maize',
  'Soybean',
  'Tomato',
  'Potato',
  'Bajra',
  'Sugarcane',
  'Chana (Gram)',
] as const;

export type CropName = (typeof cropOptions)[number];

export const stateOptions = [
  'Maharashtra',
  'Gujarat',
  'Punjab',
  'Madhya Pradesh',
  'Uttar Pradesh',
  'Rajasthan',
  'Haryana',
  'Karnataka',
  'Telangana',
  'Delhi',
] as const;

export type StateName = (typeof stateOptions)[number];

export type TimeRange = '7D' | '1M' | '6M' | '1Y';

export const mandiOptionsByState: Record<string, string[]> = {
  Maharashtra: ['Nagpur', 'Pune', 'Nashik', 'Aurangabad', 'Kolhapur', 'Solapur', 'Mumbai'],
  Gujarat: ['Rajkot', 'Ahmedabad', 'Surat', 'Vadodara', 'Bhavnagar', 'Jamnagar'],
  Punjab: ['Amritsar', 'Ludhiana', 'Jalandhar', 'Patiala', 'Bathinda'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain'],
  'Uttar Pradesh': ['Kanpur', 'Lucknow', 'Varanasi', 'Agra', 'Meerut'],
  Rajasthan: ['Kota', 'Jaipur', 'Ajmer', 'Alwar'],
  Haryana: ['Karnal', 'Hisar', 'Rohtak', 'Panipat'],
  Karnataka: ['Bengaluru', 'Mysuru', 'Hubli', 'Belagavi'],
  Telangana: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
  Delhi: ['Delhi'],
};

export const majorMandisByCrop: Record<string, string[]> = {
  Rice: ['Nagpur', 'Pune', 'Mumbai', 'Hyderabad', 'Indore', 'Ahmedabad', 'Delhi'],
  Wheat: ['Indore', 'Kota', 'Kanpur', 'Ludhiana', 'Bhopal'],
  Onion: ['Nashik', 'Pune', 'Ahmedabad', 'Indore', 'Hyderabad'],
  Cotton: ['Nagpur', 'Aurangabad', 'Rajkot', 'Hyderabad', 'Warangal'],
  Maize: ['Kota', 'Kanpur', 'Indore', 'Bengaluru', 'Hyderabad'],
  Soybean: ['Indore', 'Ujjain', 'Bhopal', 'Kota', 'Jaipur'],
  Tomato: ['Pune', 'Bengaluru', 'Hyderabad', 'Ahmedabad', 'Lucknow'],
  Potato: ['Kanpur', 'Lucknow', 'Agra', 'Indore', 'Jaipur'],
  Bajra: ['Kota', 'Jaipur', 'Hisar', 'Karnal', 'Indore'],
  Sugarcane: ['Meerut', 'Lucknow', 'Kanpur', 'Pune', 'Kolhapur'],
  'Chana (Gram)': ['Indore', 'Kota', 'Jaipur', 'Bhopal', 'Ludhiana'],
};

// For cross-state "major mandi" selections, map city -> state so the API receives a consistent state.
export const mandiToState: Record<string, StateName> = {
  Nagpur: 'Maharashtra',
  Pune: 'Maharashtra',
  Nashik: 'Maharashtra',
  Aurangabad: 'Maharashtra',
  Kolhapur: 'Maharashtra',
  Solapur: 'Maharashtra',
  Mumbai: 'Maharashtra',

  Rajkot: 'Gujarat',
  Ahmedabad: 'Gujarat',
  Surat: 'Gujarat',
  Vadodara: 'Gujarat',
  Bhavnagar: 'Gujarat',
  Jamnagar: 'Gujarat',

  Amritsar: 'Punjab',
  Ludhiana: 'Punjab',
  Jalandhar: 'Punjab',
  Patiala: 'Punjab',
  Bathinda: 'Punjab',

  Indore: 'Madhya Pradesh',
  Bhopal: 'Madhya Pradesh',
  Jabalpur: 'Madhya Pradesh',
  Gwalior: 'Madhya Pradesh',
  Ujjain: 'Madhya Pradesh',

  Kanpur: 'Uttar Pradesh',
  Lucknow: 'Uttar Pradesh',
  Varanasi: 'Uttar Pradesh',
  Agra: 'Uttar Pradesh',
  Meerut: 'Uttar Pradesh',

  Kota: 'Rajasthan',
  Jaipur: 'Rajasthan',
  Ajmer: 'Rajasthan',
  Alwar: 'Rajasthan',

  Karnal: 'Haryana',
  Hisar: 'Haryana',
  Rohtak: 'Haryana',
  Panipat: 'Haryana',

  Bengaluru: 'Karnataka',
  Mysuru: 'Karnataka',
  Hubli: 'Karnataka',
  Belagavi: 'Karnataka',

  Hyderabad: 'Telangana',
  Warangal: 'Telangana',
  Nizamabad: 'Telangana',
  Karimnagar: 'Telangana',

  Delhi: 'Delhi',
};

