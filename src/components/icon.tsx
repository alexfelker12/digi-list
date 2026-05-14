import { cn } from "heroui-native";
import { LucideIcon, LucideProps } from "lucide-react-native";
import { withUniwind } from "uniwind";


type IconProps = LucideProps & {
  icon: LucideIcon
  size?: number
}
export function Icon({ icon, size = 20, className, ...props }: IconProps) {
  const StyledIcon = withUniwind(icon)

  return (
    <StyledIcon
      className={cn("text-foreground", className)}
      size={size}
      {...props}
    />
  );
}
