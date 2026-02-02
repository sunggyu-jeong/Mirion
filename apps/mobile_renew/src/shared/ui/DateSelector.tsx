import { formatYMD } from "@/shared/lib";
import { common, gray } from "@/shared/styles";
import { addDays } from "date-fns";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

interface DateSelectorProps {
  date: Date;
  duration: number;
  isVisible: boolean;
  onPress: () => void;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
}

export const DateSelector = ({ 
  date, 
  duration, 
  isVisible, 
  onPress, 
  onConfirm, 
  onCancel 
}: DateSelectorProps) => {
  return (
    <>
      <TouchableOpacity style={styles.dateButton} onPress={onPress}>
        <Text style={styles.dateText}>
          {formatYMD(date)} <Text style={styles.durationText}>({duration}일간)</Text>
        </Text>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={isVisible}
        mode="date"
        date={date}
        minimumDate={addDays(new Date(), 7)}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </>
  );
};

const styles = StyleSheet.create({
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: common.white,
    padding: 16,
    borderRadius: 16,
    height: 64,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: gray[900],
  },
  durationText: {
    color: gray[500],
    fontWeight: '400',
  },
  arrow: {
    fontSize: 20,
    color: gray[400],
  },
});