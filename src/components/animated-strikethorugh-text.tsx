import { useThemeColor } from "heroui-native/hooks";
import { useEffect, useRef } from "react";
import { Animated, Easing, View } from 'react-native';


type StrikethroughTextProps = {
  isChecked: boolean
  children: string
  className?: string
}
export function StrikethroughText({ children, isChecked, className }: StrikethroughTextProps) {
  const [muted, accent] = useThemeColor(['muted', 'accent'])

  // muted with 75% opacity as hex e.g.:  #888888 → #888888BF (75% = 0xBF)
  const mutedAlpha = muted + 'BF'

  const progress = useRef(new Animated.Value(isChecked ? 1 : 0)).current

  useEffect(() => {
    Animated.timing(progress, {
      toValue: isChecked ? 1 : 0,
      duration: 150,
      easing: Easing.out(Easing.cubic), // aus 'react-native'
      useNativeDriver: false,
    }).start()
  }, [isChecked])

  const textColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [accent, mutedAlpha],
  })

  const lineWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  })

  const lineColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', mutedAlpha],
  })

  return (
    <View className="relative justify-center">
      <Animated.Text style={{ color: textColor }} className={className} numberOfLines={1}>
        {children}
      </Animated.Text>

      <Animated.View
        style={{
          position: 'absolute',
          height: 1.5,
          left: 0,
          width: lineWidth,
          backgroundColor: lineColor,
        }}
      />
    </View>
  );
}
