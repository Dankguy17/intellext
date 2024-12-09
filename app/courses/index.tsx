import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import CustomHeader from '../components/CustomHeader';
import { apiClient } from '../utils/api';
import { Course } from '../types/Quiz';

const CoursesPage = () => {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{
    difficulty?: string;
    subject?: string;
  }>({});

  useEffect(() => {
    loadCourses();
  }, [filter]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const fetchedCourses = await apiClient.getCourses(filter);
      setCourses(fetchedCourses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCoursePress = (courseId: string) => {
    router.push(`/courses/${courseId}`);
  };

  const renderCourseCard = (course: Course) => (
    <TouchableOpacity
      key={course.id}
      style={styles.courseCard}
      onPress={() => handleCoursePress(course.id)}
    >
      {course.thumbnail ? (
        <Image source={{ uri: course.thumbnail }} style={styles.thumbnail} />
      ) : (
        <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
          <Text style={styles.placeholderText}>{course.title[0]}</Text>
        </View>
      )}
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <Text style={styles.courseDescription} numberOfLines={2}>
          {course.description}
        </Text>
        <View style={styles.courseMetadata}>
          <Text style={styles.metadataText}>{course.subject}</Text>
          <Text style={styles.metadataDot}>•</Text>
          <Text style={styles.metadataText}>{course.difficulty}</Text>
          <Text style={styles.metadataDot}>•</Text>
          <Text style={styles.metadataText}>{course.sections.length} sections</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFilters = () => (
    <ScrollView horizontal style={styles.filtersContainer} showsHorizontalScrollIndicator={false}>
      <TouchableOpacity
        style={[styles.filterChip, !filter.difficulty && styles.activeFilter]}
        onPress={() => setFilter(prev => ({ ...prev, difficulty: undefined }))}
      >
        <Text style={[styles.filterText, !filter.difficulty && styles.activeFilterText]}>All Levels</Text>
      </TouchableOpacity>
      {['beginner', 'intermediate', 'advanced'].map(difficulty => (
        <TouchableOpacity
          key={difficulty}
          style={[styles.filterChip, filter.difficulty === difficulty && styles.activeFilter]}
          onPress={() => setFilter(prev => ({ ...prev, difficulty }))}
        >
          <Text style={[styles.filterText, filter.difficulty === difficulty && styles.activeFilterText]}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <CustomHeader title="Courses" />
      {renderFilters()}
      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>Loading courses...</Text>
          </View>
        ) : error ? (
          <View style={styles.messageContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : courses.length === 0 ? (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>No courses found</Text>
          </View>
        ) : (
          courses.map(renderCourseCard)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#222',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#333',
    marginRight: 8,
  },
  activeFilter: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    color: '#FFF',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  courseCard: {
    backgroundColor: '#222',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 160,
    backgroundColor: '#333',
  },
  placeholderThumbnail: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    color: '#666',
  },
  courseInfo: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    color: '#CCC',
    marginBottom: 8,
  },
  courseMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontSize: 12,
    color: '#999',
  },
  metadataDot: {
    color: '#666',
    marginHorizontal: 6,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 32,
  },
  messageText: {
    color: '#999',
    fontSize: 16,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
  },
});

export default CoursesPage;
