import React from 'react';
import { View, StyleSheet } from 'react-native';

interface YouTubePlayerProps {
  videoId: string;
  height?: number;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId, height = 250 }) => {
  // Extract video ID from full URL if needed
  const getVideoId = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      return match?.[1] || url;
    }
    return url;
  };

  const cleanVideoId = getVideoId(videoId);
  
  // Create embedded URL
  const embedUrl = `https://www.youtube.com/embed/${cleanVideoId}?playsinline=1&rel=0`;

  return (
    <View style={[styles.container, { height }]}>
      <iframe
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: 8,
        }}
        src={embedUrl}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
  }
});

export default YouTubePlayer;
