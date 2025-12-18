import { LockupCard } from '@/src/widgets/lockup-card/ui/LockupCard';
import { WalletHeader } from '@/src/widgets/wallet-header/ui/WalletHeader';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";

export const HomePage = () => {
    //fixme: 데이터 연동 필요
    const hasLockup = true; 

    return (
        <SafeAreaView className="flex-1 bg-black">
            <ScrollView>
                <WalletHeader />

                <View className="mt-8">
                    {hasLockup ? (
                        <LockupCard 
                            amount="0.5" 
                            unlockTime={1740000000} 
                            onWithdrawPress={() => console.log('TODO:: Trigger Withdraw Feature')} 
                        />
                    ) : (
                        <View className="mx-5">
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};