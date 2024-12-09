import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import CustomHeader from '../components/CustomHeader';
import { apiClient } from '../utils/api';
import { Quiz } from '../types/Quiz';
import { QuizComponent } from '../components/QuizComponent';

const EditQuiz = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuiz();
  }, [id]);

  const loadQuiz = async () => {
    try {
      if (!id) {
        throw new Error('Quiz ID is required');
      }
      const quizData = await apiClient.getQuizById(id as string);
      setQuiz(quizData);
      setLoading(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load quiz');
      setLoading(false);
    }
  };

  const handleSave = async (updatedQuiz: Quiz) => {
    try {
      await apiClient.updateQuiz(id as string, updatedQuiz);
      router.push('/admin/quiz-list');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update quiz');
    }
  };

  if (loading || !quiz) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Edit Quiz" showBackButton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader title="Edit Quiz" showBackButton />
      <QuizComponent
        quiz={quiz}
        mode="quiz"
        isEditing={true}
        onSave={handleSave}
        onReturn={() => router.push('/admin/quiz-list')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  }
});

export default EditQuiz;
