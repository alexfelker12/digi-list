import { Spinner } from "heroui-native/spinner";
import { View } from "react-native";
import { cn } from "tailwind-variants";


export function CenteredSpinner({ size = "lg", className, ...props }: React.ComponentProps<typeof Spinner>) {
  return (
    <View className={cn("flex-1 flex-row justify-center items-center", className)}>
      <Spinner size={size} {...props} />
    </View>
  );
}
