import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@prometheus-fe/stores';
import { useMember } from '@prometheus-fe/hooks';

export default function Home() {
  const { isAuthenticated, user, logout, canAccessAdministrator } = useAuthStore();
  const { myProfile, getMyProfile, isLoadingProfile } = useMember();
  const [daysCount, setDaysCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = async () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '로그아웃', 
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              router.push('/');
            } catch (error) {
              Alert.alert('로그아웃 오류', '로그아웃 중 오류가 발생했습니다.');
            }
          }
        }
      ]
    );
  };

  // Add loading effect similar to web version
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Fetch user profile and calculate days count
  useEffect(() => {
    if (!isAuthenticated()) return;
    
    getMyProfile()
      .then((userData) => {
        if (userData.activity_start_date) {
          const startDate = new Date(userData.activity_start_date);
          const today = new Date();
          const diffTime = Math.abs(today.getTime() - startDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setDaysCount(diffDays);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch user profile:', error);
      });
  }, [isAuthenticated, getMyProfile]);

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        {/* Header Skeleton */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={[styles.logo, styles.skeleton]} />
            <View style={styles.titleContainer}>
              <View style={[styles.skeletonText, { width: 120, height: 20, marginBottom: 4 }]} />
              <View style={[styles.skeletonText, { width: 140, height: 16 }]} />
            </View>
          </View>
          <View style={styles.headerIcons}>
            <View style={[styles.iconButton, styles.skeleton]} />
            <View style={[styles.iconButton, styles.skeleton]} />
            <View style={[styles.iconButton, styles.skeleton]} />
          </View>
        </View>

        {/* Content Skeleton */}
        <ScrollView style={styles.content}>
          <View style={[styles.greetingCard, styles.skeleton]}>
            <View style={[styles.skeletonText, { width: 200, height: 20, marginBottom: 8 }]} />
            <View style={[styles.skeletonText, { width: 150, height: 16 }]} />
          </View>
          
          <View style={styles.cardsGrid}>
            {[...Array(6)].map((_, index) => (
              <View key={index} style={[styles.card, styles.skeleton]}>
                <View style={[styles.iconContainer, styles.skeleton]} />
                <View style={[styles.skeletonText, { width: 80, height: 16, marginTop: 8 }]} />
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/images/icon.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Prometheus</Text>
            <Text style={styles.subtitle}>대학생 인공지능 단체</Text>
          </View>
        </View>
        
        {/* Right: Icons */}
        <View style={styles.headerIcons}>
          {canAccessAdministrator() && (
            <TouchableOpacity 
              style={styles.adminButton}
              onPress={() => router.push('/admin')}
            >
              <Text style={styles.adminButtonText}>Admin</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.iconButton}>
            <FontAwesome name="bell" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => router.push('/profile')}
          >
            <FontAwesome name="user" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          {isAuthenticated() && (
            <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
              <FontAwesome name="sign-out" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {isAuthenticated() && myProfile ? (
          <>
            {/* Personalized Greeting */}
            <View style={styles.greetingCard}>
              <Text style={styles.greetingTitle}>
                <Text style={styles.userName}>{myProfile?.name}</Text> 님은{'\n'}
                <Text style={styles.highlight}>PROMETHEUS</Text>와{' '}
                <Text style={styles.userName}>{daysCount}</Text>일째
              </Text>
              <View style={styles.genBadge}>
                <Text style={styles.genText}>{myProfile?.gen || 0}기</Text>
              </View>
            </View>

            {/* Feature Cards Grid - Mobile optimized 2x3 layout */}
            <View style={styles.cardsGrid}>
              {/* Row 1 */}
              <View style={styles.cardRow}>
                {/* 출석하기 - Larger card */}
                <TouchableOpacity 
                  style={[styles.card, styles.attendanceCard]} 
                  onPress={() => router.push('/event')}
                >
                  <View style={styles.iconContainer}>
                    <FontAwesome name="check" size={24} color="#ffa282" />
                  </View>
                  <Text style={styles.cardTitle}>출석하기</Text>
                  <Text style={styles.cardSubtitle}>정기 출석 체크</Text>
                </TouchableOpacity>

                {/* 모임/스터디 */}
                <TouchableOpacity 
                  style={styles.card} 
                  onPress={() => router.push('/group')}
                >
                  <View style={styles.iconContainer}>
                    <FontAwesome name="users" size={20} color="#ffa282" />
                  </View>
                  <Text style={styles.cardTitle}>모임/스터디</Text>
                  <Text style={styles.cardSubtitle}>팀 활동 관리</Text>
                </TouchableOpacity>
              </View>

              {/* Row 2 */}
              <View style={styles.cardRow}>
                {/* 커뮤니티 */}
                <TouchableOpacity 
                  style={styles.card} 
                  onPress={() => router.push('/community')}
                >
                  <View style={styles.iconContainer}>
                    <FontAwesome name="comments" size={20} color="#ffa282" />
                  </View>
                  <Text style={styles.cardTitle}>커뮤니티</Text>
                  <Text style={styles.cardSubtitle}>소통과 공유</Text>
                </TouchableOpacity>

                {/* 멤버 */}
                <TouchableOpacity 
                  style={styles.card}
                  onPress={() => router.push('/member')}
                >
                  <View style={styles.iconContainer}>
                    <FontAwesome name="users" size={20} color="#ffa282" />
                  </View>
                  <Text style={styles.cardTitle}>멤버</Text>
                  <Text style={styles.cardSubtitle}>멤버 정보</Text>
                </TouchableOpacity>
              </View>

              {/* Row 3 */}
              <View style={styles.cardRow}>
                {/* 프로젝트 */}
                <TouchableOpacity 
                  style={[styles.card, styles.fullWidthCard]} 
                  onPress={() => router.push('/project')}
                >
                  <View style={styles.iconContainer}>
                    <FontAwesome name="code" size={20} color="#ffa282" />
                  </View>
                  <Text style={styles.cardTitle}>프로젝트</Text>
                  <Text style={styles.cardSubtitle}>프로젝트 관리</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Non-authenticated view */}
            <View style={styles.loginCard}>
              <Text style={styles.loginTitle}>로그인하세요</Text>
              <Text style={styles.loginText}>프로메테우스의 모든 기능을 이용해보세요</Text>
              <TouchableOpacity 
                style={styles.loginButton} 
                onPress={() => router.push('/(auth)/login')}
              >
                <Text style={styles.loginButtonText}>로그인하기</Text>
              </TouchableOpacity>
            </View>

            {/* Non-authenticated cards */}
            <View style={styles.cardsGrid}>
              <View style={styles.cardRow}>
                {/* 프로메테우스 소개 */}
                <TouchableOpacity 
                  style={styles.card} 
                  onPress={() => router.push('/landing')}
                >
                  <View style={styles.iconContainer}>
                    <FontAwesome name="lightbulb-o" size={20} color="#ffa282" />
                  </View>
                  <Text style={styles.cardTitle}>프로메테우스</Text>
                  <Text style={styles.cardSubtitle}>동아리 소개</Text>
                </TouchableOpacity>

                {/* 멤버 소개 */}
                <TouchableOpacity 
                  style={styles.card} 
                  onPress={() => router.push('/member')}
                >
                  <View style={styles.iconContainer}>
                    <FontAwesome name="users" size={20} color="#ffa282" />
                  </View>
                  <Text style={styles.cardTitle}>멤버</Text>
                  <Text style={styles.cardSubtitle}>멤버 소개</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cardRow}>
                {/* 프로젝트 소개 */}
                <TouchableOpacity 
                  style={[styles.card, styles.fullWidthCard]} 
                  onPress={() => router.push('/project')}
                >
                  <View style={styles.iconContainer}>
                    <FontAwesome name="code" size={20} color="#ffa282" />
                  </View>
                  <Text style={styles.cardTitle}>프로젝트</Text>
                  <Text style={styles.cardSubtitle}>프로젝트 소개</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 80,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    maxWidth: '70%',
  },
  logo: {
    width: 40,
    height: 40,
    backgroundColor: '#333',
    borderRadius: 8,
  },
  titleContainer: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#e0e0e0',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 120,
  },
  iconButton: {
    padding: 6,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminButton: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#c2402a',
  },
  adminButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Skeleton loading styles
  skeleton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  skeletonText: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: 'rgba(139, 0, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(194, 64, 42, 0.3)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 13,
    color: '#e0e0e0',
    textAlign: 'center',
    lineHeight: 18,
  },
  loginCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  loginText: {
    fontSize: 13,
    color: '#e0e0e0',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  loginButton: {
    backgroundColor: '#8B0000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c2402a',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  greetingCard: {
    backgroundColor: 'rgba(139, 0, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(194, 64, 42, 0.3)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  greetingTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  userName: {
    color: '#FFFFFF',
  },
  highlight: {
    fontWeight: 'bold',
    color: '#FF4500',
  },
  genBadge: {
    backgroundColor: 'rgba(139, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(194, 64, 42, 0.3)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  genText: {
    color: '#ffa282',
    fontSize: 14,
  },
  cardsContainer: {
    gap: 12,
  },
  cardsGrid: {
    gap: 12,
    marginTop: 20,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
    flex: 1,
  },
  attendanceCard: {
    minHeight: 120,
    flex: 1.2, // Make attendance card slightly larger
  },
  fullWidthCard: {
    flex: 1,
    minHeight: 100,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(139, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(194, 64, 42, 0.3)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#e0e0e0',
  },
});

