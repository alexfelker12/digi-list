import { ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cn } from "tailwind-variants";
import { AppHeader } from "./app-header";


interface ScreenLayoutProps extends React.ComponentProps<typeof ScrollView> {
  title: string;
  showBack?: boolean;
}
export function ScreenLayout({ title, showBack, className, ...props }: ScreenLayoutProps) {
  const { bottom } = useSafeAreaInsets();

  return (
    <View className="flex-1">
      <AppHeader title={title} showBack={showBack} />
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName={cn("p-4 flex-col gap-4", className)}
        contentContainerStyle={{ paddingBottom: bottom + 80 }}
        {...props}
      />
    </View>
  );
}
