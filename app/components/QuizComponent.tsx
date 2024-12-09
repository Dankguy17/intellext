import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { apiClient } from '../utils/api';
import { Quiz } from '../types/Quiz';

interface Question {
  id: string;
  questionType: 'multiple_choice' | 'true_false' | 'fill_blank';
  question: string;
  options?: string[];
  correctAnswer?: string;
}

interface QuizComponentProps {
  quiz?: Quiz;
  generateQuestion?: () => {
    question: string;
    options: string[];
    correctAnswer: string;
  };
  title?: string;
  subject?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  onComplete?: (quiz: Quiz) => void;
  onReturn?: () => void;
  isEditing?: boolean;
  mode?: 'quiz' | 'course_material';
  onSave?: (quiz: Quiz) => void;
  setError?: (error: string) => void;
}

export const QuizComponent: React.FC<QuizComponentProps> = ({
  quiz,
  mode = 'quiz',
  isEditing = false,
  generateQuestion,
  onComplete,
  onReturn,
  onSave,
  setError,
}) => {
  const [questions, setQuestions] = useState<Question[]>(quiz?.questions || []);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>(new Array(quiz?.questions?.length || 0).fill(null));
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [score, setScore] = useState(0);
  const [currentQuiz, setCurrentQuiz] = useState<Quiz>({
    id: quiz?.id || '',
    title: quiz?.title || '',
    description: quiz?.description || '',
    questions: quiz?.questions || [],
    isPublished: quiz?.isPublished || false,
    createdAt: quiz?.createdAt || new Date().toISOString(),
    updatedAt: quiz?.updatedAt || new Date().toISOString(),
    mode: quiz?.mode || mode,
    subject: quiz?.subject || '',
    difficulty: quiz?.difficulty || '',
    courseId: quiz?.courseId || null
  });

  const [quizTitle, setQuizTitle] = useState(quiz?.title || '');
  const [quizSubject, setQuizSubject] = useState(quiz?.subject || '');
  const [quizDifficulty, setQuizDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>(quiz?.difficulty || '');

  useEffect(() => {
    setStartTime(new Date());
  }, []);

  const handleGenerateQuestion = async () => {
    if (!generateQuestion) return;
    
    setIsGenerating(true);
    try {
      const newQuestion = generateQuestion();
      setQuestions([...questions, {
        id: Math.random().toString(),
        questionType: 'multiple_choice',
        question: newQuestion.question,
        options: newQuestion.options,
        correctAnswer: newQuestion.correctAnswer
      }]);
    } catch (error) {
      console.error('Error generating question:', error);
    }
    setIsGenerating(false);
  };

  const handleUpdateQuestion = (index: number, updatedQuestion: Question) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = updatedQuestion;
    setQuestions(updatedQuestions);
  };

  const handleDeleteQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  const handleAnswerSelect = (answer: string, index: number) => {
    setSelectedAnswer(answer);
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = index.toString();
    setUserAnswers(newAnswers);
  };

  const handleSave = async () => {
    if (!quiz) return;

    try {
      const updatedQuiz = {
        ...quiz,
        questions: questions.map(q => ({
          ...q,
          _id: q.id // Ensure we have both id and _id for server compatibility
        })),
      };
      
      if (onSave) {
        await onSave(updatedQuiz);
      }
    } catch (error) {
      setError?.(error instanceof Error ? error.message : 'Failed to save quiz');
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(userAnswers[currentQuestionIndex + 1]);
    } else {
      setEndTime(new Date());
      const currentScore = questions.reduce((acc, question, index) => {
        const userAnswerIndex = parseInt(userAnswers[index] || '0');
        const correctAnswer = parseInt(question.correctAnswer || '0');
        return acc + (userAnswerIndex === correctAnswer - 1 ? 1 : 0);
      }, 0);
      setScore(currentScore);
      setIsFinished(true);
      
      const quizAttempt = {
        id: quiz?.id || '',
        score: currentScore,
        totalQuestions: questions.length,
        completedAt: new Date().toISOString(),
        timeTaken: startTime ? (new Date().getTime() - startTime.getTime()) : 0,
        correctAnswers: currentScore,
        wrongAnswers: questions.length - currentScore
      };

      if (onComplete) {
        onComplete(quizAttempt);
      }
    }
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: Math.random().toString(),
      question: "New Question",
      type: "static",
      questionType: "multiple_choice",
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      correctAnswer: "0"
    };
    setQuestions([...questions, newQuestion]);
    setCurrentQuestionIndex(questions.length);
  };

  const handleRemoveQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
    if (currentQuestionIndex >= updatedQuestions.length) {
      setCurrentQuestionIndex(Math.max(0, updatedQuestions.length - 1));
    }
  };

  const handleEditQuestion = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setQuestions(updatedQuestions);
  };

  const handleEditOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    const options = [...updatedQuestions[questionIndex].options];
    options[optionIndex] = value;
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options
    };
    setQuestions(updatedQuestions);
  };

  const handleSetCorrectAnswer = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      correctAnswer: optionIndex.toString()
    };
    setQuestions(updatedQuestions);
  };

  if (isFinished && startTime) {
    const endTimeValue = endTime || new Date();
    const timeTaken = endTimeValue.getTime() - startTime.getTime();
    const minutes = Math.floor(timeTaken / 60000);
    const seconds = Math.floor((timeTaken % 60000) / 1000);
    const correctAnswers = score;
    const wrongAnswers = questions.length - score;

    return (
      <View style={styles.container}>
        <View style={styles.finishedContainer}>
          <Text style={styles.congratsText}>Quiz Completed!</Text>
          
          <View style={styles.resultCard}>
            <Text style={styles.scoreText}>Final Score</Text>
            <Text style={styles.scorePercentage}>
              {Math.round((score / questions.length) * 100)}%
            </Text>
            <Text style={styles.scoreDetail}>{score}/{questions.length} correct</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Time Taken</Text>
              <Text style={styles.statValue}>{minutes}m {seconds}s</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Correct Answers</Text>
              <Text style={[styles.statValue, { color: '#4CAF50' }]}>{correctAnswers}</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Wrong Answers</Text>
              <Text style={[styles.statValue, { color: '#FF5252' }]}>{wrongAnswers}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.returnButton}
            onPress={onReturn}
          >
            <Text style={styles.returnButtonText}>Return to Quiz List</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isFinished) {
    return (
      <View style={styles.container}>
        <View style={styles.finishedContainer}>
          <Text style={styles.scoreText}>Your Score: {score}/{questions.length}</Text>
          <Text style={styles.scorePercentage}>
            {Math.round((score / questions.length) * 100)}%
          </Text>
        </View>
      </View>
    );
  }

  if (isEditing) {
    const currentQuestion = questions[currentQuestionIndex];
    return (
      <View style={styles.container}>
        <View style={styles.questionNavigation}>
          <Text style={styles.questionCount}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Text>
          <View style={styles.navigationButtons}>
            <TouchableOpacity
              style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
              onPress={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
            >
              <Text style={styles.navButtonText}>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navButton, currentQuestionIndex === questions.length - 1 && styles.navButtonDisabled]}
              onPress={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
              disabled={currentQuestionIndex === questions.length - 1}
            >
              <Text style={styles.navButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.questionEditor}>
            <TextInput
              style={styles.questionInput}
              value={currentQuestion.question}
              onChangeText={(text) => handleEditQuestion(currentQuestionIndex, 'question', text)}
              placeholder="Enter question"
              placeholderTextColor="#666"
              multiline
            />

            <View style={styles.optionsContainer}>
              <Text style={styles.optionsLabel}>Options:</Text>
              {currentQuestion.options.map((option, optionIndex) => (
                <View key={optionIndex} style={styles.optionEditor}>
                  <TextInput
                    style={styles.optionInput}
                    value={option}
                    onChangeText={(text) => handleEditOption(currentQuestionIndex, optionIndex, text)}
                    placeholder={`Option ${optionIndex + 1}`}
                    placeholderTextColor="#666"
                  />
                  <TouchableOpacity
                    style={[
                      styles.correctAnswerButton,
                      currentQuestion.correctAnswer === optionIndex.toString() && styles.correctAnswerButtonSelected
                    ]}
                    onPress={() => handleSetCorrectAnswer(currentQuestionIndex, optionIndex)}
                  >
                    <Text style={styles.correctAnswerButtonText}>
                      {currentQuestion.correctAnswer === optionIndex.toString() ? '✓' : 'Set Correct'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.questionActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.removeButton]}
                onPress={() => handleRemoveQuestion(currentQuestionIndex)}
              >
                <Text style={styles.actionButtonText}>Remove Question</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.addButton]}
                onPress={handleAddQuestion}
              >
                <Text style={styles.actionButtonText}>Add New Question</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Quiz</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!isEditing && mode === 'quiz' && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </Text>
        </View>
      )}
      
      <ScrollView style={styles.scrollView}>
        {!isEditing && mode === 'quiz' ? (
          // Quiz Taking View
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>
              {questions[currentQuestionIndex]?.question || 'No question available'}
            </Text>
            <View style={styles.optionsContainer}>
              {questions[currentQuestionIndex]?.questionType === 'multiple_choice' && 
                questions[currentQuestionIndex]?.options?.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      selectedAnswer === option && styles.selectedOption
                    ]}
                    onPress={() => handleAnswerSelect(option, index)}
                  >
                    <Text style={[
                      styles.optionText,
                      selectedAnswer === option && styles.selectedOptionText
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))
              }
              {questions[currentQuestionIndex]?.questionType === 'true_false' && (
                ['True', 'False'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      selectedAnswer === option && styles.selectedOption
                    ]}
                    onPress={() => handleAnswerSelect(option, ['True', 'False'].indexOf(option))}
                  >
                    <Text style={[
                      styles.optionText,
                      selectedAnswer === option && styles.selectedOptionText
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
            {selectedAnswer && (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNextQuestion}
              >
                <Text style={styles.nextButtonText}>
                  {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          // Quiz Editing View
          mode === 'quiz' && questions.map((question, index) => (
            <View key={question.id || index} style={styles.questionContainer}>
              <TextInput
                style={styles.questionInput}
                value={question.question}
                onChangeText={(text) => handleUpdateQuestion(index, { ...question, question: text })}
                placeholder="Question"
                placeholderTextColor="#666"
                multiline
              />
              <View style={styles.optionsContainer}>
                {question.options?.map((option, optionIndex) => (
                  <View key={optionIndex} style={styles.optionRow}>
                    <TextInput
                      style={styles.optionInput}
                      value={option}
                      onChangeText={(text) => {
                        const updatedOptions = [...(question.options || [])];
                        updatedOptions[optionIndex] = text;
                        handleUpdateQuestion(index, { ...question, options: updatedOptions });
                      }}
                      placeholder={`Option ${optionIndex + 1}`}
                      placeholderTextColor="#666"
                    />
                    <TouchableOpacity
                      style={[
                        styles.correctAnswerButton,
                        question.correctAnswer === option && styles.selectedCorrectAnswer
                      ]}
                      onPress={() => handleUpdateQuestion(index, { ...question, correctAnswer: option })}
                    >
                      <Text style={styles.correctAnswerText}>✓</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {isEditing && (
        <View style={styles.editFooter}>
          {mode === 'quiz' && (
            <TouchableOpacity
              style={[styles.button, styles.generateButton]}
              onPress={handleGenerateQuestion}
              disabled={isGenerating}
            >
              <Text style={styles.buttonText}>
                {isGenerating ? 'Generating...' : 'Generate New Question'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={styles.buttonText}>Save {mode === 'quiz' ? 'Quiz' : 'Course Material'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  questionContainer: {
    marginBottom: 16,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 24,
  },
  optionsContainer: {
    marginTop: 16,
  },
  optionButton: {
    backgroundColor: '#2C3333',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3A4444',
  },
  selectedOption: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 16,
    color: '#fff',
  },
  selectedOptionText: {
    color: '#fff',
    fontWeight: '600',
  },
  progressContainer: {
    padding: 16,
    backgroundColor: '#2C3333',
    borderBottomWidth: 1,
    borderBottomColor: '#3A4444',
  },
  progressText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editFooter: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  generateButton: {
    backgroundColor: '#6c757d',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  questionInput: {
    fontSize: 16,
    color: '#333',
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginRight: 8,
  },
  correctAnswerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCorrectAnswer: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  correctAnswerText: {
    fontSize: 18,
    color: '#666',
  },
  finishedContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
  },
  congratsText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginVertical: 20,
  },
  resultCard: {
    backgroundColor: '#2C2C2C',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  scorePercentage: {
    fontSize: 48,
    color: '#007AFF',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  scoreDetail: {
    fontSize: 16,
    color: '#AAAAAA',
  },
  statsContainer: {
    backgroundColor: '#2C2C2C',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    marginTop: 10,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3D3D3D',
  },
  statLabel: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  statValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  returnButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 30,
    width: '100%',
    alignItems: 'center',
  },
  returnButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  questionEditor: {
    padding: 16,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    marginBottom: 16,
  },
  questionInput: {
    backgroundColor: '#333',
    color: '#FFF',
    padding: 12,
    borderRadius: 6,
    fontSize: 16,
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    marginTop: 16,
  },
  optionsLabel: {
    color: '#FFF',
    fontSize: 16,
    marginBottom: 8,
  },
  optionEditor: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionInput: {
    flex: 1,
    backgroundColor: '#333',
    color: '#FFF',
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  correctAnswerButton: {
    backgroundColor: '#444',
    padding: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  correctAnswerButtonSelected: {
    backgroundColor: '#2E7D32',
  },
  correctAnswerButtonText: {
    color: '#FFF',
    fontSize: 14,
  },
  questionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  addButton: {
    backgroundColor: '#2E7D32',
  },
  removeButton: {
    backgroundColor: '#C62828',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#1976D2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  questionNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    marginBottom: 16,
  },
  questionCount: {
    color: '#FFF',
    fontSize: 16,
  },
  navigationButtons: {
    flexDirection: 'row',
  },
  navButton: {
    backgroundColor: '#444',
    padding: 8,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    color: '#FFF',
    fontSize: 14,
  },
});