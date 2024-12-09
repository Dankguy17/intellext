import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import CustomHeader from '../../components/CustomHeader';
import { apiClient } from '../../utils/api';
import { Course } from '../../types/Quiz';
import { MaterialIcons } from '@expo/vector-icons';

const AdminCoursesPage = () => {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const fetchedCourses = await apiClient.getCourses();
      setCourses(fetchedCourses);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = () => {
    router.push('/admin/edit-course');
  };

  const handleEditCourse = (courseId: string) => {
    router.push(`/admin/edit-course?id=${courseId}`);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    try {
      await apiClient.deleteCourse(courseId);
      await loadCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete course');
    }
  };

  const handleTogglePublish = async (course: Course) => {
    try {
      await apiClient.updateCourse(course.id, {
        ...course,
        isPublished: !course.isPublished
      });
      await loadCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update course');
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <CustomHeader title="Manage Courses" />
      <View style={styles.toolbar}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={24} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search courses..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.createButton} onPress={handleCreateCourse}>
          <MaterialIcons name="add" size={24} color="#FFF" />
          <Text style={styles.createButtonText}>Create Course</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>Loading courses...</Text>
          </View>
        ) : error ? (
          <View style={styles.messageContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : filteredCourses.length === 0 ? (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>No courses found</Text>
          </View>
        ) : (
          filteredCourses.map(course => (
            <View key={course.id} style={styles.courseCard}>
              <View style={styles.courseInfo}>
                <View style={styles.courseMeta}>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <View style={styles.courseMetadata}>
                    <Text style={styles.metadataText}>{course.subject}</Text>
                    <Text style={styles.metadataDot}>•</Text>
                    <Text style={styles.metadataText}>{course.difficulty}</Text>
                    <Text style={styles.metadataDot}>•</Text>
                    <Text style={styles.metadataText}>
                      {course.sections.length} sections
                    </Text>
                  </View>
                </View>
                <View style={styles.courseActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.publishButton]}
                    onPress={() => handleTogglePublish(course)}
                  >
                    <MaterialIcons
                      name={course.isPublished ? 'visibility' : 'visibility-off'}
                      size={20}
                      color="#FFF"
                    />
                    <Text style={styles.actionButtonText}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => handleEditCourse(course.id)}
                  >
                    <MaterialIcons name="edit" size={20} color="#FFF" />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteCourse(course.id)}
                  >
                    <MaterialIcons name="delete" size={20} color="#FFF" />
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
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
  toolbar: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#FFF',
    fontSize: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  courseCard: {
    backgroundColor: '#222',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  courseInfo: {
    padding: 16,
  },
  courseMeta: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
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
  courseActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  publishButton: {
    backgroundColor: '#4CAF50',
  },
  editButton: {
    backgroundColor: '#FF9800',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    marginLeft: 4,
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

export default AdminCoursesPage;
