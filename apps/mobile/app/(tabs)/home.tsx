import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomePage() {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <Text>홈</Text>
    </SafeAreaView>
  );
}
