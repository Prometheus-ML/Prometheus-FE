'use client';

import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { MemberSelector } from './SearchMemberBar';
import { MemberSummaryResponse } from '@prometheus-fe/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUserPlus, faEdit } from '@fortawesome/free-solid-svg-icons';

interface Member {
  id: string;
  member_id: string;
  role?: string | null;
  contribution?: string | null;
}

interface AddMemberModalProps {
  show: boolean;
  mode: 'add' | 'edit';
  member?: Member | null;
  onClose: () => void;
  onSubmit: (member: any) => void;
}

export default function AddMemberModal({ show, mode, member, onClose, onSubmit }: AddMemberModalProps) {
  const [formData, setFormData] = useState({
    id: '',
    member_id: '',
    role: '',
    contribution: ''
  });
  const [selectedMember, setSelectedMember] = useState<MemberSummaryResponse | null>(null);

  useEffect(() => {
    if (member) {
      setFormData({
        id: member.id || '',
        member_id: member.member_id || '',
        role: member.role || '',
        contribution: member.contribution || ''
      });
    } else {
      setFormData({
        id: '',
        member_id: '',
        role: '',
        contribution: ''
      });
      setSelectedMember(null);
    }
  }, [member, show]);

  // 멤버 선택 핸들러
  const handleMemberSelect = (member: MemberSummaryResponse) => {
    setSelectedMember(member);
    setFormData(prev => ({ ...prev, member_id: member.id }));
  };

  // 멤버 선택 해제 핸들러
  const handleMemberDeselect = () => {
    setSelectedMember(null);
    setFormData(prev => ({ ...prev, member_id: '' }));
  };

  const handleSubmit = () => {
    if (!formData.member_id) {
      Alert.alert('입력 오류', '멤버를 선택해주세요.');
      return;
    }

    const payload = {
      id: formData.id || undefined,
      member_id: formData.member_id,
      role: formData.role || undefined,
      contribution: formData.contribution || undefined
    };
    onSubmit(payload);
  };

  if (!show) return null;

  return (
    <Modal visible={show} transparent animationType="slide">
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white/10 border-t border-white/20 rounded-t-lg max-h-3/4">
          {/* 헤더 */}
          <View className="flex-row items-center justify-between p-4 border-b border-white/20">
            <View className="flex-row items-center">
              <FontAwesomeIcon 
                icon={mode === 'add' ? faUserPlus : faEdit} 
                color="white" 
              />
              <Text className="text-lg font-semibold text-white ml-2">
                {mode === 'add' ? '멤버 추가' : '멤버 수정'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2">
              <FontAwesomeIcon icon={faTimes} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            <View className="space-y-4">
              {/* 멤버 검색 및 선택 */}
              <View>
                <Text className="text-white text-sm font-medium mb-2">멤버 선택 *</Text>
                <MemberSelector
                  onMemberSelect={handleMemberSelect}
                  onMemberDeselect={handleMemberDeselect}
                  placeholder="멤버 이름으로 검색하세요..."
                  showSelectedMember={true}
                />
              </View>
              
              {/* 역할 입력 */}
              <View>
                <Text className="text-white text-sm font-medium mb-2">역할</Text>
                <TextInput
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
                  placeholder="예: 팀장, 팀원, 기획자, 개발자 등"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={formData.role}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, role: text }))}
                />
              </View>

              {/* 기여 내용 입력 */}
              <View>
                <Text className="text-white text-sm font-medium mb-2">기여 내용</Text>
                <TextInput
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white"
                  placeholder="100자 이내로 기여 내용을 입력하세요"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={formData.contribution}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, contribution: text }))}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  maxLength={100}
                />
                <Text className="text-gray-400 text-xs mt-1 text-right">
                  {formData.contribution.length}/100
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* 하단 버튼들 */}
          <View className="p-4 border-t border-white/20">
            <View className="flex-row space-x-2">
              <TouchableOpacity
                className="flex-1 bg-white/10 border border-white/20 rounded-lg py-3"
                onPress={onClose}
              >
                <Text className="text-white text-center font-semibold">취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 rounded-lg py-3 ${
                  formData.member_id 
                    ? 'bg-red-600' 
                    : 'bg-gray-600'
                }`}
                onPress={handleSubmit}
                disabled={!formData.member_id}
              >
                <Text className="text-white text-center font-semibold">저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}