import { Button } from "heroui-native/button";
import { MoonIcon, SunIcon } from "lucide-react-native";
import { View } from "react-native";
import Animated, { Easing, interpolate, useAnimatedStyle, useDerivedValue, withTiming } from "react-native-reanimated";
import { Uniwind, useUniwind } from "uniwind";
import { Icon } from "./icon";


export function ThemeToggle() {
  const { theme } = useUniwind();

  const iconProgress = useDerivedValue(() =>
    withTiming(theme === "light" ? 1 : 0, {
      duration: 150,
      easing: Easing.out(Easing.cubic),
    })
  )

  const lightModeStyle = useAnimatedStyle(() => ({
    opacity: iconProgress.value,
    transform: [{ scale: interpolate(iconProgress.value, [0, 1], [0.5, 1]) }],
  }))

  const darkModeStyle = useAnimatedStyle(() => ({
    opacity: 1 - iconProgress.value,
    transform: [{ scale: interpolate(iconProgress.value, [0, 1], [1, 0.5]) }],
  }))

  return (
    <Button
      onPress={() => Uniwind.setTheme(theme === "light" ? "dark" : "light")}
      size="sm"
      variant="outline"
      animation={{ scale: "disabled" }}
      isIconOnly
    >
      <View className="relative size-5">
        <Animated.View className="absolute" style={lightModeStyle}>
          <Icon icon={SunIcon} />
        </Animated.View>
        <Animated.View className="absolute" style={darkModeStyle}>
          <Icon icon={MoonIcon} />
        </Animated.View>
      </View>
    </Button>
  );
}
