export interface Course {
  id: string;
  title: string;
  description: string;
  subject: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
  quizzes: string[]; // Quiz IDs
  imageUrl?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NewCourse {
  title: string;
  description: string;
  subject: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
  quizzes?: string[];
  imageUrl?: string;
  isPublished?: boolean;
}

export default Course;
