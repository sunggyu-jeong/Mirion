import BottomSheet from "@gorhom/bottom-sheet";
import { useCallback, useMemo, useRef } from "react";

interface UseBottomSheetProps {
  snapPoints: Array<string | number>;
}
export const useBottomSheet = ({ snapPoints: initialSnapPoints }: UseBottomSheetProps) => {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => initialSnapPoints, [initialSnapPoints]);

  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);

  return {
    sheetRef,
    snapPoints,
    handleSheetChanges,
  }
}
