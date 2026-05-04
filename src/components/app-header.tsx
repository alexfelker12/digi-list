import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Button } from "heroui-native/button";
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemeToggle } from "./theme-toggle";


interface AppHeaderProps {
  title: string;
  showBack?: boolean;
}
export function AppHeader({ title, showBack }: AppHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-white dark:bg-black border-b border-border"
      style={{ paddingTop: insets["top"], elevation: 4, }}
    >
      <View className="flex-row items-center px-4 py-2 gap-2">

        {showBack && (
          <Button
            size="sm"
            variant="outline"
            isIconOnly
            onPress={() => router.back()}
          >
            <Button.Label>
              <Ionicons name="chevron-back" size={24} />
            </Button.Label>
          </Button>
        )}

        <View className="flex-1">
          <Text className="text-xl font-semibold text-foreground" numberOfLines={1}>
            {title}
          </Text>
        </View>

        <ThemeToggle />

      </View>
    </View>
  );
}
