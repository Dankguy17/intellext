const express = require('express');
const Course = require('../models/Course');
const CourseProgress = require('../models/CourseProgress');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Get all courses (admin only)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get published courses (for students)
router.get('/published', auth, async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single course
router.get('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Only allow access to published courses for non-admin users
    if (!course.isPublished && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get course progress
router.get('/:id/progress', auth, async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user._id;

    let progress = await CourseProgress.findOne({ courseId, userId });
    
    if (!progress) {
      // Create new progress if it doesn't exist
      progress = new CourseProgress({
        courseId,
        userId,
        completedMaterials: [],
        completedQuizzes: [],
        startedAt: new Date(),
        lastAccessedAt: new Date()
      });
      await progress.save();
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark material as complete
router.post('/:courseId/materials/:materialId/complete', auth, async (req, res) => {
  try {
    const { courseId, materialId } = req.params;
    const userId = req.user._id;

    let progress = await CourseProgress.findOne({ courseId, userId });
    
    if (!progress) {
      progress = new CourseProgress({
        courseId,
        userId,
        completedMaterials: [materialId],
        completedQuizzes: [],
        startedAt: new Date(),
        lastAccessedAt: new Date()
      });
    } else {
      if (!progress.completedMaterials.includes(materialId)) {
        progress.completedMaterials.push(materialId);
      }
      progress.lastAccessedAt = new Date();
    }

    await progress.save();
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a course (admin only)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const course = new Course({
      ...req.body,
      authorId: req.user._id
    });
    await course.save();
    res.status(201).json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a course (admin only)
router.patch('/:id', auth, adminAuth, async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    res.json(course);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a course (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
