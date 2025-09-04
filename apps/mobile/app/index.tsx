import React, { useEffect } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '@prometheus-fe/stores';

export default function Home() {
  const { isAuthenticated, user, logout } = useAuthStore();

  useEffect(() => {
    // 인증 상태에 따라 적절한 화면으로 리디렉션
    // 인증된 사용자는 인덱스 화면에서 메인 콘텐츠를 볼 수 있음
    // if (isAuthenticated()) {
    //   router.replace('/main');
    // }
  }, [isAuthenticated]);

  const handleLogin = () => {
    // 로그인 화면으로 네비게이션
    router.push('/(auth)/login');
  };

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
              router.replace('/');
            } catch (error) {
              Alert.alert('로그아웃 오류', '로그아웃 중 오류가 발생했습니다.');
            }
          }
        }
      ]
    );
  };

  const getDaysCount = () => {
    if (!user?.activity_start_date) return 0;
    const startDate = new Date(user.activity_start_date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysCount = getDaysCount();

  const handleCardPress = (route: string) => {
    router.replace(route);
  };

  //if (isAuthenticated() && user) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logo} />
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Prometheus</Text>
              <Text style={styles.subtitle}>대학생 인공지능 단체</Text>
            </View>
          </View>
          
          {/* Right: Icons */}
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <FontAwesome name="bell" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <FontAwesome name="user" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
              <FontAwesome name="sign-out" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Personalized Greeting */}
          <View style={styles.greetingCard}>
            <Text style={styles.greetingTitle}>
              <Text style={styles.userName}>{user?.name}</Text> 님은{'\n'}
              <Text style={styles.highlight}>PROMETHEUS</Text>와{' '}
              <Text style={styles.userName}>{daysCount}</Text>일째
            </Text>
            <View style={styles.genBadge}>
              <Text style={styles.genText}>{user?.gen}기</Text>
            </View>
          </View>

          {/* Feature Cards Grid */}
          <View style={styles.cardsGrid}>
            {/* 출석하기 - 2x2 크기 */}
            <TouchableOpacity 
              style={[styles.card, styles.attendanceCard]} 
              onPress={() => handleCardPress('/event')}
            >
              <View style={styles.iconContainer}>
                <FontAwesome name="check" size={28} color="#ffa282" />
              </View>
              <Text style={styles.cardTitle}>출석하기</Text>
              <Text style={styles.cardSubtitle}>정기 출석 체크</Text>
            </TouchableOpacity>

            {/* 모임/스터디 */}
            <TouchableOpacity 
              style={styles.card} 
              onPress={() => handleCardPress('/group')}
            >
              <View style={styles.iconContainer}>
                <FontAwesome name="users" size={20} color="#ffa282" />
              </View>
              <Text style={styles.cardTitle}>모임/스터디</Text>
              <Text style={styles.cardSubtitle}>팀 활동 관리</Text>
            </TouchableOpacity>

            {/* 커뮤니티 */}
            <TouchableOpacity 
              style={styles.card} 
              onPress={() => handleCardPress('/community')}
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
              onPress={() => handleCardPress('/member')}
            >
              <View style={styles.iconContainer}>
                <FontAwesome name="users" size={20} color="#ffa282" />
              </View>
              <Text style={styles.cardTitle}>멤버</Text>
              <Text style={styles.cardSubtitle}>멤버 정보</Text>
            </TouchableOpacity>

            {/* 프로젝트 */}
            <TouchableOpacity 
              style={styles.card} 
              onPress={() => handleCardPress('/project')}
            >
              <View style={styles.iconContainer}>
                <FontAwesome name="code" size={20} color="#ffa282" />
              </View>
              <Text style={styles.cardTitle}>프로젝트</Text>
              <Text style={styles.cardSubtitle}>프로젝트 관리</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  //}

  // Non-authenticated view
  // return (
  //   <View style={styles.container}>
  //     {/* Header */}
  //     <View style={styles.header}>
  //       <View style={styles.logoContainer}>
  //         <View style={styles.logo} />
  //         <View style={styles.titleContainer}>
  //           <Text style={styles.title}>Prometheus</Text>
  //           <Text style={styles.subtitle}>대학생 인공지능 단체</Text>
  //         </View>
  //       </View>
  //     </View>

  //     {/* Main Content */}
  //     <View style={styles.content}>
  //       {/* Welcome Message */}
  //       <View style={styles.welcomeCard}>
  //         <Text style={styles.welcomeTitle}>프로메테우스에 오신 것을 환영합니다</Text>
  //         <Text style={styles.welcomeText}>
  //           인공지능을 통해 미래를 만들어가는 대학생들의 커뮤니티입니다
  //         </Text>
  //       </View>

  //       {/* Login Section */}
  //       <View style={styles.loginCard}>
  //         <Text style={styles.loginTitle}>로그인하세요</Text>
  //         <Text style={styles.loginText}>프로메테우스의 모든 기능을 이용해보세요</Text>
  //         <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
  //           <Text style={styles.loginButtonText}>로그인하기</Text>
  //         </TouchableOpacity>
  //       </View>

  //       {/* Feature Cards */}
  //       <View style={styles.cardsContainer}>
  //         {/* About Card */}
  //         <TouchableOpacity style={styles.card} onPress={() => handleCardPress('/landing')}>
  //           <View style={styles.iconContainer}>
  //             <FontAwesome name="lightbulb-o" size={20} color="#ffa282" />
  //           </View>
  //           <Text style={styles.cardTitle}>프로메테우스</Text>
  //           <Text style={styles.cardSubtitle}>동아리 소개</Text>
  //         </TouchableOpacity>

  //         {/* Members Card */}
  //         <TouchableOpacity style={styles.card} onPress={() => handleCardPress('/member')}>
  //           <View style={styles.iconContainer}>
  //             <FontAwesome name="users" size={20} color="#ffa282" />
  //           </View>
  //           <Text style={styles.cardTitle}>멤버</Text>
  //           <Text style={styles.cardSubtitle}>멤버 소개</Text>
  //         </TouchableOpacity>

  //         {/* Projects Card */}
  //         <TouchableOpacity style={styles.card} onPress={() => handleCardPress('/project')}>
  //           <View style={styles.iconContainer}>
  //             <FontAwesome name="code" size={20} color="#ffa282" />
  //           </View>
  //           <Text style={styles.cardTitle}>프로젝트</Text>
  //           <Text style={styles.cardSubtitle}>프로젝트 소개</Text>
  //         </TouchableOpacity>
  //       </View>
  //     </View>
  //   </View>
  // );
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
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
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
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  attendanceCard: {
    minHeight: 120,
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

