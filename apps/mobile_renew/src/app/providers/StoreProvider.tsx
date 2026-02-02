import { persistor, store } from '@/app/store';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

interface Props {
  children: React.ReactNode;
}

const LoadingFallback = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#2563eb" />
  </View>
)

export const StoreProvider = ({ children }: Props) => {
  return <Provider store={store}>
    <PersistGate loading={<LoadingFallback />} persistor={persistor}>{children}</PersistGate></Provider>
};
