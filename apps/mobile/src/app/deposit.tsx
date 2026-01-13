import { common, gray } from "@/src/shared";
import { DepositForm } from "@/src/widgets/deposit-modal/ui";
import { useNavigation } from "@react-navigation/native";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const DepositPage = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>예치 설정</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <DepositForm />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: common.white 
  },
  header: {
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 16, 
    height: 56, 
    backgroundColor: common.white,
  },
  backButton: { 
    padding: 4 
  },
  backIcon: { 
    fontSize: 32, 
    fontWeight: '300', 
    color: gray[900], 
    marginTop: -4 
  },
  headerTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: gray[900] 
  },
  content: { 
    flex: 1, 
    padding: 20 
  },
});