import { Text } from "@/components/text";
import { Spinner } from "heroui-native/spinner";
import { View } from "react-native";


export function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-background">
      <Spinner size="lg" />
      <Text className="text-muted text-sm">Wird geladen…</Text>
    </View>
  );
}
