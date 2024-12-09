const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz');

// Get all attempts for the current user
router.get('/quiz-attempts', auth, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ user: req.user.id })
      .populate('quiz', 'title subject difficulty')
      .sort({ completedAt: -1 });
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get attempts for a specific quiz
router.get('/quizzes/:quizId/attempts', auth, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({
      user: req.user.id,
      quiz: req.params.quizId
    }).sort({ completedAt: -1 });
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit a new quiz attempt
router.post('/quizzes/:quizId/attempts', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const { answers } = req.body;
    let score = 0;
    const gradedAnswers = answers.map(answer => {
      const question = quiz.questions.find(q => q._id.toString() === answer.questionId);
      const isCorrect = question.correctAnswer === answer.selectedAnswer;
      if (isCorrect) score++;
      return {
        ...answer,
        correct: isCorrect
      };
    });

    const finalScore = Math.round((score / quiz.questions.length) * 100);

    const attempt = new QuizAttempt({
      user: req.user.id,
      quiz: req.params.quizId,
      score: finalScore,
      answers: gradedAnswers
    });

    await attempt.save();
    res.json(attempt);
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
