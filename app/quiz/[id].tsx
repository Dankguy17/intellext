import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import CustomHeader from '../components/CustomHeader';
import { apiClient } from '../utils/api';
import { Quiz } from '../types/Quiz';
import { QuizComponent } from '../components/QuizComponent';

const QuizTaking = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizResults, setQuizResults] = useState<any>(null);

  useEffect(() => {
    loadQuiz();
  }, []);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const fetchedQuiz = await apiClient.getQuizById(params.id as string);
      
      if (!fetchedQuiz || !Array.isArray(fetchedQuiz.questions)) {
        throw new Error('Invalid quiz data received');
      }

      setQuiz(fetchedQuiz);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz');
      setLoading(false);
    }
  };

  const handleQuizComplete = (completedQuiz: any) => {
    setQuizResults(completedQuiz);
  };

  const handleReturnToList = () => {
    router.push('/admin/quiz-list');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Taking Quiz" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading quiz...</Text>
        </View>
      </View>
    );
  }

  if (error || !quiz) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Error" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Failed to load quiz'}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader title="Take Quiz" showBackButton onBackPress={handleReturnToList} />
      <QuizComponent
        quiz={quiz}
        mode="quiz"
        isEditing={false}
        onComplete={handleQuizComplete}
        onReturn={handleReturnToList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default QuizTaking;
