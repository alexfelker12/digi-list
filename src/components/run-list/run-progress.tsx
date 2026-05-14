import { View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';


type RunProgressProps = {
  total: number
  checked: number
}
const calcProgress = ({ checked, total }: RunProgressProps) => ((checked / total) * 100)
export function RunProgress({ checked, total }: RunProgressProps) {
  const progressValue = calcProgress({ checked, total });

  const progress = useDerivedValue(() =>
    withTiming(progressValue, {
      duration: 150,
      easing: Easing.out(Easing.cubic),
    })
  );

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  return (
    <View className="relative h-0.5 rounded-full flex-1 bg-muted overflow-hidden">
      <Animated.View
        className="absolute h-0.5 rounded-full bg-success"
        style={animatedStyle}
      />
    </View>
  );
}
