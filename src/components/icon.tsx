import { Ionicons } from "@expo/vector-icons";
import { cn } from "tailwind-variants";
import { withUniwind } from "uniwind";


const StyledIcon = withUniwind(Ionicons)
export function Icon({ className, ...props }: React.ComponentProps<typeof StyledIcon>) {
  return <StyledIcon className={cn("size-5", className)} {...props} />;
}
