const mongoose = require('mongoose');

const choiceSchema = new mongoose.Schema({
  id: String,
  text: String,
  unit: String
});

const questionSchema = new mongoose.Schema({
  id: String,
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'fill-blank', 'dynamic'],
    required: true
  },
  question: {
    type: String,
    required: function() {
      return this.type !== 'dynamic';
    }
  },
  explanation: String,
  choices: [choiceSchema],
  correctAnswerId: String,
  correctAnswer: Boolean,
  acceptableAnswers: [String],
  caseSensitive: Boolean,
  generator: String,
  generatorParams: {
    type: Map,
    of: Number
  }
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  questions: [questionSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;
