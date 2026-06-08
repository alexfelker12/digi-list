import { Alert } from "heroui-native/alert";
import { Spinner } from "heroui-native/spinner";


export function AlertIndicator({ isProcessing }: { isProcessing?: boolean }) {
  return (
    isProcessing ? (
      <Alert.Indicator className="pt-0">
        <Spinner>
          <Spinner.Indicator iconProps={{ width: 20, height: 20 }} />
        </Spinner>
      </Alert.Indicator >
    ) : (
      <Alert.Indicator />
    )
  )
}
