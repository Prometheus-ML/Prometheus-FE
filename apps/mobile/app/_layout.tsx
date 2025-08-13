import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import './global.css';

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

