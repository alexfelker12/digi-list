import { useListItems } from "@/screens/context/list-items-context";
import { View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';


type CalcProgressProps = {
  total: number
  checked: number
}
const calcProgress = ({ checked, total }: CalcProgressProps) => ((checked / total) * 100)
export function RunProgress() {
  const { checkedItemsCount: checked, totalItemsCount: total } = useListItems()

  const progressValue = calcProgress({ checked, total })

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
        className="absolute h-0.5 rounded-full bg-accent"
        style={animatedStyle}
      />
    </View>
  );
}
