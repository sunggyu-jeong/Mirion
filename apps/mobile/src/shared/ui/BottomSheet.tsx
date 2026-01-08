import { common, gray } from "@/src/shared/styles";
import type { BottomSheetBackdropProps, BottomSheetProps } from "@gorhom/bottom-sheet";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { forwardRef, useCallback } from "react";
import { StyleSheet } from "react-native";

export interface BottomSheetWrapperProps extends Omit<BottomSheetProps, 'children' | 'snapPoints'> {
  children: React.ReactNode;
  snapPoints: ReadonlyArray<string | number> | Array<string | number>;
  isDetached?: boolean;
}

const BottomSheetWrapper = forwardRef<BottomSheet, BottomSheetWrapperProps>(
  ({ children, snapPoints, isDetached = false, style, ...rest }, ref) => {
    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
          style={[props.style, styles.overlay]}
        />
      ),
      []
    );

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints as (string | number)[]}
        backdropComponent={renderBackdrop}
        backgroundStyle={[styles.background, isDetached && styles.detached, style]}
        handleIndicatorStyle={styles.indicator}
        enablePanDownToClose
        {...rest}
      >
        <BottomSheetView style={styles.content}>{children}</BottomSheetView>
      </BottomSheet>
    );
  }
);

BottomSheetWrapper.displayName = 'BottomSheetWrapper';

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: common.overlay,
  },
  background: {
    backgroundColor: common.white,
    borderRadius: 24,
  },
  detached: {
    marginHorizontal: 16,
  },
  content: {
    flex: 1,
  },
  indicator: {
    backgroundColor: gray[300],
    width: 45,
    height: 4,
    borderRadius: 10,
  },
});

export default BottomSheetWrapper;