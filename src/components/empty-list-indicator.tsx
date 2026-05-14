import { View } from "react-native";
import { Text } from "./text";


export function EmptyListIndicator({ message }: { message: string }) {
  return (
    <View className="flex-1 justify-center items-center p-4">
      <Text className="text-muted italic">{message}</Text>
    </View>
  );
}
