import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { TextInput, Button, Text } from 'react-native-paper';
import { apiClient } from '../../utils/api';
import { NewCourse } from '../../types/Course';
import CustomHeader from '../../components/CustomHeader';
import { Dropdown } from 'react-native-element-dropdown';

const CreateCourse = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<NewCourse>({
    title: '',
    description: '',
    subject: '',
    level: 'beginner',
    topics: [],
    isPublished: false,
  });

  const levels = [
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Advanced', value: 'advanced' },
  ];

  const subjects = [
    { label: 'Physics', value: 'physics' },
    { label: 'Mathematics', value: 'mathematics' },
    { label: 'Chemistry', value: 'chemistry' },
    { label: 'Biology', value: 'biology' },
  ];

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!formData.title || !formData.description || !formData.subject || !formData.level) {
        throw new Error('Please fill in all required fields');
      }

      await apiClient.createCourse(formData);
      router.push('/admin/courses');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          header: () => <CustomHeader title="Create Course" />,
        }}
      />

      <ScrollView style={styles.form}>
        <Text variant="headlineMedium" style={styles.title}>Create New Course</Text>

        {error && (
          <Text variant="bodyMedium" style={styles.error}>{error}</Text>
        )}

        <TextInput
          mode="outlined"
          label="Course Title"
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
          style={styles.input}
          theme={{ colors: { primary: '#007AFF' } }}
        />

        <TextInput
          mode="outlined"
          label="Course Description"
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          multiline
          numberOfLines={4}
          style={[styles.input, styles.textArea]}
          theme={{ colors: { primary: '#007AFF' } }}
        />

        <View style={styles.dropdownContainer}>
          <Text variant="bodyMedium" style={styles.label}>Subject</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownSelectedText}
            data={subjects}
            labelField="label"
            valueField="value"
            value={formData.subject}
            onChange={item => setFormData({ ...formData, subject: item.value })}
            placeholder="Select Subject"
          />
        </View>

        <View style={styles.dropdownContainer}>
          <Text variant="bodyMedium" style={styles.label}>Level</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownSelectedText}
            data={levels}
            labelField="label"
            valueField="value"
            value={formData.level}
            onChange={item => setFormData({ ...formData, level: item.value as 'beginner' | 'intermediate' | 'advanced' })}
            placeholder="Select Level"
          />
        </View>

        <TextInput
          mode="outlined"
          label="Topics (comma-separated)"
          value={formData.topics.join(', ')}
          onChangeText={(text) => setFormData({ 
            ...formData, 
            topics: text.split(',').map(t => t.trim()).filter(t => t)
          })}
          style={styles.input}
          theme={{ colors: { primary: '#007AFF' } }}
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          Create Course
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  form: {
    padding: 20,
  },
  title: {
    marginBottom: 20,
    color: '#FFFFFF',
  },
  label: {
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#2A2A2A',
  },
  textArea: {
    height: 100,
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdown: {
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
    padding: 12,
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  dropdownPlaceholder: {
    color: '#666',
  },
  dropdownSelectedText: {
    color: '#FFFFFF',
  },
  button: {
    marginTop: 20,
    padding: 8,
    backgroundColor: '#007AFF',
  },
  error: {
    color: '#FF6B6B',
    marginBottom: 16,
  },
});

export default CreateCourse;
