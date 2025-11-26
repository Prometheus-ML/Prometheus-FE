import React from 'react';
import { usePathname } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@prometheus-fe/stores';
import { Ionicons } from '@expo/vector-icons';

interface ChatToggleProps {
  onToggle: (isOpen: boolean) => void;
  isOpen: boolean;
}

const ChatToggle: React.FC<ChatToggleProps> = ({ onToggle, isOpen }) => {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const insets = useSafeAreaInsets();
  
  // 루트 페이지(/)에서는 ChatToggle을 숨김
  if (pathname === '/(auth)/login' || pathname === '/landing' || !user) {
    return null;
  }

  const handlePress = () => {
    onToggle(!isOpen);
  };

  return (
    <View 
      className="absolute right-6 z-50"
      style={{ bottom: 24 + insets.bottom }}
    >
      <TouchableOpacity
        onPress={handlePress}
        className={`
          w-14 h-14 rounded-full shadow-lg
          flex items-center justify-center border-2
          ${isOpen 
            ? 'bg-[#8B0000]/20 border-[#c2402a] transform scale-110' 
            : 'bg-[#8B0000]/20 border-[#c2402a]/30 hover:scale-110'
          }
        `}
        activeOpacity={0.8}
        accessibilityLabel={isOpen ? '채팅 닫기' : '채팅 열기'}
      >
        <Ionicons
          name={isOpen ? 'close' : 'chatbubble'}
          size={24}
          color="#ffa282"
        />
      </TouchableOpacity>
    </View>
  );
};

export default ChatToggle;
