import { Ionicons } from "@expo/vector-icons";
import { cn } from "tailwind-variants";
import { withUniwind } from "uniwind";


export function Icon({ className, ...props }: React.ComponentProps<typeof Ionicons>) {
  const StyledIcon = withUniwind(Ionicons)
  return <StyledIcon className={cn("size-5", className)} {...props} />;
}
