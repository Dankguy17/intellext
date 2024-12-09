import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import CustomHeader from '../components/CustomHeader';
import { apiClient } from '../utils/api';
import { Course, CourseSection, CourseMaterial, CourseProgress } from '../types/Quiz';
import { MaterialIcons } from '@expo/vector-icons';
import YouTubePlayer from '../components/YouTubePlayer';

const CoursePage = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [currentSection, setCurrentSection] = useState<number>(0);
  const [currentMaterial, setCurrentMaterial] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const [fetchedCourse, courseProgress] = await Promise.all([
        apiClient.getCourseById(id as string),
        apiClient.getCourseProgress(id as string),
      ]);
      setCourse(fetchedCourse);
      setProgress(courseProgress);
      
      if (courseProgress?.lastAccessedSection) {
        const sectionIndex = fetchedCourse.sections.findIndex(
          s => s.id === courseProgress.lastAccessedSection
        );
        if (sectionIndex !== -1) {
          setCurrentSection(sectionIndex);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialComplete = async (materialId: string) => {
    try {
      await apiClient.markMaterialComplete(id as string, materialId);
      setProgress(prev => prev ? {
        ...prev,
        completedMaterials: [...prev.completedMaterials, materialId]
      } : null);
    } catch (err) {
      console.error('Failed to mark material as complete:', err);
    }
  };

  const handleQuizStart = (quizId: string) => {
    router.push(`/quiz/${quizId}`);
  };

  const renderMaterial = (material: CourseMaterial) => {
    const isCompleted = progress?.completedMaterials.includes(material.id);

    switch (material.type) {
      case 'video':
        if (material.content.includes('youtube.com') || material.content.includes('youtu.be')) {
          return <YouTubePlayer videoId={material.content} height={width * 0.5625} />;
        }
        return (
          <View style={styles.videoContainer}>
            <video 
              controls 
              style={{ width: '100%', height: width * 0.5625 }}
              src={material.content}
            >
              Your browser does not support the video tag.
            </video>
          </View>
        );
      case 'text':
        return (
          <View style={styles.textContent}>
            <Text style={styles.textMaterial}>{material.content}</Text>
          </View>
        );
      case 'pdf':
      case 'link':
        return (
          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => router.push(material.content)}
          >
            <MaterialIcons name="link" size={24} color="#007AFF" />
            <Text style={styles.linkText}>{material.title}</Text>
          </TouchableOpacity>
        );
    }
  };

  const currentSectionData = course?.sections[currentSection];
  const currentMaterialData = currentSectionData?.materials[currentMaterial];

  if (loading) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Loading..." showBackButton />
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>Loading course...</Text>
        </View>
      </View>
    );
  }

  if (error || !course) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Error" showBackButton />
        <View style={styles.messageContainer}>
          <Text style={styles.errorText}>{error || 'Failed to load course'}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader title={course.title} showBackButton />
      <View style={styles.content}>
        <View style={styles.sidebar}>
          <ScrollView style={styles.sectionList}>
            {course.sections.map((section, sIndex) => (
              <View key={section.id}>
                <TouchableOpacity
                  style={[
                    styles.sectionItem,
                    currentSection === sIndex && styles.activeSectionItem,
                  ]}
                  onPress={() => {
                    setCurrentSection(sIndex);
                    setCurrentMaterial(0);
                  }}
                >
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                </TouchableOpacity>
                {currentSection === sIndex && (
                  <View style={styles.materialsList}>
                    {section.materials.map((material, mIndex) => (
                      <TouchableOpacity
                        key={material.id}
                        style={[
                          styles.materialItem,
                          currentMaterial === mIndex && styles.activeMaterialItem,
                        ]}
                        onPress={() => setCurrentMaterial(mIndex)}
                      >
                        <MaterialIcons
                          name={
                            progress?.completedMaterials.includes(material.id)
                              ? 'check-circle'
                              : 'radio-button-unchecked'
                          }
                          size={20}
                          color={
                            progress?.completedMaterials.includes(material.id)
                              ? '#4CAF50'
                              : '#666'
                          }
                          style={styles.materialIcon}
                        />
                        <Text style={styles.materialTitle}>{material.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
        <View style={styles.mainContent}>
          {currentMaterialData && (
            <View style={styles.materialContent}>
              <Text style={styles.materialTitle}>{currentMaterialData.title}</Text>
              {renderMaterial(currentMaterialData)}
              <TouchableOpacity
                style={styles.completeButton}
                onPress={() => handleMaterialComplete(currentMaterialData.id)}
                disabled={progress?.completedMaterials.includes(currentMaterialData.id)}
              >
                <Text style={styles.completeButtonText}>
                  {progress?.completedMaterials.includes(currentMaterialData.id)
                    ? 'Completed'
                    : 'Mark as Complete'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
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
    flexDirection: 'row',
  },
  sidebar: {
    width: 250,
    backgroundColor: '#2A2A2A',
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
  sectionList: {
    flex: 1,
  },
  sectionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  activeSectionItem: {
    backgroundColor: '#3A3A3A',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  materialsList: {
    paddingLeft: 16,
  },
  materialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderLeftWidth: 2,
    borderLeftColor: 'transparent',
  },
  activeMaterialItem: {
    borderLeftColor: '#007AFF',
    backgroundColor: '#3A3A3A',
  },
  materialIcon: {
    marginRight: 8,
  },
  materialTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  mainContent: {
    flex: 1,
    padding: 24,
  },
  materialContent: {
    flex: 1,
  },
  videoContainer: {
    width: '100%',
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  textContent: {
    backgroundColor: '#2A2A2A',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  textMaterial: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
    marginLeft: 8,
  },
  completeButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
  },
});

export default CoursePage;
