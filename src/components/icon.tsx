import { cn } from "heroui-native";
import { LucideIcon as LucideIconComponent, LucideProps } from "lucide-react-native";
import { useResolveClassNames } from "uniwind";


type IconProps = LucideProps & {
  icon: LucideIconComponent
}
export function Icon({
  icon: LucideIcon,
  className,
  style,
  size = 20,
  ...props
}: IconProps) {
  const classNameStyles = useResolveClassNames(cn(
    "text-foreground",
    className
  ) ?? "")

  return (
    <LucideIcon
      style={[classNameStyles, style]}
      size={size}
      {...props}
    />
  );
}
