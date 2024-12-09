import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { apiClient } from '../../../utils/api';
import { Course, NewCourse } from '../../../types/Course';
import CustomHeader from '../../../components/CustomHeader';
import { Dropdown } from 'react-native-element-dropdown';

const EditCourse = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
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

  useEffect(() => {
    loadCourse();
  }, []);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const course = await apiClient.getCourseById(params.id as string);
      setFormData({
        title: course.title,
        description: course.description,
        subject: course.subject,
        level: course.level,
        topics: course.topics,
        isPublished: course.isPublished,
        quizzes: course.quizzes,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate required fields
      if (!formData.title || !formData.description || !formData.subject || !formData.level) {
        throw new Error('Please fill in all required fields');
      }

      await apiClient.updateCourse(params.id as string, formData);
      router.push('/admin/courses');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          header: () => <CustomHeader title="Edit Course" />,
        }}
      />

      <ScrollView style={styles.form}>
        <Text style={styles.title}>Edit Course</Text>

        {error && (
          <Text style={styles.error}>{error}</Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="Course Title"
          placeholderTextColor="#666"
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Course Description"
          placeholderTextColor="#666"
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          multiline
          numberOfLines={4}
        />

        <View style={styles.dropdownContainer}>
          <Text style={styles.label}>Subject</Text>
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
          <Text style={styles.label}>Level</Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownSelectedText}
            data={levels}
            labelField="label"
            valueField="value"
            value={formData.level}
            onChange={item => setFormData({ ...formData, level: item.value })}
            placeholder="Select Level"
          />
        </View>

        <TextInput
          style={styles.input}
          placeholder="Topics (comma-separated)"
          placeholderTextColor="#666"
          value={formData.topics.join(', ')}
          onChangeText={(text) => setFormData({ 
            ...formData, 
            topics: text.split(',').map(t => t.trim()).filter(t => t)
          })}
        />

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Updating...' : 'Update Course'}
          </Text>
        </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#FFFFFF',
  },
  label: {
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdown: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
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
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  error: {
    color: '#FF6B6B',
    marginBottom: 16,
  },
});

export default EditCourse;
