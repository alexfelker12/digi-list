import { ScrollView, View } from "react-native";
import { cn } from "tailwind-variants";
import { AppHeader } from "./app-header";


interface ScreenLayoutProps extends React.ComponentProps<typeof ScrollView> {
  title: string;
  showBack?: boolean;
  bottomContent?: React.ReactNode
}
export function ScreenLayout({ title, showBack, bottomContent, className, ...props }: ScreenLayoutProps) {

  return (
    <View className="flex-1 relative">
      <AppHeader title={title} showBack={showBack} />
      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName={cn("p-4 pb-safe flex-col gap-4", className)}
        {...props}
      />

      {bottomContent && (
        <View className="absolute bottom-0 left-0 right-0 pb-safe bg-linear-to-t from-background via-background/50 to-background/0">
          {bottomContent}
        </View>
      )}
    </View>
  );
}
