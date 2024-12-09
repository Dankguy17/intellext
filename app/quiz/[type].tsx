import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { QuizComponent } from '../components/QuizComponent';
import { generateSnellsQuestion } from '../snellstest';

export default function QuizRoute() {
  const { type } = useLocalSearchParams();
  
  if (type === 'snells') {
    return (
      <QuizComponent
        title="Snell's Law Quiz"
        generateQuestion={generateSnellsQuestion}
      />
    );
  }

  return (
    <QuizComponent
      title="Quiz"
    />
  );
}
