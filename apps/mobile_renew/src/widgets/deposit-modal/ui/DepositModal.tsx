import { useDeposit } from "@/features/deposit";
import { AmountInput, common, gray } from "@/shared";
import { DateSelector } from "@/shared/ui/DateSelector";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const DepositForm = () => {
  const { formState, actions, status } = useDeposit();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>얼마나 잠글까요?</Text>
      <AmountInput 
        value={formState.amount}
        onChangeText={actions.setAmount}
        onMaxPress={actions.handleMax}
      />

      <Text style={[styles.label, { marginTop: 24 }]}>언제까지 (최소 7일)</Text>
      <DateSelector
        date={formState.selectedDate}
        duration={formState.daysDuration}
        isVisible={formState.isDatePickerVisible}
        onPress={() => actions.setDatePickerVisibility(true)}
        onConfirm={(date) => {
          actions.setSelectedDate(date);
          actions.setDatePickerVisibility(false);
        }}
        onCancel={() => actions.setDatePickerVisibility(false)}
      />

      <Text style={styles.footerNote}>
        * 이자 수익이 대납 가스비보다 적을 경우 원금에서 차감될 수 있습니다.
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.confirmButton, status.isPending && styles.disabledButton]} 
          onPress={actions.handleSubmit}
          disabled={status.isPending}
        >
          <Text style={styles.confirmButtonText}>
            {status.isPending ? '처리 중...' : '확인'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  label: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: gray[900], 
    marginBottom: 12 
  },
  footerNote: { 
    marginTop: 'auto', 
    marginBottom: 16, 
    fontSize: 12, 
    color: gray[400] 
  },
  buttonContainer: { 
    marginBottom: 16 
  },
  confirmButton: {
    backgroundColor: common.primary, 
    borderRadius: 16, 
    height: 56,
    justifyContent: 'center', 
    alignItems: 'center',
  },
  disabledButton: { 
    backgroundColor: gray[400] 
  },
  confirmButtonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '700' 
  },
});