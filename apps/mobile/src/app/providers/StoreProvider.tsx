import { store } from "@/src/app/store";
import { Provider } from 'react-redux';
import React from "react";

interface Props {
    children: React.ReactNode;
}

export const StoreProvider = ({ children }: Props) => {
    return <Provider store={store}>{children}</Provider>;
}
