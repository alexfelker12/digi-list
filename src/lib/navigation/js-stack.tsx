import { ParamListBase, StackNavigationState } from '@react-navigation/native';
import {
  createStackNavigator,
  StackCardInterpolationProps,
  StackNavigationEventMap,
  StackNavigationOptions,
  TransitionSpecs,
} from '@react-navigation/stack';
import { withLayoutContext } from 'expo-router';
import { Animated } from 'react-native';


const { Navigator } = createStackNavigator()

export const JsStack = withLayoutContext<
  StackNavigationOptions,
  typeof Navigator,
  StackNavigationState<ParamListBase>,
  StackNavigationEventMap
>(Navigator)

export const forHorizontalIOS = ({
  current,
  next,
  layouts,
}: StackCardInterpolationProps) => {
  const translateX = current.progress.interpolate({
    inputRange: [0, 1],
    outputRange: [layouts.screen.width, 0],
    extrapolate: 'clamp',
  })

  const prevTranslateX = next
    ? next.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -layouts.screen.width * 0.3],
      extrapolate: 'clamp',
    })
    : new Animated.Value(0)

  return {
    cardStyle: {
      transform: [{ translateX }],
    },
    containerStyle: {
      transform: [{ translateX: prevTranslateX }],
    },
  }
}

export const jsStackScreenOptions: StackNavigationOptions = {
  headerShown: false,
  gestureEnabled: true,
  gestureDirection: 'horizontal',
  transitionSpec: {
    open: TransitionSpecs.TransitionIOSSpec,
    close: TransitionSpecs.TransitionIOSSpec,
  },
  cardStyleInterpolator: forHorizontalIOS,
}
