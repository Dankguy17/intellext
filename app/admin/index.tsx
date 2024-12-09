import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import CustomHeader from '../components/CustomHeader';

const AdminPanel = () => {
  return (
    <View style={{ flex: 1, backgroundColor: '#181C14' }}>
      <CustomHeader title="Admin Panel" showBackButton={true} />
      <View style={styles.container}>
        <Text style={styles.title}>Admin Panel</Text>
        <View style={styles.menuGrid}>
          <Link href="/admin/quiz-list" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuIcon}>📝</Text>
              <Text style={styles.menuText}>Manage Quizzes</Text>
            </TouchableOpacity>
          </Link>
          
          <Link href="/admin/create-quiz" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuIcon}>➕</Text>
              <Text style={styles.menuText}>Create Quiz</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/admin/create-course" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuIcon}>📚</Text>
              <Text style={styles.menuText}>Create Course Material</Text>
            </TouchableOpacity>
          </Link>
          
          <TouchableOpacity style={[styles.menuItem, styles.comingSoon]}>
            <Text style={styles.menuIcon}>📊</Text>
            <Text style={styles.menuText}>Analytics</Text>
            <Text style={styles.comingSoonText}>Coming Soon</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.menuItem, styles.comingSoon]}>
            <Text style={styles.menuIcon}>👥</Text>
            <Text style={styles.menuText}>User Management</Text>
            <Text style={styles.comingSoonText}>Coming Soon</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.menuItem, styles.comingSoon]}>
            <Text style={styles.menuIcon}>⚙️</Text>
            <Text style={styles.menuText}>Settings</Text>
            <Text style={styles.comingSoonText}>Coming Soon</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3F4E4F',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  menuGrid: {
    flexDirection: 'column',
    width: '100%',
  },
  menuItem: {
    backgroundColor: '#2C3639',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    height: 70,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  menuText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  comingSoon: {
    opacity: 0.7,
  },
  comingSoonText: {
    color: '#ffffff',
    fontSize: 12,
    opacity: 0.7,
  },
});

export default AdminPanel;
