import { useAppNavigation } from '@shared/lib/navigation';
import { PrimaryButton } from '@shared/ui';
import { ChevronRight, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DAY_PRESETS = [7, 15, 30, 90] as const;

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

export function DepositSetupScreen() {
  const { goBack, toDepositConfirm } = useAppNavigation();
  const [amountEth, setAmountEth] = useState('');
  const [days, setDays] = useState(15);
  const [showPicker, setShowPicker] = useState(false);
  const [customDays, setCustomDays] = useState('');

  const unlockDate = addDays(new Date(), days);
  const isValid = parseFloat(amountEth) > 0;

  const handleConfirm = () => {
    if (!isValid) {
      return;
    }
    toDepositConfirm({
      amountEth,
      unlockDate: unlockDate.toISOString(),
    });
  };

  const applyDays = (d: number) => {
    setDays(d);
    setShowPicker(false);
    setCustomDays('');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fcfcfc' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={{ flex: 1 }}>
          <View
            style={{
              paddingHorizontal: 20,
              height: 56,
              justifyContent: 'center',
            }}
          >
            <Pressable
              onPress={goBack}
              hitSlop={12}
            >
              <X
                size={24}
                color="#0f172b"
              />
            </Pressable>
          </View>

          <View
            style={{
              paddingHorizontal: 20,
              flex: 1,
              gap: 28,
              marginTop: 8,
            }}
          >
            <View style={{ gap: 20 }}>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: '700',
                  color: '#0f172b',
                  letterSpacing: -0.198,
                  lineHeight: 30.8,
                }}
              >
                얼마나 잠글까요?
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                <TextInput
                  style={{
                    fontSize: 24,
                    fontWeight: '400',
                    color: '#0f172b',
                    letterSpacing: -0.216,
                    lineHeight: 36,
                    minWidth: 60,
                    padding: 0,
                  }}
                  placeholder="0.0"
                  placeholderTextColor="#cad5e2"
                  keyboardType="decimal-pad"
                  value={amountEth}
                  onChangeText={setAmountEth}
                  autoFocus
                />
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: '400',
                    color: '#0f172b',
                    letterSpacing: -0.216,
                    lineHeight: 36,
                  }}
                >
                  ETH
                </Text>
              </View>
            </View>

            <Pressable
              style={{
                backgroundColor: '#f1f5f9',
                borderRadius: 8,
                paddingHorizontal: 20,
                paddingVertical: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onPress={() => setShowPicker(true)}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '400',
                  color: '#1d293d',
                  letterSpacing: -0.16,
                  lineHeight: 24,
                }}
              >
                {formatDate(unlockDate)}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '400',
                    color: '#1d293d',
                    letterSpacing: -0.16,
                    lineHeight: 24,
                  }}
                >
                  ({days}일간)
                </Text>
                <ChevronRight
                  size={18}
                  color="#1d293d"
                />
              </View>
            </Pressable>
          </View>

          <View style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
            <PrimaryButton
              label="확인"
              onPress={handleConfirm}
              variant={isValid ? 'primary' : 'secondary'}
            />
          </View>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}
          onPress={() => setShowPicker(false)}
        />
        <View
          style={{
            backgroundColor: 'white',
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 24,
            gap: 20,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: '#0f172b',
              textAlign: 'center',
              lineHeight: 25.2,
            }}
          >
            잠금 기간 선택
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {DAY_PRESETS.map(d => (
              <Pressable
                key={d}
                style={{
                  flex: 1,
                  backgroundColor: days === d ? '#2b7fff' : '#f1f5f9',
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: 'center',
                }}
                onPress={() => applyDays(d)}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '500',
                    color: days === d ? '#f8fafc' : '#1d293d',
                    lineHeight: 24,
                  }}
                >
                  {d}일
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <TextInput
              style={{
                flex: 1,
                backgroundColor: '#f1f5f9',
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
                color: '#0f172b',
              }}
              placeholder="직접 입력 (일)"
              placeholderTextColor="#62748e"
              keyboardType="number-pad"
              value={customDays}
              onChangeText={setCustomDays}
            />
            <Pressable
              style={{
                backgroundColor: '#2b7fff',
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}
              onPress={() => {
                const d = parseInt(customDays, 10);
                if (d > 0) {
                  applyDays(d);
                }
              }}
            >
              <Text style={{ fontSize: 16, color: '#f8fafc', fontWeight: '500' }}>적용</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
