import { StatusBar } from 'expo-status-bar';
import { router, Stack } from 'expo-router';
import { ApiProvider } from '@prometheus-fe/context';
import ChatToggleWrapper from '../components/chats/ChatToggleWrapper';
import './global.css';

export default function RootLayout() {
  return (
    <ApiProvider router={router}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="community" options={{ headerShown: false }} />
        <Stack.Screen name="group" options={{ headerShown: false }} />
        <Stack.Screen name="member" options={{ headerShown: false }} />
        <Stack.Screen name="(project)/project" options={{ headerShown: false }} />
        <Stack.Screen name="(project)/[projectID]/detail" options={{ headerShown: false }} />
        <Stack.Screen name="event" options={{ headerShown: false }} />
        <Stack.Screen name="landing" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      
      {/* Chat Toggle */}
      <ChatToggleWrapper />
      
      <StatusBar style="light" />
    </ApiProvider>
  );
}

