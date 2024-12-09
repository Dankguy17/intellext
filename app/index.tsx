import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import CustomHeader from './components/CustomHeader';
import { useAuth } from './context/AuthContext';

export default function Index() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <CustomHeader 
        isHome={true} 
        showBackButton={false}
        showHomeButton={false}
        title="Intellext"
      />
      
      <View style={styles.content}>
        <Image 
          source={require('../assets/images/ix.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Intellext</Text>
        <Text style={styles.subtitle}>Smart Learning Platform</Text>

        {user ? (
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => router.push('/admin/quiz-list')}
            >
              <Text style={styles.buttonText}>View Quizzes</Text>
            </TouchableOpacity>
            {user.role === 'admin' && (
              <TouchableOpacity 
                style={[styles.button, styles.createButton]} 
                onPress={() => router.push('/admin/')}
              >
                <Text style={styles.buttonText}>Admin</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => router.push('/auth/login')}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.signupButton]} 
              onPress={() => router.push('/auth/signup')}
            >
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
    tintColor: '#ffffff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    opacity: 0.8,
    marginBottom: 32,
    textAlign: 'center',
  },
  actionContainer: {
    gap: 16,
    width: '100%',
    maxWidth: 300,
  },
  button: {
    backgroundColor: '#1865f2',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  signupButton: {
    backgroundColor: '#4CAF50',
  },
  createButton: {
    backgroundColor: '#9c27b0',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
