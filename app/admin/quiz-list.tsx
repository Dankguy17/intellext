import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import CustomHeader from '../components/CustomHeader';
import { apiClient } from '../utils/api';

interface QuizAttempt {
  score: number;
  completedAt: string;
}

interface Quiz {
  _id: string;
  title: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: any[];
  createdAt: string;
  attempt?: QuizAttempt;
  mode: 'course_material' | 'quiz';
}

interface User {
  _id: string;
  role: 'user' | 'admin';
}

const QuizList = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadUserAndQuizzes();
  }, []);

  const loadUserAndQuizzes = async () => {
    try {
      const userData = await apiClient.getCurrentUser();
      setUser(userData);
      const quizData = await apiClient.getQuizzes();
      
      // If user is not admin, get quiz attempts
      if (userData.role !== 'admin') {
        const attempts = await apiClient.getQuizAttempts();
        const quizzesWithAttempts = quizData.map(quiz => ({
          ...quiz,
          attempt: attempts.find(a => a.quiz === quiz._id)
        }));
        setQuizzes(quizzesWithAttempts);
      } else {
        setQuizzes(quizData);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load data');
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const results = await apiClient.searchQuizzes(searchQuery);
      setQuizzes(results);
    } else {
      loadUserAndQuizzes();
    }
  };

  const handleDelete = async (id: string) => {
    await apiClient.deleteQuiz(id);
    await loadUserAndQuizzes();
  };

  const handleEditQuiz = (id: string) => {
    router.push(`/admin/edit-quiz?id=${id}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#f44336';
      default: return '#999';
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const renderQuizItem = ({ item }: { item: Quiz }) => (
    <View style={styles.quizCard}>
      <View style={styles.quizInfo}>
        <View style={styles.titleRow}>
          <Text style={styles.quizTitle}>{item.title}</Text>
          <View style={[
            styles.modeTag, 
            item.mode === 'course_material' ? styles.courseMaterialTag : styles.quizTag
          ]}>
            <Text style={styles.modeText}>
              {item.mode === 'course_material' ? 'Course Material' : 'Quiz'}
            </Text>
          </View>
        </View>
        <Text style={styles.quizSubject}>{item.subject}</Text>
        <Text style={[styles.quizDifficulty, { color: getDifficultyColor(item.difficulty) }]}>
          {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
        </Text>
        <Text style={styles.quizMeta}>
          {item.questions.length} questions • Created {formatDate(item.createdAt)}
        </Text>
        {item.attempt && (
          <View style={styles.attemptInfo}>
            <Text style={styles.scoreText}>Previous Score: {item.attempt.score}%</Text>
            <Text style={styles.attemptDate}>
              Completed: {formatDate(item.attempt.completedAt)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.quizActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.takeButton]}
          onPress={() => router.push(`/quiz/${item._id}`)}
        >
          <Text style={styles.actionButtonText}>
            {item.attempt ? 'Retake Quiz' : 'Take Quiz'}
          </Text>
        </TouchableOpacity>

        {user.role === 'admin' && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.editButton]} 
              onPress={() => handleEditQuiz(item._id)}
            >
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]} 
              onPress={() => handleDelete(item._id)}
            >
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Loading..." />
        <View style={styles.content}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader title="Quiz List" showBackButton={true} />
      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search quizzes..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>

        {user.role === 'admin' && (
          <Link href="/admin/quizzes" asChild>
            <TouchableOpacity style={styles.createButton}>
              <Text style={styles.createButtonText}>Create New Quiz</Text>
            </TouchableOpacity>
          </Link>
        )}

        <ScrollView style={styles.quizList}>
          {quizzes.map((quiz) => (
            renderQuizItem({ item: quiz })
          ))}
        </ScrollView>
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181C14',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 16,
    color: '#ffffff',
  },
  createButton: {
    backgroundColor: '#5D7052',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quizList: {
    flex: 1,
  },
  quizCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  quizInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  quizSubject: {
    color: '#ffffff',
    opacity: 0.8,
    marginBottom: 4,
  },
  quizDifficulty: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  quizMeta: {
    color: '#ffffff',
    opacity: 0.6,
    fontSize: 12,
    marginBottom: 8,
  },
  modeTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  courseMaterialTag: {
    backgroundColor: '#4CAF50',
  },
  quizTag: {
    backgroundColor: '#FF9800',
  },
  modeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  attemptInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  scoreText: {
    color: '#1865f2',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  attemptDate: {
    color: '#ffffff',
    opacity: 0.6,
    fontSize: 12,
  },
  quizActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    minWidth: 100,
    alignItems: 'center',
  },
  takeButton: {
    backgroundColor: '#1865f2',
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default QuizList;
