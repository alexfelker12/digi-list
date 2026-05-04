import { Ionicons } from "@expo/vector-icons";
import { Button } from 'heroui-native/button';
import { Uniwind, useUniwind } from 'uniwind';


export function ThemeToggle() {
  const { theme } = useUniwind();

  return (
    <Button
      onPress={() => Uniwind.setTheme(theme === 'light' ? 'dark' : 'light')}
      size="sm"
      variant="outline"
      isIconOnly
    >
      <Button.Label>
        {theme === 'light' ? (
          <Ionicons name="sunny-outline" size={20} />
        ) : (
          <Ionicons name="moon-outline" size={20} />
        )}
      </Button.Label>
    </Button>
  );
}
