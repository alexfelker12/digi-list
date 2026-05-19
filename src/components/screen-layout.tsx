import { View } from "react-native";
import { cn } from "tailwind-variants";
import { AppHeader } from "./app-header";


interface ScreenLayoutProps extends React.ComponentProps<typeof View> {
  title: string;
  showBack?: boolean;
}
export function ScreenLayout({ title, showBack, className, ...props }: ScreenLayoutProps) {

  return (
    <View className="flex-1 relative">
      <AppHeader title={title} showBack={showBack} />
      <View
        className={cn("flex-1 bg-background p-4 pb-safe flex-col gap-4", className)}
        {...props}
      />
    </View>
  );
}

interface FloatingBottomContent extends React.ComponentProps<typeof View> { }
export function FloatingBottomContent({ className, ...props }: FloatingBottomContent) {
  return (
    <View
      className={cn(
        "absolute bottom-0 left-0 right-0 pb-safe bg-linear-to-t from-background via-background/50 to-background/0",
        className
      )}
      {...props}
    />
  );
}
