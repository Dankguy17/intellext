import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  QUIZZES: '@intellext/quizzes',
};

export interface Choice {
  id: string;
  text: string;
  unit?: string;
}

export interface QuestionBase {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank';
  question: string;
  explanation?: string;
}

export interface MultipleChoiceQuestion extends QuestionBase {
  type: 'multiple-choice';
  choices: Choice[];
  correctAnswerId: string;
}

export interface TrueFalseQuestion extends QuestionBase {
  type: 'true-false';
  correctAnswer: boolean;
}

export interface FillBlankQuestion extends QuestionBase {
  type: 'fill-blank';
  correctAnswer: string;
  acceptableAnswers?: string[]; // Alternative correct answers
  caseSensitive?: boolean;
}

export type Question = MultipleChoiceQuestion | TrueFalseQuestion | FillBlankQuestion;

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  description?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: Question[];
  createdAt: number;
  updatedAt: number;
}

export interface QuizMetadata {
  id: string;
  title: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  createdAt: number;
  updatedAt: number;
}

class QuizStorage {
  private static instance: QuizStorage;

  private constructor() {}

  public static getInstance(): QuizStorage {
    if (!QuizStorage.instance) {
      QuizStorage.instance = new QuizStorage();
    }
    return QuizStorage.instance;
  }

  async getAllQuizzes(): Promise<Quiz[]> {
    try {
      const quizzesJson = await AsyncStorage.getItem(STORAGE_KEYS.QUIZZES);
      return quizzesJson ? JSON.parse(quizzesJson) : [];
    } catch (error) {
      console.error('Error getting quizzes:', error);
      return [];
    }
  }

  async getQuizMetadata(): Promise<QuizMetadata[]> {
    const quizzes = await this.getAllQuizzes();
    return quizzes.map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      subject: quiz.subject,
      difficulty: quiz.difficulty,
      questionCount: quiz.questions.length,
      createdAt: quiz.createdAt,
      updatedAt: quiz.updatedAt,
    }));
  }

  async getQuizById(id: string): Promise<Quiz | null> {
    const quizzes = await this.getAllQuizzes();
    return quizzes.find(quiz => quiz.id === id) || null;
  }

  async saveQuiz(quiz: Quiz): Promise<void> {
    try {
      const quizzes = await this.getAllQuizzes();
      const existingIndex = quizzes.findIndex(q => q.id === quiz.id);
      
      if (existingIndex >= 0) {
        // Update existing quiz
        quizzes[existingIndex] = {
          ...quiz,
          updatedAt: Date.now(),
        };
      } else {
        // Add new quiz
        quizzes.push({
          ...quiz,
          id: quiz.id || Math.random().toString(36).substr(2, 9),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      await AsyncStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
    } catch (error) {
      console.error('Error saving quiz:', error);
      throw error;
    }
  }

  async deleteQuiz(id: string): Promise<void> {
    try {
      const quizzes = await this.getAllQuizzes();
      const updatedQuizzes = quizzes.filter(quiz => quiz.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(updatedQuizzes));
    } catch (error) {
      console.error('Error deleting quiz:', error);
      throw error;
    }
  }

  async searchQuizzes(query: string): Promise<QuizMetadata[]> {
    const quizzes = await this.getAllQuizzes();
    const searchTerm = query.toLowerCase();
    
    return quizzes
      .filter(quiz => 
        quiz.title.toLowerCase().includes(searchTerm) ||
        quiz.subject.toLowerCase().includes(searchTerm) ||
        quiz.description?.toLowerCase().includes(searchTerm)
      )
      .map(quiz => ({
        id: quiz.id,
        title: quiz.title,
        subject: quiz.subject,
        difficulty: quiz.difficulty,
        questionCount: quiz.questions.length,
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt,
      }));
  }
}

export const quizStorage = QuizStorage.getInstance();
