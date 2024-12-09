import React from 'react';
import { QuizComponent } from './components/QuizComponent';

export const generateSnellsQuestion = () => {
  const n1 = (Math.random() * (2 - 1) + 1).toFixed(2);
  const n2 = (Math.random() * (2 - 1) + 1).toFixed(2);
  const theta1 = Math.floor(Math.random() * 80) + 10;

  const theta1Rad = (theta1 * Math.PI) / 180;
  const sinTheta2 = (n1 * Math.sin(theta1Rad)) / n2;
  let correctAnswer;

  if (sinTheta2 > 1) {
    correctAnswer = {
      id: 'tir',
      text: 'Total Internal Reflection (No Refraction)',
      unit: ''
    };
  } else {
    const theta2 = (Math.asin(sinTheta2) * (180 / Math.PI)).toFixed(2);
    correctAnswer = {
      id: theta2,
      text: theta2,
      unit: '°'
    };
  }

  // Generate alternative answers
  const alternateChoices = [];
  if (correctAnswer.id === 'tir') {
    ['45.00', '60.00', '30.00'].forEach((val, index) => {
      alternateChoices.push({
        id: `alt${index}`,
        text: val,
        unit: '°'
      });
    });
  } else {
    for (let i = 0; i < 3; i++) {
      let variation;
      do {
        variation = (Math.random() * 20 - 10).toFixed(2);
      } while (Math.abs(parseFloat(variation)) < 2);
      
      const altValue = (parseFloat(correctAnswer.text) + parseFloat(variation)).toFixed(2);
      alternateChoices.push({
        id: `alt${i}`,
        text: altValue,
        unit: '°'
      });
    }
  }

  const allChoices = [correctAnswer, ...alternateChoices].sort(() => Math.random() - 0.5);

  return {
    question: `Light travels from a medium with refractive index ${n1} at an angle of ${theta1}° to another medium with refractive index ${n2}. What is the angle of refraction?`,
    choices: allChoices,
    correctAnswer: correctAnswer
  };
};

const SnellsLawQuiz = () => {
  return (
    <QuizComponent
      generateQuestion={generateSnellsQuestion}
      title="Snell's Law Quiz"
      subject="Physics"
      difficulty="medium"
    />
  );
};

export default SnellsLawQuiz;
