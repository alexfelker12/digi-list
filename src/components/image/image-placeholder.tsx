import { ImageOffIcon } from "lucide-react-native";
import { View } from "react-native";
import { cn } from "tailwind-variants";
import { Icon } from "../icon";


export function ImagePlaceholder({ className }: { className?: string }) {
  return (
    <View className={cn("flex-1 items-center justify-center bg-muted/10 rounded-lg", className)}>
      <Icon icon={ImageOffIcon} size={20} className="text-muted" />
    </View>
  );
}