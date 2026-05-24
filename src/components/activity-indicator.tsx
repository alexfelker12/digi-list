import { ActivityIndicator as RNActivityIndicator } from "react-native";
import { cn } from "tailwind-variants";
import { withUniwind } from "uniwind";


const StyledActivityIndicator = withUniwind(RNActivityIndicator)
export function ActivityIndicator({ className, ...props }: React.ComponentProps<typeof RNActivityIndicator>) {
  return (
    <StyledActivityIndicator className={cn("text-accent", className)} {...props} />
  );
}
