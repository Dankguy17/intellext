import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { apiClient } from '../utils/api';
import { useAuth } from '../context/AuthContext';

interface CustomHeaderProps {
  title?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  isHome?: boolean;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({ 
  title, 
  showBackButton = true,
  showHomeButton = true,
  isHome = false
}) => {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <View style={styles.contentContainer}>
          <TouchableOpacity onPress={() => router.replace('/')} style={styles.logoContainer}>
            <Text style={styles.logoText}>IX</Text>
          </TouchableOpacity>

          {!isHome && (
            <>
              <View style={styles.verticalBar} />
              <View style={styles.titleContainer}>
                <Text style={styles.title}>{title}</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.rightSection}>
          {user ? (
            <>
              <Text style={styles.userEmail}>{user.email}</Text>
              <TouchableOpacity onPress={handleLogout} style={styles.authButton}>
                <Text style={styles.authButtonText}>Logout</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity 
                onPress={() => router.push('/auth/login')} 
                style={styles.authButton}
              >
                <Text style={styles.authButtonText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => router.push('/auth/signup')} 
                style={[styles.authButton, styles.signupButton]}
              >
                <Text style={styles.authButtonText}>Sign Up</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
      <View style={styles.headerBorder} />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#2A2E24',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    height: 64,
  },
  headerBorder: {
    height: 1,
    backgroundColor: '#3A3E34',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 4,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  verticalBar: {
    width: 2,
    height: 32,
    backgroundColor: '#3A3E34',
    marginHorizontal: 6,
  },
  titleContainer: {
    flex: 1,
    paddingLeft: 4,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userEmail: {
    color: '#9FA7B3',
    marginRight: 12,
  },
  authButton: {
    backgroundColor: '#5D7052',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginLeft: 8,
  },
  signupButton: {
    backgroundColor: '#7D9072',
  },
  authButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default CustomHeader;
