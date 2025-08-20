import { StatusBar } from 'expo-status-bar';
import { router, Stack } from 'expo-router';
import { ApiProvider } from '@prometheus-fe/context';
import './global.css';

export default function RootLayout() {
  return (
    <ApiProvider router={router}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ApiProvider>
  );
}

