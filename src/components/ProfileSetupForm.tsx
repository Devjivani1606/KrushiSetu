import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../theme/colors';
import { stateOptions } from '../config/mandi.config';

interface ProfileSetupFormProps {
  visible: boolean;
  onClose: () => void;
  onSave: (profileData: ProfileData) => void;
  initialEmail: string;
}

interface ProfileData {
  name: string;
  email: string;
  state: string;
  city: string;
}

const ProfileSetupForm: React.FC<ProfileSetupFormProps> = ({
  visible,
  onClose,
  onSave,
  initialEmail,
}) => {
  const [name, setName] = useState('');
  const [email] = useState(initialEmail);
  const [selectedState, setSelectedState] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-fetch city data when city changes
  const handleCityChange = async (cityName: string) => {
    setCity(cityName);
  };

  const handleStateSelect = (state: string) => {
    setSelectedState(state);
    setShowStateModal(false);
  };

  const renderStateModal = () => {
    console.log('State options available:', stateOptions);
    console.log('State options length:', stateOptions.length);
    
    // Filter states based on search query
    const filteredStates = stateOptions.filter(state =>
      state.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return (
      <Modal
        visible={showStateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowStateModal(false);
          setSearchQuery(''); // Clear search on close
        }}
      >
        <View style={styles.stateModalOverlay}>
          <View style={styles.stateModalContent}>
            <View style={styles.stateModalHeader}>
              <Text style={styles.stateModalTitle}>Select State</Text>
              <TouchableOpacity onPress={() => setShowStateModal(false)}>
                <Icon name="close" size={24} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            
            {/* Done Button */}
            <TouchableOpacity 
              style={styles.doneButton}
              onPress={() => {
                console.log('Done button clicked, selected state:', selectedState);
                setShowStateModal(false);
              }}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
            
            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Icon name="magnify" size={20} color={COLORS.textGray} />
              <TextInput
                style={styles.searchInput}
                placeholder="Type to search state..."
                placeholderTextColor={COLORS.textGray}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            
            <ScrollView style={styles.stateListContainer}>
              {filteredStates.map((state) => {
                console.log('Rendering state:', state);
                return (
                  <TouchableOpacity
                    key={state}
                    style={styles.stateOption}
                    onPress={() => handleStateSelect(state)}
                  >
                    <Text style={styles.stateOptionText}>{state}</Text>
                    {selectedState === state && (
                      <Icon name="check" size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
              
              {/* No results message */}
              {filteredStates.length === 0 && (
                <View style={styles.noResultsContainer}>
                  <Icon name="alert-circle" size={24} color={COLORS.textGray} />
                  <Text style={styles.noResultsText}>No states found</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const handleSave = async () => {
    console.log('Save clicked - Current form data:', { name, selectedState, city });
    
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!selectedState) {
      Alert.alert('Error', 'Please select your state');
      return;
    }
    if (!city.trim()) {
      Alert.alert('Error', 'Please enter your city');
      return;
    }

    setLoading(true);
    
    try {
      const profileData: ProfileData = {
        name: name.trim(),
        email,
        state: selectedState,
        city: city.trim(),
      };
      
      await onSave(profileData);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Icon name="account-circle" size={32} color={COLORS.primary} />
              <Text style={styles.title}>Complete Your Profile</Text>
              <Text style={styles.subtitle}>Tell us about yourself</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            {/* Email (Read-only) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.readOnlyInput}>
                <Icon name="email" size={20} color={COLORS.textGray} />
                <Text style={styles.readOnlyText}>{email}</Text>
              </View>
            </View>

            {/* Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <View style={styles.inputContainer}>
                <Icon name="account" size={20} color={COLORS.textGray} />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  placeholderTextColor={COLORS.textGray}
                />
              </View>
            </View>

            {/* State */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>State *</Text>
              <View style={styles.inputContainer}>
                <Icon name="map-marker" size={20} color={COLORS.textGray} />
                <TextInput
                  style={styles.input}
                  value={selectedState}
                  onChangeText={setSelectedState}
                  placeholder="Enter your state manually"
                  placeholderTextColor={COLORS.textGray}
                />
              </View>
            </View>

            {/* City */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>City *</Text>
              <View style={styles.inputContainer}>
                <Icon name="city" size={20} color={COLORS.textGray} />
                <TextInput
                  style={styles.input}
                  value={city}
                  onChangeText={handleCityChange}
                  placeholder="Enter your city"
                  placeholderTextColor={COLORS.textGray}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.saveButton, loading && styles.disabledButton]} 
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <Text style={styles.saveButtonText}>Saving...</Text>
              ) : (
                <>
                  <Icon name="check" size={20} color={COLORS.white} />
                  <Text style={styles.saveButtonText}>Save Profile</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* State Selection Modal */}
      {renderStateModal()}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textGray,
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textDark,
    marginLeft: 12,
    paddingVertical: 12,
  },
  readOnlyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  readOnlyText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textGray,
    marginLeft: 12,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'space-between',
  },
  selectText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textDark,
    marginLeft: 12,
  },
  placeholderText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textGray,
    marginLeft: 12,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: COLORS.textGray,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.white,
  },
  // State Modal Styles
  stateModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stateModalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    width: '90%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  stateModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stateModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  stateListContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  stateOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stateOptionText: {
    fontSize: 16,
    color: COLORS.textDark,
    flex: 1,
  },
  // Search Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textDark,
    marginLeft: 12,
  },
  noResultsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  noResultsText: {
    fontSize: 16,
    color: COLORS.textGray,
    marginLeft: 12,
  },
  dataIndicator: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -8,
  },
  doneButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.white,
  },
});

export default ProfileSetupForm;
