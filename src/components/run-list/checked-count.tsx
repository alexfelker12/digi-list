import { checkedListItemsCountQueryOptions } from "@/lib/queries/list-item-queries";
import { useQuery } from "@tanstack/react-query";
import { Chip, useThemeColor } from "heroui-native";
import { ActivityIndicator, View } from "react-native";
import Animated, { Easing, interpolate, interpolateColor, useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';
import { Icon } from "../icon";


type CheckedCountProps = {
  listId: number
}
export function CheckedCount({ listId }: CheckedCountProps) {
  const { data: checkedCount, isPending } = useQuery(checkedListItemsCountQueryOptions(listId))

  if (isPending || !checkedCount) return <ActivityIndicator size={12} />

  return <CheckedCountInner checkedCount={checkedCount} />
}

type CheckedCountInnerProps = {
  checkedCount: { checked: number; total: number }
}
function CheckedCountInner({ checkedCount }: CheckedCountInnerProps) {
  // derived state
  const { checked, total } = checkedCount
  const isListCompleted = checked === total

  // theme colors
  const [defaultColor, defaultForeground, successSoft, successSoftForeground] =
    useThemeColor(["default", "default-foreground", "success-soft", "success-soft-foreground"])

  // animation progress
  const iconProgress = useDerivedValue(() =>
    withTiming(isListCompleted ? 1 : 0, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    })
  );

  // transition from default to success
  const wrapperStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(iconProgress.value, [0, 1], [defaultColor, successSoft]),
  }))

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(iconProgress.value, [0, 1], [defaultForeground, successSoftForeground]),
  }))

  // icon switch with scale/opacity transition
  const radioStyle = useAnimatedStyle(() => ({
    opacity: 1 - iconProgress.value,
    transform: [{ scale: interpolate(iconProgress.value, [0, 1], [1, 0.5]) }],
  }))

  const checkStyle = useAnimatedStyle(() => ({
    opacity: iconProgress.value,
    transform: [{ scale: interpolate(iconProgress.value, [0, 1], [0.5, 1]) }],
  }))

  return (
    // Animated.View wraps Chip to handle backgroundColor animation
    <Animated.View style={wrapperStyle} className="rounded-full">
      <Chip variant="soft" size="lg" className="flex-col gap-0 pt-0.5 pb-1.5 bg-transparent" onPress={() => { }}>
        <Animated.View className="flex-row items-center gap-1">

          {/* icon container – fixed size holds both icons absolutely */}
          <View className="size-3">
            <Animated.View className="absolute" style={radioStyle}>
              <Icon name="radio-button-off" className="size-3" />
            </Animated.View>
            <Animated.View className="absolute" style={checkStyle}>
              <Icon name="checkmark-circle" className="size-3 text-success" />
            </Animated.View>
          </View>

          {/* animated label text color – Chip.Label wraps Animated.Text */}
          <Chip.Label>
            <Animated.Text style={labelStyle}>
              {checked}/{total} Produkte abgehackt
            </Animated.Text>
          </Chip.Label>

        </Animated.View>

        {/* progress bar */}
        <View className="flex-row">
          <RunProgress checked={checked} total={total} />
        </View>
      </Chip>
    </Animated.View>
  );
}

type RunProgressProps = {
  total: number
  checked: number
}
const calcProgress = ({ checked, total }: RunProgressProps) => ((checked / total) * 100)
function RunProgress({ checked, total }: RunProgressProps) {
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
