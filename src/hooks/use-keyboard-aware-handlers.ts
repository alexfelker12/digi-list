import { useBottomSheetAwareHandlers } from "heroui-native/hooks"


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
