import { useDialog, useDialogAnimation } from "heroui-native";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  interpolate,
  useDerivedValue,
} from "react-native-reanimated";
import { useUniwind } from "uniwind";
import { AnimatedBlurView } from "./animated-blur-view";


const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const DialogBlurOverlay = () => {
  const { theme } = useUniwind();
  const { isOpen, onOpenChange } = useDialog();
  const { progress } = useDialogAnimation();

  const blurIntensity = useDerivedValue(() => {
    return interpolate(progress.get(), [0, 1, 2], [0, 40, 0]);
  });

  if (!isOpen) {
    return null;
  }

  return (
    <AnimatedPressable
      style={StyleSheet.absoluteFill}
      onPress={() => onOpenChange(false)}
    >
      <AnimatedBlurView
        blurIntensity={blurIntensity}
        tint={theme === "dark" ? "dark" : "systemUltraThinMaterialDark"}
        style={StyleSheet.absoluteFill}
      />
    </AnimatedPressable>
  );
};
