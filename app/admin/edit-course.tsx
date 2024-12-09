import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import CustomHeader from '../components/CustomHeader';
import { apiClient } from '../utils/api';
import { Course, CourseSection, CourseMaterial } from '../types/Quiz';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const EditCoursePage = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course>({
    id: '',
    title: '',
    description: '',
    sections: [],
    difficulty: 'beginner',
    subject: '',
    isPublished: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    authorId: '', // This should be set from the authenticated user
  });
  const [loading, setLoading] = useState(id ? true : false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadCourse();
    }
  }, [id]);

  const loadCourse = async () => {
    try {
      const fetchedCourse = await apiClient.getCourseById(id as string);
      setCourse(fetchedCourse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = () => {
    setCourse(prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: Date.now().toString(), // Temporary ID for new section
          title: 'New Section',
          order: prev.sections.length + 1,
          materials: []
        }
      ]
    }));
  };

  const handleRemoveSection = (index: number) => {
    setCourse(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  };

  const handleAddMaterial = (sectionIndex: number) => {
    setCourse(prev => {
      const updatedSections = [...prev.sections];
      updatedSections[sectionIndex].materials.push({
        id: Date.now().toString(), // Temporary ID for new material
        title: 'New Material',
        type: 'text',
        content: '',
        order: updatedSections[sectionIndex].materials.length + 1
      });
      return { ...prev, sections: updatedSections };
    });
  };

  const handleRemoveMaterial = (sectionIndex: number, materialIndex: number) => {
    setCourse(prev => {
      const newSections = [...prev.sections];
      newSections[sectionIndex].materials = newSections[sectionIndex].materials.filter(
        (_, i) => i !== materialIndex
      );
      return { ...prev, sections: newSections };
    });
  };

  const handleUpdateMaterial = (
    sectionIndex: number,
    materialIndex: number,
    updates: Partial<CourseMaterial>
  ) => {
    setCourse(prev => {
      const newSections = [...prev.sections];
      newSections[sectionIndex].materials[materialIndex] = {
        ...newSections[sectionIndex].materials[materialIndex],
        ...updates,
      };
      return { ...prev, sections: newSections };
    });
  };

  const handleSave = async () => {
    try {
      setError(null);
      
      // Prepare course data
      const courseData = {
        title: course.title,
        description: course.description,
        difficulty: course.difficulty,
        subject: course.subject,
        sections: course.sections.map((section, sIndex) => ({
          title: section.title,
          order: sIndex + 1,
          materials: section.materials.map((material, mIndex) => ({
            title: material.title,
            type: material.type,
            content: material.content,
            duration: material.duration,
            order: mIndex + 1
          }))
        })),
        isPublished: course.isPublished
      };

      if (id) {
        await apiClient.updateCourse(id as string, courseData);
      } else {
        await apiClient.createCourse(courseData);
      }
      
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save course');
    }
  };

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

  return (
    <View style={styles.container}>
      <CustomHeader
        title={id ? 'Edit Course' : 'Create Course'}
        showBackButton
      />
      <ScrollView style={styles.content}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Course Title"
            placeholderTextColor="#999"
            value={course.title}
            onChangeText={title => setCourse(prev => ({ ...prev, title }))}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Course Description"
            placeholderTextColor="#999"
            value={course.description}
            onChangeText={description => setCourse(prev => ({ ...prev, description }))}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Subject</Text>
          <TextInput
            style={styles.input}
            placeholder="Course Subject"
            placeholderTextColor="#999"
            value={course.subject}
            onChangeText={subject => setCourse(prev => ({ ...prev, subject }))}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Difficulty</Text>
          <Picker
            selectedValue={course.difficulty}
            onValueChange={difficulty =>
              setCourse(prev => ({ ...prev, difficulty: difficulty as any }))
            }
            style={styles.picker}
          >
            <Picker.Item label="Beginner" value="beginner" />
            <Picker.Item label="Intermediate" value="intermediate" />
            <Picker.Item label="Advanced" value="advanced" />
          </Picker>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.label}>Sections</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddSection}>
              <MaterialIcons name="add" size={24} color="#007AFF" />
              <Text style={styles.addButtonText}>Add Section</Text>
            </TouchableOpacity>
          </View>

          {course.sections.map((section, sectionIndex) => (
            <View key={section.id} style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <TextInput
                  style={styles.sectionTitleInput}
                  placeholder="Section Title"
                  placeholderTextColor="#999"
                  value={section.title}
                  onChangeText={title => {
                    const newSections = [...course.sections];
                    newSections[sectionIndex].title = title;
                    setCourse(prev => ({ ...prev, sections: newSections }));
                  }}
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveSection(sectionIndex)}
                >
                  <MaterialIcons name="delete" size={24} color="#F44336" />
                </TouchableOpacity>
              </View>

              <View style={styles.materialsList}>
                {section.materials.map((material, materialIndex) => (
                  <View key={material.id} style={styles.materialCard}>
                    <TextInput
                      style={styles.materialTitleInput}
                      placeholder="Material Title"
                      placeholderTextColor="#999"
                      value={material.title}
                      onChangeText={title =>
                        handleUpdateMaterial(sectionIndex, materialIndex, { title })
                      }
                    />
                    <View style={styles.materialTypeContainer}>
                      <Picker
                        selectedValue={material.type}
                        onValueChange={type =>
                          handleUpdateMaterial(sectionIndex, materialIndex, {
                            type: type as any,
                          })
                        }
                        style={styles.materialTypePicker}
                      >
                        <Picker.Item label="Text" value="text" />
                        <Picker.Item label="Video" value="video" />
                        <Picker.Item label="PDF" value="pdf" />
                        <Picker.Item label="Link" value="link" />
                      </Picker>
                    </View>
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder={
                        material.type === 'text'
                          ? 'Content'
                          : 'URL'
                      }
                      placeholderTextColor="#999"
                      value={material.content}
                      onChangeText={content =>
                        handleUpdateMaterial(sectionIndex, materialIndex, { content })
                      }
                      multiline={material.type === 'text'}
                      numberOfLines={material.type === 'text' ? 4 : 1}
                    />
                    <TouchableOpacity
                      style={styles.removeMaterialButton}
                      onPress={() => handleRemoveMaterial(sectionIndex, materialIndex)}
                    >
                      <MaterialIcons name="delete" size={20} color="#F44336" />
                      <Text style={styles.removeMaterialText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  style={styles.addMaterialButton}
                  onPress={() => handleAddMaterial(sectionIndex)}
                >
                  <MaterialIcons name="add" size={20} color="#007AFF" />
                  <Text style={styles.addMaterialText}>Add Material</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <MaterialIcons name="save" size={24} color="#FFF" />
            <Text style={styles.saveButtonText}>Save Course</Text>
          </TouchableOpacity>
        </View>
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
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#222',
    borderRadius: 8,
    padding: 12,
    color: '#FFF',
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#222',
    borderRadius: 8,
    marginBottom: 12,
  },
  pickerLabel: {
    color: '#999',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  picker: {
    color: '#FFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitleInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginRight: 12,
  },
  removeButton: {
    padding: 4,
  },
  materialsList: {
    marginTop: 12,
  },
  materialCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  materialTitleInput: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 8,
  },
  materialTypeContainer: {
    backgroundColor: '#333',
    borderRadius: 6,
    marginBottom: 8,
  },
  materialTypePicker: {
    color: '#FFF',
  },
  removeMaterialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  removeMaterialText: {
    color: '#F44336',
    fontSize: 14,
    marginLeft: 4,
  },
  addMaterialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  addMaterialText: {
    color: '#007AFF',
    fontSize: 14,
    marginLeft: 4,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  errorContainer: {
    backgroundColor: '#FF6B6B22',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageText: {
    color: '#999',
    fontSize: 16,
  },
});

export default EditCoursePage;
