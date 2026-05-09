import { ScreenLayout } from "@/components/screen-layout";
import { Text } from "@/components/text";
import { View } from "react-native";


export default function ListDetailScreen() {
  // TODO: add adding list items here

  return (
    <ScreenLayout title="Details" showBack
      bottomContent={
        <View className="h-16 bg-red-200">
          {/* // TODO: save button here */}
        </View>
      }
    >
      <View className="pb-20">
        <Text>
          // TODO: list items here
        </Text>
      </View>
    </ScreenLayout>
  );
}
