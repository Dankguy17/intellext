import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import CustomHeader from '../components/CustomHeader';
import { apiClient } from '../utils/api';
import { NewQuiz } from '../types/Quiz';

const CreateCourseMaterial = () => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCreateCourseMaterial = async () => {
    try {
      if (!title.trim() || !description.trim()) {
        setError('Please fill in all fields');
        return;
      }

      const newCourseMaterial: NewQuiz = {
        title: title.trim(),
        description: description.trim(),
        questions: [{
          question: "Default Question",
          type: "multiple-choice",
          questionType: "multiple_choice",
          options: [
            { text: "Option 1", isCorrect: true },
            { text: "Option 2", isCorrect: false },
            { text: "Option 3", isCorrect: false },
            { text: "Option 4", isCorrect: false }
          ],
          explanation: "This is a default explanation",
          points: 1
        }],
        isPublished: false,
        mode: 'course_material',
        subject: 'General',
        difficulty: 'easy'
      };

      const response = await apiClient.createQuiz(newCourseMaterial);
      
      if (response && response.id) {
        router.push('/admin/quiz-list');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error creating course material:', error);
      setError(error instanceof Error ? error.message : 'Failed to create course material');
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Create Course Material" showBackButton />
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Create New Course Material</Text>
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter course material title"
            placeholderTextColor="#666"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter course material description"
            placeholderTextColor="#666"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateCourseMaterial}
        >
          <Text style={styles.buttonText}>Create Course Material</Text>
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
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 15,
    color: '#FFFFFF',
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  createButton: {
    backgroundColor: '#00BFA5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    marginBottom: 20,
  },
});

export default CreateCourseMaterial;
