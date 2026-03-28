import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../theme/colors';

interface ProfileData {
  name: string;
  email: string;
  state: string;
  city: string;
}

interface ProfileDisplayProps {
  visible: boolean;
  onClose: () => void;
  profile: ProfileData | null;
  onEdit: () => void;
}

const ProfileDisplay: React.FC<ProfileDisplayProps> = ({
  visible,
  onClose,
  profile,
  onEdit,
}) => {
  console.log('ProfileDisplay modal visible:', visible);
  console.log('Profile data:', profile);
  
  if (!profile) {
    console.log('No profile data provided');
    return null;
  }

  const handleEditProfile = () => {
    onClose();
    onEdit();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={false}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Icon name="account-circle" size={60} color={COLORS.primary} />
              </View>
              <Text style={styles.profileName}>{profile.name}</Text>
              <Text style={styles.profileEmail}>{profile.email}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={24} color={COLORS.textDark} />
            </TouchableOpacity>
          </View>

          {/* Profile Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailSection}>
              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Icon name="map-marker" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>{profile.city}, {profile.state}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Icon name="email" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailValue}>{profile.email}</Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Icon name="account" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Full Name</Text>
                  <Text style={styles.detailValue}>{profile.name}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
              <Icon name="pencil" size={18} color={COLORS.white} />
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  profileHeader: {
    flex: 1,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 12,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: COLORS.textGray,
  },
  closeButton: {
    padding: 4,
  },
  detailsContainer: {
    flex: 1,
    padding: 24,
  },
  detailSection: {
    gap: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textGray,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: '500',
  },
  actionsContainer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.white,
  },
});

export default ProfileDisplay;
