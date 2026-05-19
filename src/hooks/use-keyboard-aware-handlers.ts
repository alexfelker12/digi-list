import { useBottomSheetAwareHandlers } from "heroui-native"


export function useKeyboardAwareHandlers() {
  try {
    const { onFocus } = useBottomSheetAwareHandlers()
    return { onFocus }
  } catch {
    return {
      onFocus: () => { },
    }
  }
}
