import { useWalletStore } from '@entities/wallet';
import { useAppNavigation } from '@shared/lib/navigation';
import { publicClient } from '@shared/lib/web3/client';
import { PrimaryButton } from '@shared/ui';
import { ChevronRight, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Address } from 'viem';
import { formatEther } from 'viem';

const DAY_PRESETS = [7, 15, 30, 90] as const;
const SHEET_HEIGHT = 340;
const DISMISS_THRESHOLD = 80;

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
  const address = useWalletStore(s => s.address);
  const [amountEth, setAmountEth] = useState('');
  const [days, setDays] = useState(15);
  const [showPicker, setShowPicker] = useState(false);
  const [customDays, setCustomDays] = useState('');
  const [balance, setBalance] = useState<string | null>(null);

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const keyboardHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!address) {
      return;
    }
    publicClient
      .getBalance({ address: address as Address })
      .then(val => setBalance(formatEther(val)))
      .catch(() => {});
  }, [address]);

  useEffect(() => {
    if (!showPicker) {
      return;
    }
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, e => {
      Animated.timing(keyboardHeight, {
        toValue: e.endCoordinates.height,
        duration: e.duration ?? 250,
        useNativeDriver: true,
      }).start();
    });
    const hideSub = Keyboard.addListener(hideEvent, e => {
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: e.duration ?? 250,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [showPicker, keyboardHeight]);

  const unlockDate = addDays(new Date(), days);
  const parsedAmount = parseFloat(amountEth);
  const parsedBalance = balance !== null ? parseFloat(balance) : null;
  const exceedsBalance = parsedBalance !== null && parsedAmount > parsedBalance;
  const isValid = parsedAmount > 0 && !exceedsBalance;

  const handleConfirm = () => {
    if (!isValid) {
      return;
    }
    toDepositConfirm({
      amountEth,
      unlockDate: unlockDate.toISOString(),
    });
  };

  const openPicker = () => {
    Keyboard.dismiss();
    setShowPicker(true);
    Animated.timing(backdropOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(sheetTranslateY, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    });
  };

  const closePicker = () => {
    Animated.parallel([
      Animated.timing(sheetTranslateY, {
        toValue: SHEET_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowPicker(false);
      sheetTranslateY.setValue(SHEET_HEIGHT);
      backdropOpacity.setValue(0);
      keyboardHeight.setValue(0);
    });
  };

  const applyDays = (d: number) => {
    setDays(d);
    setCustomDays('');
    closePicker();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dy }) => dy > 8,
      onPanResponderMove: (_, { dy }) => {
        if (dy > 0) {
          sheetTranslateY.setValue(dy);
        }
      },
      onPanResponderRelease: (_, { dy }) => {
        if (dy > DISMISS_THRESHOLD) {
          closePicker();
        } else {
          Animated.spring(sheetTranslateY, {
            toValue: 0,
            tension: 65,
            friction: 11,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fcfcfc' }}>
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
          accessible={false}
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={{ flex: 1 }}>
              <View style={{ paddingHorizontal: 20, height: 56, justifyContent: 'center' }}>
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

              <View style={{ paddingHorizontal: 20, flex: 1, gap: 28, marginTop: 8 }}>
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

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <TextInput
                      style={{
                        fontSize: 24,
                        fontWeight: '400',
                        color: '#0f172b',
                        letterSpacing: -0.216,
                        lineHeight: 36,
                        minWidth: 60,
                        flex: 0,
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

                  {balance !== null && (
                    <View style={{ gap: 6 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Text style={{ fontSize: 14, color: '#62748e' }}>
                          잔액: {parseFloat(balance).toFixed(4)} ETH
                        </Text>
                        <Pressable
                          onPress={() => setAmountEth(parseFloat(balance).toFixed(6))}
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 5,
                            backgroundColor: '#2b7fff',
                            borderRadius: 6,
                          }}
                        >
                          <Text style={{ fontSize: 13, color: '#fff', fontWeight: '700' }}>
                            최대
                          </Text>
                        </Pressable>
                      </View>
                      {exceedsBalance && (
                        <Text style={{ fontSize: 13, color: '#ef4444' }}>
                          잔액을 초과할 수 없습니다
                        </Text>
                      )}
                    </View>
                  )}
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
                  onPress={openPicker}
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
        </TouchableWithoutFeedback>
      </SafeAreaView>

      {/* 잠금 기간 바텀시트 */}
      {showPicker && (
        <View
          style={StyleSheet.absoluteFillObject}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: 'rgba(0,0,0,0.5)', opacity: backdropOpacity },
            ]}
          />
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={closePicker}
          />
          <Animated.View
            style={[
              styles.sheet,
              {
                transform: [{ translateY: Animated.subtract(sheetTranslateY, keyboardHeight) }],
              },
            ]}
          >
            {/* 드래그 핸들 */}
            <View
              style={{ alignItems: 'center', paddingTop: 16, paddingBottom: 8 }}
              {...panResponder.panHandlers}
            >
              <View
                style={{ width: 33, height: 4, backgroundColor: '#f1f5f9', borderRadius: 99 }}
              />
            </View>

            {/* 콘텐츠 */}
            <View style={{ paddingHorizontal: 20, paddingBottom: 32, gap: 24 }}>
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

              {/* 프리셋 칩 */}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {DAY_PRESETS.map(d => (
                  <Pressable
                    key={d}
                    style={[styles.chip, days === d && styles.chipSelected]}
                    onPress={() => applyDays(d)}
                  >
                    <Text style={[styles.chipText, days === d && styles.chipTextSelected]}>
                      {d}일
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* 구분선 + 직접 입력 */}
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ flex: 1, height: 1, backgroundColor: '#f1f5f9' }} />
                  <Text style={{ fontSize: 12, color: '#94a3b8', fontWeight: '500' }}>
                    직접 입력
                  </Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: '#f1f5f9' }} />
                </View>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TextInput
                    style={styles.customInput}
                    placeholder="기간 입력 (일)"
                    placeholderTextColor="#94a3b8"
                    keyboardType="number-pad"
                    value={customDays}
                    onChangeText={setCustomDays}
                  />
                  <Pressable
                    style={styles.applyButton}
                    onPress={() => {
                      const d = parseInt(customDays, 10);
                      if (d > 0) {
                        applyDays(d);
                      }
                    }}
                  >
                    <Text style={styles.applyButtonText}>적용</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  chip: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: '#2b7fff',
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1d293d',
    lineHeight: 22,
  },
  chipTextSelected: {
    color: '#ffffff',
  },
  customInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#0f172b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  applyButton: {
    height: 48,
    paddingHorizontal: 20,
    backgroundColor: '#2b7fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '600',
  },
});
