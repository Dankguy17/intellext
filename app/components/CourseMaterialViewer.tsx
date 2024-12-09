import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import Markdown from 'react-native-markdown-display';
import YouTubePlayer from './YouTubePlayer';
import { CourseMaterial } from '../types/Quiz';

interface CourseMaterialViewerProps {
  material: CourseMaterial;
}

const CourseMaterialViewer: React.FC<CourseMaterialViewerProps> = ({ material }) => {
  const renderContent = () => {
    switch (material.type) {
      case 'video':
        if (material.content.includes('youtube.com') || material.content.includes('youtu.be')) {
          return <YouTubePlayer videoId={material.content} />;
        }
        return (
          <video 
            controls 
            style={{ width: '100%', height: 250, borderRadius: 8 }}
            src={material.content}
          >
            Your browser does not support the video tag.
          </video>
        );
      
      case 'text':
        return (
          <ScrollView style={styles.textContainer}>
            <Markdown
              style={{
                body: styles.markdownBody,
                heading1: styles.heading1,
                heading2: styles.heading2,
                heading3: styles.heading3,
                paragraph: styles.paragraph,
                list_item: styles.listItem,
                bullet_list: styles.list,
                ordered_list: styles.list,
                code_inline: styles.inlineCode,
                code_block: styles.codeBlock,
                fence: styles.codeBlock,
                blockquote: styles.blockquote,
              }}
            >
              {material.content}
            </Markdown>
          </ScrollView>
        );
      
      case 'pdf':
        return (
          <iframe
            src={material.content}
            style={{
              width: '100%',
              height: 500,
              border: 'none',
              borderRadius: 8,
            }}
            title="PDF Viewer"
          />
        );
      
      case 'link':
        return (
          <iframe
            src={material.content}
            style={{
              width: '100%',
              height: 500,
              border: 'none',
              borderRadius: 8,
            }}
            title="External Content"
          />
        );
      
      default:
        return <Text style={styles.text}>Unsupported material type</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{material.title}</Text>
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    padding: 16,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  textContainer: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 16,
  },
  markdownBody: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
  },
  paragraph: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  heading1: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    marginTop: 16,
  },
  heading2: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 16,
  },
  heading3: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 16,
  },
  list: {
    color: '#FFFFFF',
    marginBottom: 16,
    paddingLeft: 24,
  },
  listItem: {
    color: '#FFFFFF',
    marginBottom: 8,
  },
  inlineCode: {
    backgroundColor: '#3A3A3A',
    padding: 4,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  codeBlock: {
    backgroundColor: '#3A3A3A',
    padding: 16,
    borderRadius: 8,
    fontFamily: 'monospace',
    fontSize: 14,
    marginBottom: 16,
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#666',
    paddingLeft: 16,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 16,
    marginBottom: 16,
    fontStyle: 'italic',
    color: '#CCC',
  },
});

export default CourseMaterialViewer;
