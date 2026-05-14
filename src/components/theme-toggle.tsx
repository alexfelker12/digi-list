import { Button } from 'heroui-native/button';
import { MoonIcon, SunIcon } from "lucide-react-native";
import { Uniwind, useUniwind } from 'uniwind';
import { Icon } from "./icon";


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
          <Icon icon={SunIcon} />
        ) : (
          <Icon icon={MoonIcon} />
        )}
      </Button.Label>
    </Button>
  );
}
