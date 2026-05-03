import { Button } from 'heroui-native/button';
import { Uniwind, useUniwind } from 'uniwind';

export function ThemeToggle() {
  const { theme } = useUniwind();

  return (
    <Button
      onPress={() => Uniwind.setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      <Button.Label>
        Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode
      </Button.Label>
    </Button>
  );
}
