import { Text } from "@/components/text";
import { ActivityIndicator, View } from "react-native";


export function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-background">
      <ActivityIndicator size="large" className="text-accent" />
      <Text className="text-muted text-sm">Wird geladen…</Text>
    </View>
  );
}
