import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import CustomHeader from '../components/CustomHeader';
import { apiClient } from '../utils/api';
import { generators } from '../utils/questionGenerators';

interface QuizQuestion {
  question: string;
  type: 'multiple-choice' | 'dynamic';
  choices?: {
    id: string;
    text: string;
    unit?: string;
  }[];
  correctAnswerId?: string;
  generator?: string;
  generatorParams?: {
    [key: string]: number | undefined;
  };
}

const AdminQuizzes = () => {
  const [quizTitle, setQuizTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [questionType, setQuestionType] = useState<'multiple-choice' | 'dynamic'>('multiple-choice');
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion>({
    question: '',
    type: 'multiple-choice',
    choices: [
      { id: '1', text: '', unit: '' },
      { id: '2', text: '', unit: '' },
      { id: '3', text: '', unit: '' },
      { id: '4', text: '', unit: '' }
    ],
    correctAnswerId: '1'
  });
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [numDynamicQuestions, setNumDynamicQuestions] = useState<number>(5);
  const [numQuestionsText, setNumQuestionsText] = useState<string>("5");
  const router = useRouter();

  const handleAddQuestion = () => {
    if (questionType === 'multiple-choice') {
      if (currentQuestion.question.trim() === '') {
        alert('Please enter a question');
        return;
      }

      if (currentQuestion.choices?.some(choice => choice.text.trim() === '')) {
        alert('Please fill in all choices');
        return;
      }

      setQuestions([...questions, { ...currentQuestion, id: `${Date.now()}-${Math.random()}` }]);

      // Reset multiple choice question
      setCurrentQuestion({
        question: '',
        type: 'multiple-choice',
        choices: [
          { id: '1', text: '', unit: '' },
          { id: '2', text: '', unit: '' },
          { id: '3', text: '', unit: '' },
          { id: '4', text: '', unit: '' }
        ],
        correctAnswerId: '1'
      });
    } else {
      if (!currentQuestion.generator) {
        alert('Please select a generator type');
        return;
      }

      const num = parseInt(numQuestionsText);
      if (isNaN(num) || num <= 0) {
        alert('Please enter a valid number of questions to generate');
        return;
      }

      // Add the specified number of dynamic questions
      const newQuestions = Array.from({ length: num }, (_, i) => ({
        ...currentQuestion,
        id: `${Date.now()}-${Math.random()}-${i}`,
        type: 'dynamic',
        generatorParams: Object.fromEntries(
          Object.entries(currentQuestion.generatorParams || {})
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) => [key, Number(value)])
        )
      }));

      setQuestions([...questions, ...newQuestions]);
    }
  };

  const handleSaveQuiz = async () => {
    if (quizTitle.trim() === '' || subject.trim() === '') {
      alert('Please enter quiz title and subject');
      return;
    }

    if (questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    try {
      // Ensure all dynamic questions have the correct structure
      const processedQuestions = questions.map(q => {
        if (q.type === 'dynamic') {
          return {
            ...q,
            generatorParams: Object.fromEntries(
              Object.entries(q.generatorParams || {})
                .filter(([_, value]) => value !== undefined)
                .map(([key, value]) => [key, Number(value)])
            )
          };
        }
        return q;
      });

      await apiClient.createQuiz({
        title: quizTitle,
        subject,
        difficulty,
        questions: processedQuestions,
      });
      
      alert('Quiz saved successfully!');
      
      // Reset form
      setQuizTitle('');
      setSubject('');
      setQuestions([]);
      setCurrentQuestion({
        question: '',
        type: 'multiple-choice',
        choices: [
          { id: '1', text: '', unit: '' },
          { id: '2', text: '', unit: '' },
          { id: '3', text: '', unit: '' },
          { id: '4', text: '', unit: '' }
        ],
        correctAnswerId: '1'
      });
      setNumQuestionsText('5');
      setNumDynamicQuestions(5);
      
      // Navigate to quiz list
      router.push('/admin/quiz-list');
    } catch (error: any) {
      alert('Error saving quiz: ' + (error.message || 'Unknown error'));
    }
  };

  const updateChoice = (index: number, text: string, unit: string = '') => {
    const newChoices = [...currentQuestion.choices];
    newChoices[index] = { ...newChoices[index], text, unit };
    setCurrentQuestion({ ...currentQuestion, choices: newChoices });
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Create Quiz" />
      <View style={styles.splitContainer}>
        {/* Left Panel - Quiz Editor */}
        <View style={styles.leftPanel}>
          <ScrollView style={styles.editorScroll}>
            <View style={styles.formSection}>
              <Text style={styles.label}>Quiz Title</Text>
              <TextInput
                style={styles.input}
                value={quizTitle}
                onChangeText={setQuizTitle}
                placeholder="Enter quiz title"
                placeholderTextColor="#666"
              />

              <Text style={styles.label}>Subject</Text>
              <TextInput
                style={styles.input}
                value={subject}
                onChangeText={setSubject}
                placeholder="Enter subject"
                placeholderTextColor="#666"
              />

              <Text style={styles.label}>Difficulty</Text>
              <View style={styles.difficultyContainer}>
                {['easy', 'medium', 'hard'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.difficultyButton,
                      difficulty === level && styles.difficultyButtonActive
                    ]}
                    onPress={() => setDifficulty(level as 'easy' | 'medium' | 'hard')}
                  >
                    <Text style={[
                      styles.difficultyButtonText,
                      difficulty === level && styles.difficultyButtonTextActive
                    ]}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.questionSection}>
              <Text style={styles.label}>Question Type</Text>
              <View style={styles.typeContainer}>
                {['multiple-choice', 'dynamic'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      questionType === type && styles.typeButtonActive
                    ]}
                    onPress={() => setQuestionType(type as 'multiple-choice' | 'dynamic')}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      questionType === type && styles.typeButtonTextActive
                    ]}>
                      {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {questionType === 'multiple-choice' ? (
                <>
                  <Text style={styles.label}>Question</Text>
                  <TextInput
                    style={styles.input}
                    value={currentQuestion.question}
                    onChangeText={(text) => setCurrentQuestion({ ...currentQuestion, question: text })}
                    placeholder="Enter question"
                    placeholderTextColor="#666"
                    multiline
                  />

                  <Text style={styles.label}>Choices</Text>
                  {currentQuestion.choices?.map((choice, index) => (
                    <View key={choice.id} style={styles.choiceContainer}>
                      <TextInput
                        style={styles.choiceInput}
                        value={choice.text}
                        onChangeText={(text) => updateChoice(index, text, choice.unit)}
                        placeholder={`Choice ${index + 1}`}
                        placeholderTextColor="#666"
                      />
                      <TextInput
                        style={styles.unitInput}
                        value={choice.unit}
                        onChangeText={(unit) => updateChoice(index, choice.text, unit)}
                        placeholder="Unit"
                        placeholderTextColor="#666"
                      />
                      <TouchableOpacity
                        style={[
                          styles.correctButton,
                          currentQuestion.correctAnswerId === choice.id && styles.correctButtonSelected
                        ]}
                        onPress={() => setCurrentQuestion({ ...currentQuestion, correctAnswerId: choice.id })}
                      >
                        <Text style={styles.correctButtonText}>
                          {currentQuestion.correctAnswerId === choice.id ? '✓' : 'Mark Correct'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  <TouchableOpacity style={styles.addButton} onPress={handleAddQuestion}>
                    <Text style={styles.buttonText}>Add Question</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={styles.label}>Generator Type</Text>
                  <View style={styles.generatorContainer}>
                    {Object.entries(generators).map(([key, gen]) => (
                      <TouchableOpacity
                        key={key}
                        style={[
                          styles.generatorButton,
                          currentQuestion.generator === key && styles.generatorButtonActive
                        ]}
                        onPress={() => setCurrentQuestion({
                          ...currentQuestion,
                          generator: key,
                          generatorParams: gen.defaultParams,
                        })}
                      >
                        <Text style={[
                          styles.generatorButtonText,
                          currentQuestion.generator === key && styles.generatorButtonTextActive
                        ]}>
                          {gen.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {currentQuestion.generator && (
                    <>
                      <Text style={styles.label}>{generators[currentQuestion.generator].description}</Text>
                      <View style={styles.parameterSection}>
                        {Object.entries(currentQuestion.generatorParams || {}).map(([key, value]) => (
                          <View key={key} style={styles.parameterContainer}>
                            <Text style={styles.paramLabel}>
                              {key.replace(/([A-Z])/g, ' $1')
                                 .replace(/^./, str => str.toUpperCase())
                                 .replace(/Min$/, ' (Min)')
                                 .replace(/Max$/, ' (Max)')}:
                            </Text>
                            <TextInput
                              style={styles.paramInput}
                              value={value?.toString()}
                              onChangeText={(text) => {
                                const val = parseFloat(text);
                                setCurrentQuestion({
                                  ...currentQuestion,
                                  generatorParams: {
                                    ...currentQuestion.generatorParams,
                                    [key]: isNaN(val) ? undefined : val,
                                  },
                                });
                              }}
                              placeholder="Value"
                              placeholderTextColor="#666"
                              keyboardType="numeric"
                            />
                          </View>
                        ))}
                      </View>

                      <View style={styles.numQuestionsContainer}>
                        <Text style={styles.label}>Number of Questions to Generate:</Text>
                        <TextInput
                          style={styles.numQuestionsInput}
                          value={numQuestionsText}
                          onChangeText={(text) => {
                            setNumQuestionsText(text);
                            const num = parseInt(text);
                            if (!isNaN(num) && num > 0) {
                              setNumDynamicQuestions(num);
                            }
                          }}
                          placeholder="Number of questions"
                          placeholderTextColor="#666"
                          keyboardType="numeric"
                        />
                      </View>

                      <TouchableOpacity 
                        style={[styles.addButton, styles.addDynamicButton]} 
                        onPress={handleAddQuestion}
                      >
                        <Text style={styles.buttonText}>Add Dynamic Questions</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </>
              )}
            </View>
          </ScrollView>
        </View>

        {/* Right Panel - Question Preview */}
        <View style={styles.rightPanel}>
          <Text style={styles.previewTitle}>Questions ({questions.length})</Text>
          <ScrollView style={styles.previewScroll}>
            {questions.map((q, index) => (
              <View key={index} style={styles.previewQuestionItem}>
                <View style={styles.previewHeader}>
                  <Text style={styles.previewQuestionNumber}>Question {index + 1}</Text>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => {
                      const newQuestions = [...questions];
                      newQuestions.splice(index, 1);
                      setQuestions(newQuestions);
                    }}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.previewQuestionText}>{q.question || 'Dynamic Question'}</Text>
                {q.choices?.map((choice, choiceIndex) => (
                  <Text 
                    key={choice.id} 
                    style={[
                      styles.previewChoiceText,
                      q.correctAnswerId === choice.id && styles.previewCorrectChoice
                    ]}
                  >
                    {String.fromCharCode(65 + choiceIndex)}. {choice.text} {choice.unit ? `(${choice.unit})` : ''}
                    {q.correctAnswerId === choice.id ? ' ✓' : ''}
                  </Text>
                ))}
                {q.generator && (
                  <View style={styles.previewGeneratorInfo}>
                    <Text style={styles.previewGeneratorType}>{generators[q.generator].name}</Text>
                    <Text style={styles.previewGeneratorParams}>
                      Parameters: {Object.entries(q.generatorParams || {})
                        .map(([key, value]) => `${key}: ${value}`).join(', ')}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSaveQuiz}>
        <Text style={styles.buttonText}>Save Quiz</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181C14',
  },
  splitContainer: {
    flexDirection: 'row',
    flex: 1,
    padding: 16,
    gap: 16,
  },
  leftPanel: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  rightPanel: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 16,
  },
  editorScroll: {
    flex: 1,
    padding: 16,
  },
  previewScroll: {
    flex: 1,
  },
  previewTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  previewQuestionItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewQuestionNumber: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
  },
  previewQuestionText: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 8,
  },
  previewChoiceText: {
    color: '#cccccc',
    fontSize: 14,
    marginLeft: 16,
    marginBottom: 4,
  },
  previewCorrectChoice: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  previewGeneratorInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
  },
  previewGeneratorType: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  },
  previewGeneratorParams: {
    color: '#cccccc',
    fontSize: 12,
    marginTop: 4,
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 16,
    color: '#ffffff',
    fontSize: 16,
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  difficultyButtonActive: {
    backgroundColor: '#1865f2',
  },
  difficultyButtonText: {
    color: '#ffffff',
    opacity: 0.7,
  },
  difficultyButtonTextActive: {
    opacity: 1,
    fontWeight: 'bold',
  },
  questionSection: {
    gap: 16,
    marginTop: 16,
  },
  choiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  choiceInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
  },
  unitInput: {
    width: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
  },
  correctButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 8,
    borderRadius: 4,
    width: 100,
  },
  correctButtonSelected: {
    backgroundColor: '#1865f2',
  },
  correctButtonText: {
    color: '#ffffff',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  addDynamicButton: {
    marginTop: 16,
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#1865f2',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  generatorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 16,
  },
  generatorButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    minWidth: 120,
  },
  generatorButtonActive: {
    backgroundColor: '#4CAF50',
  },
  generatorButtonText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
  },
  generatorButtonTextActive: {
    fontWeight: 'bold',
  },
  parameterSection: {
    padding: 16,
  },
  parameterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  paramLabel: {
    color: '#ffffff',
    fontSize: 16,
    width: 140,
  },
  paramInput: {
    width: 80,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 8,
    color: '#ffffff',
    textAlign: 'center',
  },
  paramText: {
    color: '#ffffff',
    fontSize: 16,
    marginHorizontal: 8,
  },
  numQuestionsContainer: {
    padding: 16,
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  numQuestionsInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#1865f2',
  },
  typeButtonText: {
    color: '#ffffff',
    opacity: 0.8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  typeButtonTextActive: {
    opacity: 1,
  },
});

export default AdminQuizzes;
