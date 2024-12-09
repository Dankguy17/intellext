export interface Question {
  id?: string;
  question: string;
  type: 'static' | 'dynamic';
  questionType: 'multiple_choice' | 'free_response' | 'true_false';
  options?: string[];
  correctAnswer: string;
  generator?: string;
  generatorParams?: Record<string, any>;
  explanation?: string;
  points?: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  isDynamic?: boolean;
  mode: 'quiz' | 'course_material';
  courseId?: string | null;
  subject?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: {
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
    generatedQuestion?: string;
    generatedOptions?: string[];
    generatedAnswer?: string;
  }[];
  score: number;
  createdAt: string;
}

export interface NewQuiz {
  title: string;
  description: string;
  questions: Omit<Question, 'id'>[];
  isPublished?: boolean;
  mode: 'quiz' | 'course_material';
  courseId?: string | null;
  subject?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface CourseSection {
  id: string;
  title: string;
  order: number;
  materials: CourseMaterial[];
  quiz?: Quiz;
}

export interface CourseMaterial {
  id: string;
  title: string;
  type: 'video' | 'text' | 'pdf' | 'link';
  content: string; // URL for video/pdf/link, actual content for text
  duration?: number; // in minutes
  order: number;
  completed?: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  sections: CourseSection[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  subject: string;
  thumbnail?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: string;
}

export interface NewCourse {
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  subject: string;
  thumbnail?: string;
  sections: Omit<CourseSection, 'id'>[];
  isPublished?: boolean;
}

export interface CourseProgress {
  courseId: string;
  userId: string;
  completedMaterials: string[]; // material IDs
  completedQuizzes: string[]; // quiz IDs
  lastAccessedSection: string;
  startedAt: string;
  lastAccessedAt: string;
  completedAt?: string;
}

export default Quiz;