import AsyncStorage from '@react-native-async-storage/async-storage';
import { Quiz, NewQuiz, QuizAttempt, Course, NewCourse, CourseProgress } from '../types/Quiz';
import { generateQuestion } from './questionGenerators';

interface LoginResponse {
  token: string;
  user: {
    _id: string;
    email: string;
    role: 'user' | 'admin';
  };
}

class ApiClient {
  private baseUrl = 'http://localhost:3000/api';
  private token: string | null = null;

  constructor() {
    this.loadToken();
  }

  private async loadToken() {
    try {
      this.token = await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Failed to load token:', error);
    }
  }

  private async getHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    this.token = data.token;
    await AsyncStorage.setItem('token', data.token);
    return data;
  }

  async signup(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }

    const data = await response.json();
    this.token = data.token;
    await AsyncStorage.setItem('token', data.token);
    return data;
  }

  async register(email: string, password: string, name: string, isAdmin: boolean = false): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name, isAdmin }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to register');
    }

    const data = await response.json();
    this.token = data.token;
    await AsyncStorage.setItem('token', data.token);
    return data;
  }

  async logout(): Promise<void> {
    this.token = null;
    await AsyncStorage.removeItem('token');
  }

  async getCurrentUser() {
    const response = await fetch(`${this.baseUrl}/auth/me`, {
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to get current user');
    }

    return response.json();
  }

  async getQuizzes(): Promise<Quiz[]> {
    const response = await fetch(`${this.baseUrl}/quizzes`, {
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch quizzes');
    }

    return response.json();
  }

  async createQuiz(quiz: NewQuiz): Promise<Quiz> {
    console.log('Creating quiz with data:', JSON.stringify(quiz, null, 2));
    const response = await fetch(`${this.baseUrl}/quizzes`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify(quiz),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Server error response:', errorData);
      console.error('Response status:', response.status);
      console.error('Response statusText:', response.statusText);
      throw new Error(errorData?.error || errorData?.message || 'Failed to create quiz');
    }

    const data = await response.json();
    console.log('Server response:', data);

    // Transform server response to match client Quiz type
    return {
      id: data._id,
      title: data.title || '',
      description: data.description || '',
      questions: Array.isArray(data.questions) ? data.questions.map((q: any) => ({
        id: q._id || '',
        question: q.question || '',
        type: q.type || 'multiple-choice',
        questionType: q.questionType || 'multiple_choice',
        options: Array.isArray(q.options) ? q.options : [],
        explanation: q.explanation || '',
        points: q.points || 1
      })) : [],
      isPublished: Boolean(data.isPublished),
      mode: data.mode || 'course_material',
      subject: data.subject || 'General',
      difficulty: data.difficulty || 'easy',
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString()
    };
  }

  async getQuizById(id: string): Promise<Quiz> {
    const response = await fetch(`${this.baseUrl}/quizzes/${id}`, {
      method: 'GET',
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch quiz');
    }

    const data = await response.json();
    
    if (!data || !data.questions) {
      throw new Error('Invalid quiz data received from server');
    }
    
    // Transform server response to match client Quiz type
    const transformedQuiz = {
      id: data._id,
      title: data.title || '',
      description: data.description || '',
      questions: Array.isArray(data.questions) ? data.questions.map((q: any) => {
        // Handle dynamic questions
        if (q.type === 'dynamic' && q.generator) {
          const generatedQ = generateQuestion(q.generator, q.generatorParams || {});
          return {
            ...generatedQ,
            id: q._id || q.id || generatedQ.id,
          };
        }
        
        // Handle static questions
        return {
          id: q._id || q.id || '',
          question: q.question || '',
          type: q.type || 'static',
          questionType: q.questionType || 'multiple_choice',
          options: Array.isArray(q.options) ? q.options : 
                  Array.isArray(q.choices) ? q.choices.map((c: any) => c.text || '') : [],
          correctAnswer: q.correctAnswer || q.correctAnswerId || '',
          generator: q.generator,
          generatorParams: q.generatorParams || {},
          explanation: q.explanation
        };
      }) : [],
      isPublished: Boolean(data.isPublished),
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
      isDynamic: Array.isArray(data.questions) ? data.questions.some((q: any) => q.type === 'dynamic') : false
    };
    
    return transformedQuiz;
  }

  async updateQuiz(id: string, quiz: Partial<Quiz>): Promise<Quiz> {
    // Transform the quiz data to match server expectations
    const serverQuiz = {
      title: quiz.title,
      description: quiz.description,
      questions: quiz.questions?.map(q => ({
        _id: q.id, // Keep the original _id if it exists
        question: q.question,
        type: q.type || 'static',
        questionType: q.questionType || 'multiple_choice',
        choices: q.options?.map(option => ({ text: option })), // Transform options to choices array with text property
        correctAnswerId: q.correctAnswer,
        generator: q.generator,
        generatorParams: q.generatorParams,
        explanation: q.explanation
      })),
      isPublished: quiz.isPublished,
      mode: quiz.mode || 'quiz',
      subject: quiz.subject,
      difficulty: quiz.difficulty,
      courseId: quiz.courseId
    };

    const response = await fetch(`${this.baseUrl}/quizzes/${id}`, {
      method: 'PATCH',
      headers: await this.getHeaders(),
      body: JSON.stringify(serverQuiz)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Failed to update quiz:', errorData);
      throw new Error(errorData?.message || 'Failed to update quiz');
    }

    const data = await response.json();
    return this.transformQuizResponse(data);
  }

  private transformQuizResponse(data: any): Quiz {
    if (!data || !data.questions) {
      throw new Error('Invalid quiz data received from server');
    }
    
    return {
      id: data._id,
      title: data.title || '',
      description: data.description || '',
      questions: Array.isArray(data.questions) ? data.questions.map((q: any) => ({
        id: q._id || q.id || '',
        question: q.question || '',
        type: q.type || 'static',
        questionType: q.questionType || 'multiple_choice',
        options: Array.isArray(q.options) ? q.options : 
                Array.isArray(q.choices) ? q.choices.map((c: any) => c.text || '') : [],
        correctAnswer: q.correctAnswer || q.correctAnswerId || '',
        generator: q.generator,
        generatorParams: q.generatorParams || {},
        explanation: q.explanation
      })) : [],
      isPublished: Boolean(data.isPublished),
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
      isDynamic: Array.isArray(data.questions) ? data.questions.some((q: any) => q.type === 'dynamic') : false
    };
  }

  async deleteQuiz(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/quizzes/${id}`, {
      method: 'DELETE',
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete quiz');
    }
  }

  async searchQuizzes(query: string): Promise<Quiz[]> {
    const response = await fetch(`${this.baseUrl}/quizzes/search?q=${encodeURIComponent(query)}`, {
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to search quizzes');
    }

    return response.json();
  }

  async submitQuizAttempt(quizId: string, attempt: { score: number; answers: Array<{ questionId: string; selectedChoiceId: string }> }): Promise<void> {
    const response = await fetch(`${this.baseUrl}/quiz-attempts`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify({
        quiz: quizId,
        ...attempt
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit quiz attempt');
    }
  }

  async getQuizAttempts(): Promise<Array<{ quiz: string; score: number; completedAt: string }>> {
    const response = await fetch(`${this.baseUrl}/quiz-attempts`, {
      method: 'GET',
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch quiz attempts');
    }

    return response.json();
  }

  async getCourses(filter?: { difficulty?: string; subject?: string }): Promise<Course[]> {
    let url = `${this.baseUrl}/courses`;
    if (filter) {
      const params = new URLSearchParams();
      if (filter.difficulty) params.append('difficulty', filter.difficulty);
      if (filter.subject) params.append('subject', filter.subject);
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }

    const data = await response.json();
    return data.map(this.transformCourseResponse);
  }

  async getCourseById(id: string): Promise<Course> {
    const response = await fetch(`${this.baseUrl}/courses/${id}`, {
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch course');
    }

    const data = await response.json();
    return this.transformCourseResponse(data);
  }

  async createCourse(course: NewCourse): Promise<Course> {
    const response = await fetch(`${this.baseUrl}/courses`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: JSON.stringify(course),
    });

    if (!response.ok) {
      throw new Error('Failed to create course');
    }

    const data = await response.json();
    return this.transformCourseResponse(data);
  }

  async updateCourse(id: string, course: Partial<Course>): Promise<Course> {
    const response = await fetch(`${this.baseUrl}/courses/${id}`, {
      method: 'PATCH',
      headers: await this.getHeaders(),
      body: JSON.stringify(course),
    });

    if (!response.ok) {
      throw new Error('Failed to update course');
    }

    const data = await response.json();
    return this.transformCourseResponse(data);
  }

  async deleteCourse(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/courses/${id}`, {
      method: 'DELETE',
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete course');
    }
  }

  async getCourseProgress(courseId: string): Promise<CourseProgress> {
    const response = await fetch(`${this.baseUrl}/courses/${courseId}/progress`, {
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch course progress');
    }

    return response.json();
  }

  async markMaterialComplete(courseId: string, materialId: string): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/courses/${courseId}/materials/${materialId}/complete`,
      {
        method: 'POST',
        headers: await this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to mark material as complete');
    }
  }

  private transformCourseResponse(data: any): Course {
    return {
      id: data._id,
      title: data.title || '',
      description: data.description || '',
      sections: Array.isArray(data.sections)
        ? data.sections.map((s: any) => ({
            id: s._id,
            title: s.title,
            order: s.order,
            materials: Array.isArray(s.materials)
              ? s.materials.map((m: any) => ({
                  id: m._id,
                  title: m.title,
                  type: m.type,
                  content: m.content,
                  duration: m.duration,
                  order: m.order,
                }))
              : [],
            quiz: s.quiz ? this.transformQuizResponse(s.quiz) : undefined,
          }))
        : [],
      difficulty: data.difficulty || 'beginner',
      subject: data.subject || '',
      thumbnail: data.thumbnail,
      isPublished: Boolean(data.isPublished),
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
      authorId: data.authorId || '',
    };
  }
}

export const apiClient = new ApiClient();

export default apiClient;