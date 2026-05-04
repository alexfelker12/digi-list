import { Text as TextRN } from "react-native";
import { cn } from "tailwind-variants";

export function Text({ className, ...props }: React.ComponentProps<typeof TextRN>) {
  return <TextRN className={cn("text-foreground", className)} {...props} />
}
