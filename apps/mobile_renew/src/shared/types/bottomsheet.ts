import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";

export interface BottomSheetHandler extends Pick<BottomSheetMethods, "expand" | "collapse" | "close" | "snapToIndex"> {}