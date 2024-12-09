import { Stack } from "expo-router";
import { AuthProvider } from "./context/AuthContext";
import { PaperProvider, MD3DarkTheme } from 'react-native-paper';

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#007AFF',
    background: '#1A1A1A',
    surface: '#2A2A2A',
    error: '#FF6B6B',
  },
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <PaperProvider theme={darkTheme}>
        <Stack screenOptions={{ headerShown: false }} />
      </PaperProvider>
    </AuthProvider>
  );
}
