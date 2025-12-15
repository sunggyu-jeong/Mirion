import { store } from '@/src/composition/store';
import React from 'react';
import { Provider } from 'react-redux';

interface Props {
  children: React.ReactNode;
}

export const StoreProvider = ({ children }: Props) => {
  return <Provider store={store}>{children}</Provider>;
};
