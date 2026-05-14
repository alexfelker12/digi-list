import { checkedListItemsCountQueryOptions } from "@/lib/queries/run-list-queries";
import { useListItems } from "@/screens/context/list-items-context";
import { useQuery } from "@tanstack/react-query";
import { Chip, useThemeColor } from "heroui-native";
import { ActivityIndicator, View } from "react-native";
import Animated, { Easing, interpolate, interpolateColor, useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';
import { Icon } from "../icon";
import { ListCompleteDialog } from "./list-complete-dialog";
import { RunProgress } from "./run-progress";


export function CheckedCount() {
  const { listId } = useListItems()
  const { data: checkedCount, isPending } = useQuery(checkedListItemsCountQueryOptions(listId))

  if (isPending || !checkedCount) return <ActivityIndicator size={12} />
  if (checkedCount.checked + checkedCount.total === 0) return <RunListEmpty />

  return <CheckedCountInner checkedCount={checkedCount} />
}

type CheckedCountInnerProps = {
  checkedCount: { checked: number; total: number }
}
function CheckedCountInner({ checkedCount }: CheckedCountInnerProps) {
  // derived state
  const { checked, total } = checkedCount
  const isListCompleted = checked === total
  const duration = 200
  // const isListCompletedDelayed = useDelayedState(isListCompleted, 500)

  // theme colors
  const [defaultColor, defaultForeground, successSoft, successSoftForeground] =
    useThemeColor(["default", "default-foreground", "success-soft", "success-soft-foreground"])

  // animation progress
  const iconProgress = useDerivedValue(() =>
    withTiming(isListCompleted ? 1 : 0, {
      duration,
      easing: Easing.out(Easing.cubic),
    })
  )

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
    <>
      {/* Animated.View wraps Chip to handle backgroundColor animation */}
      <Animated.View style={wrapperStyle} className="rounded-full">
        <Chip variant="soft" size="lg" className="flex-col gap-0 pt-0.5 pb-1.5 bg-transparent">
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

      <ListCompleteDialog isCompleted={isListCompleted} />
    </>
  );
}

function RunListEmpty() {
  return (
    <Chip
      variant="soft"
      color="default"
      size="lg"
      className="flex-col gap-0 pt-0.5 pb-1.5"
    >
      <Chip.Label>
        keine Produkte
      </Chip.Label>

      {/* mock progress bar, never gets updated */}
      <View className="flex-row">
        <RunProgress checked={0} total={1} />
      </View>
    </Chip>
  );
}
